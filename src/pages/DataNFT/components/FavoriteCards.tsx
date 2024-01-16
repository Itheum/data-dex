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
        "ZXJkMTdlZzQzcjN4dmVudWMweWF5YXVocWYwNjZsdW01MnBobnl0dncwdG52eTY3N3VwN2NhZXNlN2d2M2c.YUhSMGNITTZMeTkxZEdsc2N5NXRkV3gwYVhabGNuTjRMbU52YlEuNDFjMzk0YmVmMDBlMDA1NzMwMGVmOTgyMGEyOTFkNjRjMzFjMjhiODQ3NDlkZGZmNTg4N2E2ZGY4ZTBmMzI1Mi43MjAwLmV5SjBhVzFsYzNSaGJYQWlPakUzTURVME1qUTFNalo5.a0cf820e3f32e1031838ecd2641dd469d0cf6a6f3e14d7ced974c214f6ceeafc9f8ed937f1d35f03192b916ecb4690e08a9ee68c51fe32ae6483e20dbe7a8808";
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
        "ZXJkMTdlZzQzcjN4dmVudWMweWF5YXVocWYwNjZsdW01MnBobnl0dncwdG52eTY3N3VwN2NhZXNlN2d2M2c.YUhSMGNITTZMeTkxZEdsc2N5NXRkV3gwYVhabGNuTjRMbU52YlEuYTYwZjQ1MGZmNGYzYzNlMDBlODI5NmIxY2NhYTczZjI0NGM0OWM5N2Y2NDcyMjAyYWVkZTBiMjA0NmEyNmIzMi43MjAwLmV5SjBhVzFsYzNSaGJYQWlPakUzTURVME1qQTRNVEI5.6b2138f624bd53eed793ecd8c9a6b7d8b7bb4b85873de8415e9bf1135fd4e82a97c5325774d3b7ff7f92b2052728e580df1103fb193f9751efb22a30ad4b9909";
      const getFavourites = await getFavoritesFromBackendApi(chainID, bearerToken);
      // console.log(getFavourites);
      setFavouriteItems(getFavourites);
    }
  };

  console.log(dataNfts);
  return (
    <Box>
      <Flex flexDirection={{ base: "column", md: "row" }} flexWrap={"wrap"} gap={4}>
        {dataNfts.map((dataNft, index) => {
          return (
            <Card
              key={index}
              maxW={"xs"}
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
                    <Text fontSize="md" noOfLines={2} color="gray">
                      {dataNft.description}
                    </Text>
                    <Favourite
                      chainID={chainID}
                      tokenIdentifier={dataNft.tokenIdentifier}
                      bearerToken={
                        "ZXJkMTdlZzQzcjN4dmVudWMweWF5YXVocWYwNjZsdW01MnBobnl0dncwdG52eTY3N3VwN2NhZXNlN2d2M2c.YUhSMGNITTZMeTkxZEdsc2N5NXRkV3gwYVhabGNuTjRMbU52YlEuNDFjMzk0YmVmMDBlMDA1NzMwMGVmOTgyMGEyOTFkNjRjMzFjMjhiODQ3NDlkZGZmNTg4N2E2ZGY4ZTBmMzI1Mi43MjAwLmV5SjBhVzFsYzNSaGJYQWlPakUzTURVME1qUTFNalo5.a0cf820e3f32e1031838ecd2641dd469d0cf6a6f3e14d7ced974c214f6ceeafc9f8ed937f1d35f03192b916ecb4690e08a9ee68c51fe32ae6483e20dbe7a8808"
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
