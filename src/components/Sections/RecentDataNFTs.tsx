import React, { useEffect, useState } from "react";
import { Card, CardBody, Heading, Image, Link, SimpleGrid, Skeleton, Stack, Text } from "@chakra-ui/react";
import { DataNft, Offer, createTokenIdentifier } from "@itheum/sdk-mx-data-nft/out";
import { Address } from "@multiversx/sdk-core/out";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { Link as ReactRouterLink } from "react-router-dom";
import { IS_DEVNET, getFavoritesFromBackendApi, getHealthCheckFromBackendApi, getRecentOffersFromBackendApi } from "libs/MultiversX";
import { getApi, getNftsByIds } from "libs/MultiversX/api";
import { DataNftMarketContract } from "libs/MultiversX/dataNftMarket";
import { RecentDataNFTType } from "libs/types";
import { convertWeiToEsdt, hexZero, sleep } from "libs/utils";
import { useAccountStore, useMarketStore } from "store";
import { NoDataHere } from "./NoDataHere";
import { Favourite } from "../Favourite/Favourite";
import NftMediaComponent from "components/NftMediaComponent";

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
  const { chainID } = useGetNetworkConfig();
  const [loadedOffers, setLoadedOffers] = useState<boolean>(false);
  const [latestOffers, setLatestOffers] = useState<RecentDataNFTType[]>(latestOffersSkeleton);
  const { tokenLogin } = useGetLoginInfo();

  const marketRequirements = useMarketStore((state) => state.marketRequirements);
  const favoriteNfts = useAccountStore((state) => state.favoriteNfts);
  const updateFavoriteNfts = useAccountStore((state) => state.updateFavoriteNfts);

  const marketContract = new DataNftMarketContract(chainID);

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
    DataNft.setNetworkConfig(IS_DEVNET ? "devnet" : "mainnet");

    try {
      const isApiUp = await getHealthCheckFromBackendApi(chainID);

      if (isApiUp) {
        const offers = await getRecentOffersFromBackendApi(chainID);
        const recentNonces = offers.map((nft: any) => ({ nonce: nft.offeredTokenNonce }));
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
      const _latestOffers: RecentDataNFTType[] = [];

      slicedOffers.forEach((offer, idx) => {
        const _nft = dataNfts.find((nft) => createTokenIdentifier(nft.collection, nft.nonce) === nft.identifier);

        if (_nft !== undefined) {
          const _nftMetaData = DataNft.decodeAttributes(_nft.attributes);

          _latestOffers.push({
            creator: new Address(_nftMetaData.creator ?? ""),
            owner: new Address(offer.owner),
            offeredTokenIdentifier: offer.offeredTokenIdentifier,
            offeredTokenNonce: offer.offeredTokenNonce,
            offeredTokenAmount: offer.offeredTokenAmount,
            index: idx,
            wantedTokenIdentifier: offer.wantedTokenIdentifier,
            wantedTokenNonce: offer.wantedTokenNonce,
            wantedTokenAmount: offer.wantedTokenAmount,
            quantity: offer.quantity,
            tokenName: _nftMetaData.tokenName,
            title: _nftMetaData.title,
            nftImgUrl: "https://" + getApi(chainID) + "/nfts/" + _nft.identifier + "/thumbnail",
            royalties: _nftMetaData.royalties,
            media: _nftMetaData.media,
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
                      imageHeight="210px"
                      imageWidth="210px"
                      borderRadius="lg"
                      autoSlide={false}
                      shouldDisplayArrows={false}
                    />
                  </Link>
                </Skeleton>
                <Skeleton height="76px" isLoaded={loadedOffers} fadeDuration={2}>
                  <Stack mt={{ base: "0", md: isMxLoggedIn ? "12" : "4" }}>
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
