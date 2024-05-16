import React, { useEffect, useState } from "react";
import { Box, Card, CardBody, Heading, Image, Link, SimpleGrid, Skeleton, Stack, Text } from "@chakra-ui/react";
import { DataNft } from "@itheum/sdk-mx-data-nft/out";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { Link as ReactRouterLink } from "react-router-dom";
import { Favourite } from "../../../components/Favourite/Favourite";
import { IS_DEVNET, getFavoritesFromBackendApi, getTrendingFromBackendApi } from "../../../libs/MultiversX";
import { useAccountStore } from "../../../store";
import NftMediaComponent from "components/ImageSlider";

type TrendingDataCreationNftsType = {
  nonce: number;
  tokenIdentifier: string;
};

type TrendingDataNftsType = {
  rating: number;
} & DataNft;
export const TrendingData: React.FC = () => {
  const { chainID } = useGetNetworkConfig();
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();
  const [trendingDataNfts, setTrendingDataNfts] = useState<Array<TrendingDataNftsType>>([]);
  const [loadedOffers, setLoadedOffers] = useState<boolean>(false);
  const { tokenLogin } = useGetLoginInfo();

  const favoriteNfts = useAccountStore((state) => state.favoriteNfts);
  const updateFavoriteNfts = useAccountStore((state) => state.updateFavoriteNfts);

  const skeletonHeight = { base: "260px", md: "190px", "2xl": "220px" };

  useEffect(() => {
    (async () => {
      DataNft.setNetworkConfig(IS_DEVNET ? "devnet" : "mainnet");
      const getTrendingData = await getTrendingFromBackendApi(chainID);
      const _trendingData: Array<TrendingDataCreationNftsType> = [];
      setLoadedOffers(true);

      getTrendingData.forEach((parseTrendingData) => {
        const splitedString = parseTrendingData.tokenIdentifier.split("-");
        const nonce = parseInt(splitedString[2], 16);
        const tokenIdentifier = splitedString[0] + "-" + splitedString[1];
        _trendingData.push({ nonce: nonce, tokenIdentifier: tokenIdentifier });
      });
      const dataNfts: DataNft[] = await DataNft.createManyFromApi(_trendingData);
      const trending = getTrendingData.map((dataNft) => {
        const ratingNfts = dataNfts.find((nft) => nft.tokenIdentifier === dataNft.tokenIdentifier);
        if (ratingNfts) {
          return { ...ratingNfts, rating: dataNft.rating };
        }
      });
      setTrendingDataNfts(trending as TrendingDataNftsType[]);
    })();
    setLoadedOffers(false);
  }, []);

  const getFavourite = async () => {
    if (tokenLogin?.nativeAuthToken) {
      const bearerToken = tokenLogin?.nativeAuthToken;
      const getFavourites = await getFavoritesFromBackendApi(chainID, bearerToken);
      updateFavoriteNfts(getFavourites);
    }
  };

  useEffect(() => {
    getFavourite();
  }, [favoriteNfts.length]);

  return (
    <Box>
      <Heading as="h2" size="lg" fontWeight="bold" mb="1rem">
        Trending Data NFTs
      </Heading>
      <SimpleGrid spacing={4} templateColumns="repeat(auto-fill, minmax(240px, 1fr))">
        {trendingDataNfts.map((trendingDataNft, index) => {
          return (
            <Card
              key={index}
              maxW="sm"
              variant="outline"
              backgroundColor="none"
              border=".01rem solid transparent"
              borderColor="#00C79740"
              borderRadius="0.75rem">
              <CardBody>
                <Skeleton height={skeletonHeight} isLoaded={loadedOffers} fadeDuration={1} display="flex" justifyContent={"center"}>
                  <Link to={`/datanfts/marketplace/${trendingDataNft.tokenIdentifier}`} as={ReactRouterLink}>
                    <NftMediaComponent imageUrls={[trendingDataNft.nftImgUrl]} imageHeight={"225px"} imageWidth="225px" borderRadius="lg" />
                  </Link>
                </Skeleton>
                <Skeleton height="76px" isLoaded={loadedOffers} fadeDuration={2}>
                  <Stack mt={isMxLoggedIn ? "12" : "4"}>
                    <Heading size="md" noOfLines={1} fontFamily="Clash-Medium">
                      {trendingDataNft.title}
                    </Heading>
                    <Text fontSize="lg"> Trending score : {trendingDataNft.rating.toFixed(2)} </Text>
                    <Favourite
                      chainID={chainID}
                      tokenIdentifier={trendingDataNft.tokenIdentifier}
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
    </Box>
  );
};
