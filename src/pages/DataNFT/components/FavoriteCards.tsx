import React, { useEffect, useState } from "react";
import { getFavoritesFromBackendApi } from "../../../libs/MultiversX";
import { useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { DataNft } from "@itheum/sdk-mx-data-nft/out";
import { Box, Card, CardBody, Flex, Heading, Image, Link, Text, Skeleton, Stack } from "@chakra-ui/react";
import { Link as ReactRouterLink } from "react-router-dom";
import { Favourite } from "../../../components/Favourite/Favourite";

type FavoriteDataCreationNftsType = {
  nonce: number;
  tokenIdentifier: string;
};
export const FavoriteCards: React.FC = () => {
  const { tokenLogin } = useGetLoginInfo();
  const { chainID } = useGetNetworkConfig();
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();
  const [loadedOffers, setLoadedOffers] = useState<boolean>(false);
  const [favouriteItems, setFavouriteItems] = React.useState<Array<string>>([]);
  const [dataNfts, setDataNfts] = React.useState<Array<DataNft>>([]);

  const skeletonHeight = { base: "260px", md: "190px", "2xl": "220px" };

  useEffect(() => {
    (async () => {
      DataNft.setNetworkConfig(chainID === "1" ? "mainnet" : "devnet");
      const bearerToken =
        "ZXJkMTdlZzQzcjN4dmVudWMweWF5YXVocWYwNjZsdW01MnBobnl0dncwdG52eTY3N3VwN2NhZXNlN2d2M2c.YUhSMGNITTZMeTkxZEdsc2N5NXRkV3gwYVhabGNuTjRMbU52YlEuOGFiMWUyNjk1OWFjOGJhNWNiNWQwOTlmM2RlMWRlZDY0MzhjMTgwMDlmNGFiMzlkZDcwZTUxYTY3MTg5NDU2Ny43MjAwLmV5SjBhVzFsYzNSaGJYQWlPakUzTURVME9UVTFPVEo5.dbde070ded2abfe9f31d51e3af5f0c28d8eb0f1f1b63d2f75d0e139b38140d231fa5710765eafe136723e754fb6000f16d822b22c48f5306c78b208404b93c0a";
      const getFavourites = await getFavoritesFromBackendApi(chainID, bearerToken);
      // console.log(getFavourites);
      setFavouriteItems(getFavourites);
      const _favoriteData: Array<FavoriteDataCreationNftsType> = [];
      setLoadedOffers(true);

      getFavourites.forEach((parseTrendingData) => {
        const splitedString = parseTrendingData.split("-");
        const nonce = parseInt(splitedString[2], 16);
        const tokenIdentifier = splitedString[0] + "-" + splitedString[1];
        _favoriteData.push({ nonce: nonce, tokenIdentifier: tokenIdentifier });
      });
      const dataNfts: DataNft[] = await DataNft.createManyFromApi(_favoriteData);
      console.log(dataNfts);
      setDataNfts(dataNfts);
    })();
    setLoadedOffers(false);
  }, [favouriteItems.length]);

  const getFavourite = async () => {
    if (tokenLogin?.nativeAuthToken) {
      const bearerToken =
        "ZXJkMTdlZzQzcjN4dmVudWMweWF5YXVocWYwNjZsdW01MnBobnl0dncwdG52eTY3N3VwN2NhZXNlN2d2M2c.YUhSMGNITTZMeTkxZEdsc2N5NXRkV3gwYVhabGNuTjRMbU52YlEuOGFiMWUyNjk1OWFjOGJhNWNiNWQwOTlmM2RlMWRlZDY0MzhjMTgwMDlmNGFiMzlkZDcwZTUxYTY3MTg5NDU2Ny43MjAwLmV5SjBhVzFsYzNSaGJYQWlPakUzTURVME9UVTFPVEo5.dbde070ded2abfe9f31d51e3af5f0c28d8eb0f1f1b63d2f75d0e139b38140d231fa5710765eafe136723e754fb6000f16d822b22c48f5306c78b208404b93c0a";
      const getFavourites = await getFavoritesFromBackendApi(chainID, bearerToken);
      // console.log(getFavourites);
      setFavouriteItems(getFavourites);
    }
  };

  console.log(dataNfts);
  return (
    <Box>
      <Flex flexDirection={{ base: "column", md: "row" }} flexWrap={"wrap"} gap={7} ml={16}>
        {dataNfts.map((dataNft, index) => {
          return (
            <Card
              key={index}
              w={"xs"}
              variant="outline"
              backgroundColor="none"
              border=".01rem solid transparent"
              borderColor="#00C79740"
              borderRadius="0.75rem">
              <CardBody mb={9}>
                <Skeleton height={skeletonHeight} isLoaded={loadedOffers} fadeDuration={1} display="flex" justifyContent={"center"}>
                  <Link to={`/datanfts/marketplace/${dataNft.tokenIdentifier}`} as={ReactRouterLink}>
                    <Image src={dataNft.nftImgUrl} alt="Data NFT Image" borderRadius="lg" boxSize={{ base: "250px", md: "200px" }} />
                  </Link>
                </Skeleton>
                <Skeleton height="76px" isLoaded={loadedOffers} fadeDuration={2}>
                  <Stack py={isMxLoggedIn ? "4" : "4"}>
                    <Heading size="md" noOfLines={1} fontFamily="Clash-Medium" pt={2}>
                      {dataNft.title}
                    </Heading>
                    <Text fontSize="md" noOfLines={2} h="2.6rem" color="gray">
                      {dataNft.description}
                    </Text>
                    <Favourite
                      chainID={chainID}
                      tokenIdentifier={dataNft.tokenIdentifier}
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
      </Flex>
    </Box>
  );
};
