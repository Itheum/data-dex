import React, { useEffect, useState } from "react";
import { Card, CardBody, Heading, SimpleGrid, Skeleton, Stack, Text } from "@chakra-ui/react";
import { DataNft } from "@itheum/sdk-mx-data-nft/out";
import { useGetLoginInfo, useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { Link } from "react-router-dom";
import NftMediaComponent from "components/NftMediaComponent";
import { IS_DEVNET, getTopVolumes } from "libs/MultiversX";
import { NftMedia } from "libs/types";
import { convertToLocalString } from "libs/utils";
import { useMarketStore } from "store";

interface VolumesDataNftsProps {
  // Define the props for your component here
}

interface DataNftVolume {
  tokenIdentifier: string;
  volumes: { volume: number; priceTokenIdentifier: string }[];
}

type VolumeDataNftsType = {
  volume: number;
  tokenIdentifier: string;
  nftImgUrl: string;
  title: string;
  media: NftMedia[];
};

const latestOffersSkeleton: VolumeDataNftsType[] = [];

// create the placeholder offers for skeleton loading
for (let i = 0; i < 10; i++) {
  latestOffersSkeleton.push({
    volume: 0,
    tokenIdentifier: "",
    nftImgUrl: "",
    title: "",
    media: [],
  });
}

const skeletonHeight = { base: "260px", md: "190px", "2xl": "220px" };

const VolumesDataNfts: React.FC<VolumesDataNftsProps> = () => {
  const { chainID } = useGetNetworkConfig();
  const [loadingOffers, setLoadingOffers] = useState<boolean>(true);
  const { tokenLogin } = useGetLoginInfo();
  const [topVolumesDataNfts, setTopVolumesDataNfts] = useState<VolumeDataNftsType[]>(latestOffersSkeleton);
  const itheumPrice = useMarketStore((state) => state.itheumPrice);

  useEffect(() => {
    (async () => {
      DataNft.setNetworkConfig(IS_DEVNET ? "devnet" : "mainnet");

      const dataNftsVolumes: DataNftVolume[] = await getTopVolumes(chainID, tokenLogin?.nativeAuthToken ?? "", 10);
      const _volumesData: { nonce: number; tokenIdentifier: string }[] = [];

      dataNftsVolumes.forEach((volumeObject) => {
        const splitedString = volumeObject.tokenIdentifier.split("-");
        const nonce = parseInt(splitedString[2], 16);
        const tokenIdentifier = splitedString[0] + "-" + splitedString[1];
        _volumesData.push({ nonce: nonce, tokenIdentifier: tokenIdentifier });
      });

      const dataNfts: DataNft[] = await DataNft.createManyFromApi(_volumesData);

      const _volume = dataNftsVolumes.map((dataNft) => {
        const nftDetails = dataNfts.find((nft) => nft.tokenIdentifier === dataNft.tokenIdentifier);
        if (nftDetails) {
          return { ...nftDetails, volume: dataNft.volumes[0].volume };
        }
      });

      setTopVolumesDataNfts(_volume as VolumeDataNftsType[]);
      setLoadingOffers(false);
    })();
  }, []);

  return (
    <>
      <Heading as="h4" fontFamily="Clash-Medium" fontWeight="semibold" size="lg" mb="5" textAlign={["center", "initial"]}>
        Most Traded Data NFTs
      </Heading>

      <SimpleGrid spacing={4} templateColumns="repeat(auto-fill, minmax(240px, 1fr))">
        {topVolumesDataNfts.map((volumeDataNft, index) => {
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
                <Skeleton height={skeletonHeight} isLoaded={!loadingOffers} fadeDuration={1} display="flex" justifyContent={"center"}>
                  <Link to={`/datanfts/marketplace/${volumeDataNft.tokenIdentifier}`}>
                    <NftMediaComponent nftMedia={volumeDataNft?.media} imageHeight="210px" imageWidth="210px" borderRadius="md" shouldDisplayArrows={false} />
                  </Link>
                </Skeleton>
                <Skeleton height="56px" isLoaded={!loadingOffers} fadeDuration={2}>
                  <Stack mt={{ base: "0", md: "8" }}>
                    <Heading size="md" noOfLines={1} fontFamily="Clash-Medium">
                      {volumeDataNft.title}
                    </Heading>
                    <Text fontSize="md">
                      {volumeDataNft.volume.toFixed(2)} ITHEUM{" "}
                      <Text as="span" color="teal.200">{`(~${convertToLocalString(Number(volumeDataNft.volume.toFixed(2)) * itheumPrice, 2)} USD)`}</Text>
                    </Text>
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

export default VolumesDataNfts;
