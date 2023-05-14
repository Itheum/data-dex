import React, { useState, useEffect } from "react";
import { Box, Heading, Image, Text, Link, Card, CardBody, Stack, SimpleGrid, Skeleton, useColorMode } from "@chakra-ui/react";
import { useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import BigNumber from "bignumber.js";
import { getNftsByIds } from "libs/MultiversX/api";
import { DataNftMarketContract } from "libs/MultiversX/dataNftMarket";
import { DataNftMintContract } from "libs/MultiversX/dataNftMint";
import { hexZero } from "libs/MultiversX/tokenUtils.js";
import { DataNftCondensedView } from "libs/MultiversX/types";
import { sleep, convertWeiToEsdt, styleStrings } from "libs/utils";
import { useChainMeta } from "store/ChainMetaContext";

const latestOffersSkeleton: DataNftCondensedView[] = [];

// create the placeholder offers for skeleton loading
for (let i = 0; i < 10; i++) {
  latestOffersSkeleton.push({
    data_nft_id: "",
    offered_token_identifier: "",
    offered_token_nonce: 0,
    offer_index: 0,
    offered_token_amount: "",
    quantity: 0,
    wanted_token_amount: "",
    creator: "",
    tokenName: "",
    title: "",
    nftImgUrl: "",
    royalties: 0,
    feePerSFT: 0,
  });
}

const RecentDataNFTs = ({
  headingText,
  networkId,
  headingSize,
  borderMultiColorStyle,
}: {
  headingText: string;
  networkId: string;
  headingSize?: string;
  borderMultiColorStyle?: boolean;
}) => {
  const { chainMeta: _chainMeta } = useChainMeta();
  const { colorMode } = useColorMode();
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();

  const [loadedOffers, setLoadedOffers] = useState<boolean>(false);
  const [latestOffers, setLatestOffers] = useState<DataNftCondensedView[]>(latestOffersSkeleton);

  const marketContract = new DataNftMarketContract(networkId);
  const mintContract = new DataNftMintContract(networkId);

  useEffect(() => {
    if (_chainMeta?.networkId) {
      (async () => {
        const highestOfferIndex = await marketContract.getLastValidOfferId(); // 53

        // get latest 10 offers from the SC
        const startIndex = Math.max(highestOfferIndex - 25, 0); // 42
        const stopIndex = highestOfferIndex; // 53

        const offers = await marketContract.viewOffers(startIndex, stopIndex);
        const slicedOffers = offers.slice(0, 10);
        // get these offers metadata from the API
        const nftIds = slicedOffers.map((offer) => `${offer.offered_token_identifier}-${hexZero(offer.offered_token_nonce)}`);
        const dataNfts = await getNftsByIds(nftIds, networkId);

        // merge the offer data and meta data
        const _latestOffers: DataNftCondensedView[] = [];

        slicedOffers.forEach((offer, idx) => {
          const _nft = dataNfts.find((nft) => `${offer.offered_token_identifier}-${hexZero(offer.offered_token_nonce)}` === nft.identifier);

          if (_nft !== undefined) {
            const _nftMetaData = mintContract.decodeNftAttributes(_nft, idx);

            const tokenAmount = convertWeiToEsdt(new BigNumber(offer.wanted_token_amount)).toNumber();

            _latestOffers.push({
              data_nft_id: _nftMetaData.id,
              offered_token_identifier: offer.offered_token_identifier,
              offered_token_nonce: offer.offered_token_nonce,
              offer_index: offer.index,
              offered_token_amount: offer.offered_token_amount,
              quantity: offer.quantity,
              wanted_token_amount: offer.wanted_token_amount,
              creator: _nftMetaData.creator,
              tokenName: _nftMetaData.tokenName,
              title: _nftMetaData.title,
              nftImgUrl: _nftMetaData.nftImgUrl,
              royalties: _nftMetaData.royalties,
              feePerSFT: tokenAmount,
            });
          }
        });

        await sleep(1);

        setLatestOffers(_latestOffers);
        setLoadedOffers(true);
      })();
    }
  }, [_chainMeta]);

  let gradientBorderForTrade = styleStrings.gradientBorderMulticolorToBottomRight;

  if (colorMode === "light") {
    gradientBorderForTrade = styleStrings.gradientBorderMulticolorToBottomRightLight;
  }

  return (
    <>
      <Heading as="h4" fontWeight="semibold" size={(headingSize as any) || "lg"} mb="5" textAlign={["center", "initial"]}>
        {headingText}
      </Heading>

      {loadedOffers && latestOffers.length === 0 && (
        <Box minHeight={200}>
          <Text>No recent offers available for display...</Text>
        </Box>
      )}

      <SimpleGrid spacing={4} templateColumns="repeat(auto-fill, minmax(220px, 1fr))">
        {latestOffers.map((item: DataNftCondensedView, idx: number) => {
          return (
            <Card key={idx} maxW="sm" variant="outline" backgroundColor="none" border=".01rem solid transparent" borderColor="#00C79740" borderRadius="0.75rem">
              <CardBody>
                <Skeleton height={{ base: "300px", md: "200px" }} isLoaded={loadedOffers} fadeDuration={1} display="flex" justifyContent={"center"}>
                  <Link href={`/datanfts/marketplace/${item.data_nft_id}/offer-${item.offer_index}`}>
                    <Image src={item.nftImgUrl} alt="Green double couch with wooden legs" borderRadius="lg" />
                  </Link>
                </Skeleton>
                <Skeleton height="76px" isLoaded={loadedOffers} fadeDuration={2}>
                  <Stack mt={isMxLoggedIn ? "12" : "4"}>
                    <Heading size="md" noOfLines={1}>
                      {item.title}
                    </Heading>
                    <Text fontSize="md">Supply Available : {item.quantity}</Text>
                    <Text fontSize="sm">Unlock for {item.feePerSFT === 0 ? "Free" : `${item.feePerSFT} ITHEUM/NFT`}</Text>
                  </Stack>
                </Skeleton>
              </CardBody>
            </Card>
          );
        })}
      </SimpleGrid>
    </>
  );
};

export default RecentDataNFTs;
