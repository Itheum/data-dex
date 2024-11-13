import React, { useEffect, useState } from "react";
import { Card, CardBody, Heading, Link, SimpleGrid, Skeleton, Stack, Text } from "@chakra-ui/react";
import { DataNft, Offer, createTokenIdentifier } from "@itheum/sdk-mx-data-nft/out";
import { Address } from "@multiversx/sdk-core/out";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { Link as ReactRouterLink } from "react-router-dom";
import NftMediaComponent from "components/NftMediaComponent";
import { IS_DEVNET, getFavoritesFromBackendApi, getHealthCheckFromBackendApi, getRecentOffersFromBackendApi } from "libs/MultiversX";
import { getMvxRpcApi } from "libs/MultiversX/api";
import { RecentDataNFTType } from "libs/types";
import { convertWeiToEsdt } from "libs/utils";
import { useAccountStore, useMarketStore } from "store";
import { NoDataHere } from "./NoDataHere";
import { Favourite } from "../Favourite/Favourite";

const latestOffersSkeleton: RecentDataNFTType[] = [];

// create the placeholder offers for skeleton loading
for (let i = 0; i < 10; i++) {
  latestOffersSkeleton.push({
    offeredTokenIdentifier: "",
    offeredTokenNonce: 0,
    offeredTokenAmount: 0,
    index: 0,
    quantity: 0,
    wantedTokenIdentifier: "",
    wantedTokenNonce: 0,
    wantedTokenAmount: 0,
    creator: new Address(""),
    owner: new Address(""),
    tokenName: "",
    title: "",
    nftImgUrl: "",
    royalties: 0,
  });
}

const RecentDataNFTs = ({ headingText, headingSize }: { headingText: string; headingSize?: string }) => {
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();
  const {
    network: { chainId: chainID },
  } = useGetNetworkConfig();
  const [loadedOffers, setLoadedOffers] = useState<boolean>(false);
  const [latestOffers, setLatestOffers] = useState<RecentDataNFTType[]>(latestOffersSkeleton);
  const { tokenLogin } = useGetLoginInfo();
  const marketRequirements = useMarketStore((state) => state.marketRequirements);
  const favoriteNfts = useAccountStore((state) => state.favoriteNfts);
  const updateFavoriteNfts = useAccountStore((state) => state.updateFavoriteNfts);
  const [web2ApiDown, setWeb2ApiDown] = useState<boolean>(false);

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
      updateFavoriteNfts(getFavourites);
    }
  };

  const apiWrapper = async () => {
    DataNft.setNetworkConfig(IS_DEVNET ? "devnet" : "mainnet", `https://${getMvxRpcApi(chainID)}`);

    try {
      const isApiUp = await getHealthCheckFromBackendApi(chainID);

      if (isApiUp) {
        const offers = await getRecentOffersFromBackendApi(chainID);
        const recentNonces = offers.map((nft: any) => ({ nonce: nft.offeredTokenNonce }));

        console.log("Debug ABOUT TO HIT RecentDataNFTs:createManyFromApi");
        const dataNfts: DataNft[] = await DataNft.createManyFromApi(recentNonces);
        const _latestOffers: RecentDataNFTType[] = [];

        offers.forEach((offer: Offer) => {
          const matchingDataNft = dataNfts.find(
            (dataNft: DataNft) => dataNft.nonce === offer.offeredTokenNonce && dataNft.collection === offer.offeredTokenIdentifier
          );
          if (matchingDataNft) {
            _latestOffers.push({
              index: offer.index,
              owner: new Address(offer.owner),
              creator: new Address(matchingDataNft?.owner),
              offeredTokenIdentifier: offer.offeredTokenIdentifier,
              offeredTokenNonce: offer.offeredTokenNonce,
              offeredTokenAmount: offer.offeredTokenAmount,
              wantedTokenIdentifier: offer.wantedTokenIdentifier,
              wantedTokenNonce: offer.wantedTokenNonce,
              wantedTokenAmount: offer.wantedTokenAmount,
              quantity: offer.quantity,
              tokenName: matchingDataNft?.tokenName,
              title: matchingDataNft?.title,
              nftImgUrl: matchingDataNft?.nftImgUrl,
              royalties: matchingDataNft?.royalties,
              media: matchingDataNft?.media,
            });
          }
        });

        setLatestOffers(_latestOffers);
        setLoadedOffers(true);
      } else {
        throw new Error("API is down");
      }
    } catch (error) {
      console.log("Web2 API is down so gracefully handle it");
      console.error(error);
      setWeb2ApiDown(true);
      setLatestOffers([]);
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

      {loadedOffers && latestOffers.length === 0 && (
        <NoDataHere imgFromTop="5rem" customMsg={`${web2ApiDown ? "Web2 API is down, gracefully roll down to full Web3 Mode" : ""}`} />
      )}

      <SimpleGrid spacing={4} templateColumns="repeat(auto-fill, minmax(240px, 1fr))">
        {latestOffers.map((item: RecentDataNFTType, idx: number) => {
          return (
            <Card key={idx} maxW="sm" variant="outline" backgroundColor="none" border=".01rem solid transparent" borderColor="#00C79740" borderRadius="0.75rem">
              <CardBody pb={10}>
                <Skeleton height={skeletonHeight} isLoaded={loadedOffers} fadeDuration={1} display="flex" justifyContent={"center"}>
                  <Link
                    to={`/datanfts/marketplace/${createTokenIdentifier(item.offeredTokenIdentifier, Number(item.offeredTokenNonce))}/offer-${Number(item.index)}`}
                    as={ReactRouterLink}>
                    <NftMediaComponent
                      nftMedia={item?.media}
                      imageUrls={item.nftImgUrl ? [item.nftImgUrl] : []}
                      imageHeight="210px"
                      imageWidth="210px"
                      borderRadius="md"
                      autoSlide={false}
                      shouldDisplayArrows={false}
                    />
                  </Link>
                </Skeleton>
                <Skeleton height="76px" isLoaded={loadedOffers} fadeDuration={2}>
                  <Stack mt={{ base: "0", md: "12" }}>
                    <Heading size="md" noOfLines={1} fontFamily="Clash-Medium">
                      {item.title}
                    </Heading>
                    <Text fontSize="md">Supply Available : {Number(item.quantity)}</Text>
                    <Text fontSize="sm">
                      Unlock for {item.wantedTokenAmount === 0 ? "Free" : `${Number(convertWeiToEsdt(item.wantedTokenAmount))} ITHEUM/NFT`}
                    </Text>
                    <Favourite
                      chainID={chainID}
                      tokenIdentifier={createTokenIdentifier(item.offeredTokenIdentifier, Number(item.offeredTokenNonce))}
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
