import React, { useEffect, useState } from "react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { getTrendingFromBackendApi } from "../../../libs/MultiversX";
import { DataNft } from "@itheum/sdk-mx-data-nft/out";
import { Box, Card, CardBody, Heading, Image, Link, SimpleGrid, Skeleton, Stack } from "@chakra-ui/react";
import { Link as ReactRouterLink } from "react-router-dom";
import { useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";

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

  const skeletonHeight = { base: "260px", md: "190px", "2xl": "220px" };

  useEffect(() => {
    (async () => {
      DataNft.setNetworkConfig(chainID === "1" ? "mainnet" : "devnet");
      const getTrendingData = await getTrendingFromBackendApi(chainID);
      const _trendingData: Array<TrendingDataCreationNftsType> = [];
      setLoadedOffers(true);

      console.log(getTrendingData);
      getTrendingData.forEach((parseTrendingData) => {
        const splitedString = parseTrendingData.tokenIdentifier.split("-");
        const nonce = parseInt(splitedString[2], 16);
        const tokenIdentifier = splitedString[0] + "-" + splitedString[1];
        // console.log(tokenIdentifier, nonce);
        _trendingData.push({ nonce: nonce, tokenIdentifier: tokenIdentifier });
      });
      const dataNfts: DataNft[] = await DataNft.createManyFromApi(_trendingData);
      console.log(dataNfts);
      const trending = dataNfts.map((dataNft) => {
        const ratingNfts = getTrendingData.find((nft) => dataNft.tokenIdentifier === nft.tokenIdentifier);
        if (ratingNfts) {
          return { ...dataNft, rating: ratingNfts.rating };
        }
      });
      console.log(trending);

      // setTrendingDataNfts(trending);
    })();
    setLoadedOffers(false);
  }, []);
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
                    {/*<Text fontSize="md"> Supply Available : {trendingDataNft.supply} </Text>*/}
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
