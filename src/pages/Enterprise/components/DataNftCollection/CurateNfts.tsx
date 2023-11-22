import React, { useEffect, useState } from "react";
import { Box, Button, Flex, Text, Image } from "@chakra-ui/react";
import { ContractConfiguration, DataNft, NftMinter } from "@itheum/sdk-mx-data-nft/out";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { getApi } from "../../../../libs/MultiversX/api";
import axios from "axios";
import { FaArrowRightLong } from "react-icons/fa6";
import { NftType } from "@multiversx/sdk-dapp/types/tokens.types";
import { getHealthCheckFromBackendApi } from "../../../../libs/MultiversX";

type CurateNftsProp = {
  nftMinter: NftMinter;
  viewContractConfig: ContractConfiguration;
};

export const CurateNfts: React.FC<CurateNftsProp> = (props) => {
  const { nftMinter, viewContractConfig } = props;
  const [createDataNfts, setCreateDataNfts] = useState<Array<DataNft>>([]);
  const { chainID } = useGetNetworkConfig();
  const tokenIdentifier = viewContractConfig.tokenIdentifier;

  DataNft.setNetworkConfig(chainID === "1" ? "mainnet" : "devnet");

  useEffect(() => {
    (async () => {
      const apiLink = getApi(chainID);
      const url = `https://${apiLink}/collections/${tokenIdentifier}/nfts`;
      const { data } = await axios.get(url);
      const createDataNftsFromSdk = DataNft.createFromApiResponseOrBulk(data);
      setCreateDataNfts(createDataNftsFromSdk);
      console.log(createDataNftsFromSdk);
    })();
  }, []);

  // console.log(tokenIdentifier);
  return (
    <Box as="div" flexDirection="column">
      <Text fontSize="1.5rem" fontFamily="Clash-Bold" pb={2} color="teal.200">
        Curate Your Data NFTs
      </Text>
      <Flex flexDirection="row" justifyItems="center" alignItems="center" gap={4}>
        <Text>You have {createDataNfts.length} Data NFT tokens in your collection</Text>
        <Button variant="outline" color="teal.200" borderColor="teal.200">
          Refresh
        </Button>
      </Flex>
      <Flex flexDirection={{ base: "column", md: "row" }} flexWrap="wrap" justifyItems="start" alignItems="start" gap={3}>
        {createDataNfts.map((dataNfts, index) => {
          return (
            <Box key={index}>
              <Image src={dataNfts.nftImgUrl} boxSize="8.5rem" rounded="xl" />
              <Flex flexDirection="row" justifyContent="center" alignItems="center" gap={1.5}>
                <Text fontSize="sm" py={1} pl={3}>
                  View on Explore
                </Text>
                <FaArrowRightLong />
              </Flex>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
};
