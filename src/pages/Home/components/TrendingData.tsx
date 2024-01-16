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
      if (tokenLogin?.nativeAuthToken) {
        const bearerToken =
          "ZXJkMTdlZzQzcjN4dmVudWMweWF5YXVocWYwNjZsdW01MnBobnl0dncwdG52eTY3N3VwN2NhZXNlN2d2M2c.YUhSMGNITTZMeTkxZEdsc2N5NXRkV3gwYVhabGNuTjRMbU52YlEuNWY1ZDZkZWIwYWZmNGVhYjBjY2Q5MzNlOTNhYzI4YzdmZjBhZTA3MDFmZmY5ZjQ4OGU0NGIyY2Q0NjgyZDAyMi43MjAwLmV5SjBhVzFsYzNSaGJYQWlPakUzTURVME1UTXdOamQ5.16d67174d5ffcec3130a420f4b8b5c93505a74ccbc48d87fd93f88759ba4d37911ae92d8a1f7231cae9552fe633193c0c7a8827465b8b781085bc618f692bc08";
        const getFavourites = await getFavoritesFromBackendApi(chainID, bearerToken);
        console.log(getFavourites);
        setFavouriteItems(getFavourites);
      }
    })();
    setLoadedOffers(false);
  }, []);

  const getFavourite = async () => {
    if (tokenLogin?.nativeAuthToken) {
      const bearerToken =
        "ZXJkMTdlZzQzcjN4dmVudWMweWF5YXVocWYwNjZsdW01MnBobnl0dncwdG52eTY3N3VwN2NhZXNlN2d2M2c.YUhSMGNITTZMeTkxZEdsc2N5NXRkV3gwYVhabGNuTjRMbU52YlEuNWY1ZDZkZWIwYWZmNGVhYjBjY2Q5MzNlOTNhYzI4YzdmZjBhZTA3MDFmZmY5ZjQ4OGU0NGIyY2Q0NjgyZDAyMi43MjAwLmV5SjBhVzFsYzNSaGJYQWlPakUzTURVME1UTXdOamQ5.16d67174d5ffcec3130a420f4b8b5c93505a74ccbc48d87fd93f88759ba4d37911ae92d8a1f7231cae9552fe633193c0c7a8827465b8b781085bc618f692bc08";
      const getFavourites = await getFavoritesFromBackendApi(chainID, bearerToken);
      console.log(getFavourites);
      setFavouriteItems(getFavourites);
    }
  };

  useEffect(() => {
    getFavourite();
  }, [favouriteItems.length]);

  console.log(trendingDataNfts);
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
                        "ZXJkMTdlZzQzcjN4dmVudWMweWF5YXVocWYwNjZsdW01MnBobnl0dncwdG52eTY3N3VwN2NhZXNlN2d2M2c.YUhSMGNITTZMeTkxZEdsc2N5NXRkV3gwYVhabGNuTjRMbU52YlEuNWY1ZDZkZWIwYWZmNGVhYjBjY2Q5MzNlOTNhYzI4YzdmZjBhZTA3MDFmZmY5ZjQ4OGU0NGIyY2Q0NjgyZDAyMi43MjAwLmV5SjBhVzFsYzNSaGJYQWlPakUzTURVME1UTXdOamQ5.16d67174d5ffcec3130a420f4b8b5c93505a74ccbc48d87fd93f88759ba4d37911ae92d8a1f7231cae9552fe633193c0c7a8827465b8b781085bc618f692bc08"
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
