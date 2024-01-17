import React, { useEffect, useState } from "react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { getFavoritesFromBackendApi, getTrendingFromBackendApi } from "../../../libs/MultiversX";
import { DataNft } from "@itheum/sdk-mx-data-nft/out";
import { Box, Card, CardBody, Heading, Image, Link, SimpleGrid, Skeleton, Stack, Text } from "@chakra-ui/react";
import { Link as ReactRouterLink } from "react-router-dom";
import { useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { Favourite } from "../../../components/Favourite/Favourite";

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
  const [favouriteItems, setFavouriteItems] = React.useState<Array<string>>([]);
  const [loadedOffers, setLoadedOffers] = useState<boolean>(false);
  const { tokenLogin } = useGetLoginInfo();

  const skeletonHeight = { base: "260px", md: "190px", "2xl": "220px" };

  useEffect(() => {
    (async () => {
      DataNft.setNetworkConfig(chainID === "1" ? "mainnet" : "devnet");
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
      // console.log(dataNfts);
      const trending = getTrendingData.map((dataNft) => {
        // console.log(dataNft);
        const ratingNfts = dataNfts.find((nft) => nft.tokenIdentifier === dataNft.tokenIdentifier);
        if (ratingNfts) {
          return { ...ratingNfts, rating: dataNft.rating };
        }
      });
      // console.log(trending);
      setTrendingDataNfts(trending as TrendingDataNftsType[]);
    })();
    setLoadedOffers(false);
  }, []);

  const getFavourite = async () => {
    if (tokenLogin?.nativeAuthToken) {
      const bearerToken =
        "ZXJkMTdlZzQzcjN4dmVudWMweWF5YXVocWYwNjZsdW01MnBobnl0dncwdG52eTY3N3VwN2NhZXNlN2d2M2c.YUhSMGNITTZMeTkxZEdsc2N5NXRkV3gwYVhabGNuTjRMbU52YlEuOGFiMWUyNjk1OWFjOGJhNWNiNWQwOTlmM2RlMWRlZDY0MzhjMTgwMDlmNGFiMzlkZDcwZTUxYTY3MTg5NDU2Ny43MjAwLmV5SjBhVzFsYzNSaGJYQWlPakUzTURVME9UVTFPVEo5.dbde070ded2abfe9f31d51e3af5f0c28d8eb0f1f1b63d2f75d0e139b38140d231fa5710765eafe136723e754fb6000f16d822b22c48f5306c78b208404b93c0a";
      const getFavourites = await getFavoritesFromBackendApi(chainID, bearerToken);
      // console.log(getFavourites);
      setFavouriteItems(getFavourites);
    }
  };

  useEffect(() => {
    getFavourite();
  }, [favouriteItems.length]);

  // console.log(trendingDataNfts);
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
                    <Image src={trendingDataNft.nftImgUrl} alt="Data NFT Image" borderRadius="lg" h={{ base: "250px", md: "200px" }} />
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
                      bearerToken={
                        "ZXJkMTdlZzQzcjN4dmVudWMweWF5YXVocWYwNjZsdW01MnBobnl0dncwdG52eTY3N3VwN2NhZXNlN2d2M2c.YUhSMGNITTZMeTkxZEdsc2N5NXRkV3gwYVhabGNuTjRMbU52YlEuOGFiMWUyNjk1OWFjOGJhNWNiNWQwOTlmM2RlMWRlZDY0MzhjMTgwMDlmNGFiMzlkZDcwZTUxYTY3MTg5NDU2Ny43MjAwLmV5SjBhVzFsYzNSaGJYQWlPakUzTURVME9UVTFPVEo5.dbde070ded2abfe9f31d51e3af5f0c28d8eb0f1f1b63d2f75d0e139b38140d231fa5710765eafe136723e754fb6000f16d822b22c48f5306c78b208404b93c0a"
                      }
                      favouriteItems={favouriteItems}
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
