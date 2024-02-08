import React, { useEffect, useState } from "react";
import { Card, CardBody, Heading, Image, Link, SimpleGrid, Skeleton, Stack, Text } from "@chakra-ui/react";
import { DataNft } from "@itheum/sdk-mx-data-nft/out";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import BigNumber from "bignumber.js";
import { Link as ReactRouterLink } from "react-router-dom";
import { getFavoritesFromBackendApi, getHealthCheckFromBackendApi, getRecentOffersFromBackendApi } from "libs/MultiversX";
import { getNftsByIds } from "libs/MultiversX/api";
import { DataNftMarketContract } from "libs/MultiversX/dataNftMarket";
import { DataNftMintContract } from "libs/MultiversX/dataNftMint";
import { DataNftCondensedView } from "libs/MultiversX/types";
import { convertWeiToEsdt, hexZero, sleep } from "libs/utils";
import { useAccountStore, useMarketStore } from "store";
import { NoDataHere } from "./NoDataHere";
import { Favourite } from "../Favourite/Favourite";

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

const RecentDataNFTs = ({ headingText, headingSize }: { headingText: string; headingSize?: string }) => {
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();
  const { chainID } = useGetNetworkConfig();
  const [loadedOffers, setLoadedOffers] = useState<boolean>(false);
  const [latestOffers, setLatestOffers] = useState<DataNftCondensedView[]>(latestOffersSkeleton);
  const { tokenLogin } = useGetLoginInfo();
  // console.log(latestOffers);
  const marketRequirements = useMarketStore((state) => state.marketRequirements);
  const favoriteNfts = useAccountStore((state) => state.favoriteNfts);
  const updateFavoriteNfts = useAccountStore((state) => state.updateFavoriteNfts);

  const marketContract = new DataNftMarketContract(chainID);
  const mintContract = new DataNftMintContract(chainID);

  useEffect(() => {
    apiWrapper();
  }, [marketRequirements]);

  useEffect(() => {
    if (isMxLoggedIn) {
      getFavourite();
    } else {
      updateFavoriteNfts([]);
    }
  }, [favoriteNfts.length]);

  const getFavourite = async () => {
    if (tokenLogin?.nativeAuthToken) {
      const bearerToken = tokenLogin?.nativeAuthToken;
      const getFavourites = await getFavoritesFromBackendApi(chainID, bearerToken);
      // console.log(getFavourites, "FAVO");
      updateFavoriteNfts(getFavourites);
    }
  };

  const apiWrapper = async () => {
    DataNft.setNetworkConfig(chainID === "1" ? "mainnet" : "devnet");

    try {
      const isApiUp = await getHealthCheckFromBackendApi(chainID);

      if (isApiUp) {
        const offers = await getRecentOffersFromBackendApi(chainID);
        const recentNonces = offers.map((nft: any) => ({ nonce: nft.offered_token_nonce }));
        const dataNfts: DataNft[] = await DataNft.createManyFromApi(recentNonces);

        const _latestOffers: DataNftCondensedView[] = [];

        offers.forEach((offer: any) => {
          const matchingDataNft = dataNfts.find(
            (dataNft: DataNft) => dataNft.nonce === offer.offered_token_nonce && dataNft.collection === offer.offered_token_identifier
          );
          if (matchingDataNft) {
            const tokenAmount = convertWeiToEsdt(new BigNumber(offer.wanted_token_amount)).toNumber();
            _latestOffers.push({
              data_nft_id: matchingDataNft?.tokenIdentifier,
              offered_token_identifier: offer.offered_token_identifier,
              offered_token_nonce: offer.offered_token_nonce,
              offer_index: offer.index,
              offered_token_amount: offer.offered_token_amount,
              quantity: offer.quantity,
              wanted_token_amount: offer.wanted_token_amount,
              creator: offer?.creator,
              tokenName: matchingDataNft?.tokenName,
              title: offer?.title,
              nftImgUrl: matchingDataNft?.nftImgUrl,
              royalties: matchingDataNft?.royalties,
              feePerSFT: tokenAmount,
            });
          }
        });
        setLatestOffers(_latestOffers);
        setLoadedOffers(true);
      } else {
        throw new Error("API is down");
      }
    } catch (error) {
      const highestOfferIndex = await marketContract.getLastValidOfferId();

      // get latest 10 offers from the SC
      const startIndex = Math.max(highestOfferIndex - 40, 0);
      const stopIndex = highestOfferIndex;

      const offers = await marketContract.viewOffers(startIndex, stopIndex);
      const slicedOffers = offers.slice(0, 10);
      // get these offers metadata from the API
      const nftIds = slicedOffers.map((offer) => `${offer.offeredTokenIdentifier}-${hexZero(offer.offeredTokenNonce)}`);
      const dataNfts = await getNftsByIds(nftIds, chainID);

      // merge the offer data and meta data
      const _latestOffers: DataNftCondensedView[] = [];

      slicedOffers.forEach((offer, idx) => {
        const _nft = dataNfts.find((nft) => `${offer.offeredTokenIdentifier}-${hexZero(offer.offeredTokenNonce)}` === nft.identifier);

        if (_nft !== undefined) {
          const _nftMetaData = mintContract.decodeNftAttributes(_nft, idx);

          const tokenAmount = convertWeiToEsdt(new BigNumber(offer.wantedTokenAmount)).toNumber();

          _latestOffers.push({
            data_nft_id: _nftMetaData.id,
            offered_token_identifier: offer.offeredTokenIdentifier,
            offered_token_nonce: offer.offeredTokenNonce,
            offer_index: offer.index,
            offered_token_amount: offer.offeredTokenAmount,
            quantity: offer.quantity,
            wanted_token_amount: offer.wantedTokenAmount,
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
    }
  };

  let skeletonHeight = { base: "260px", md: "190px", "2xl": "220px" };

  if (isMxLoggedIn) {
    skeletonHeight = { base: "240px", md: "170px", "2xl": "190px" };
  }

  return (
    <>
      <Heading as="h4" fontFamily="Clash-Medium" fontWeight="semibold" size={(headingSize as any) || "lg"} mb="5" textAlign={["center", "initial"]}>
        {headingText}
      </Heading>

      {loadedOffers && latestOffers.length === 0 && <NoDataHere imgFromTop="5rem" />}

      <SimpleGrid spacing={4} templateColumns="repeat(auto-fill, minmax(240px, 1fr))">
        {latestOffers.map((item: DataNftCondensedView, idx: number) => {
          return (
            <Card key={idx} maxW="sm" variant="outline" backgroundColor="none" border=".01rem solid transparent" borderColor="#00C79740" borderRadius="0.75rem">
              <CardBody pb={10}>
                <Skeleton height={skeletonHeight} isLoaded={loadedOffers} fadeDuration={1} display="flex" justifyContent={"center"}>
                  <Link to={`/datanfts/marketplace/${item.data_nft_id}/offer-${item.offer_index}`} as={ReactRouterLink}>
                    <Image src={item.nftImgUrl} alt="Data NFT Image" borderRadius="lg" h={{ base: "250px", md: "200px" }} />
                  </Link>
                </Skeleton>
                <Skeleton height="76px" isLoaded={loadedOffers} fadeDuration={2}>
                  <Stack mt={isMxLoggedIn ? "12" : "4"}>
                    <Heading size="md" noOfLines={1} fontFamily="Clash-Medium">
                      {item.title}
                    </Heading>
                    <Text fontSize="md">Supply Available : {item.quantity}</Text>
                    <Text fontSize="sm">Unlock for {item.feePerSFT === 0 ? "Free" : `${item.feePerSFT} ITHEUM/NFT`}</Text>
                    <Favourite
                      chainID={chainID}
                      tokenIdentifier={item.data_nft_id}
                      bearerToken={tokenLogin?.nativeAuthToken}
                      favouriteItems={favoriteNfts}
                      getFavourites={getFavourite}
                    />
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
