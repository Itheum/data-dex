import React, { useEffect, useState } from "react";
import { Box, Button, Flex, Text, Image } from "@chakra-ui/react";
import { ContractConfiguration, DataNft, NftMinter } from "@itheum/sdk-mx-data-nft/out";
import { useGetAccountInfo, useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { getApi } from "../../../../libs/MultiversX/api";
import axios from "axios";
import { FaArrowRightLong } from "react-icons/fa6";
import { NftType } from "@multiversx/sdk-dapp/types/tokens.types";
import { getHealthCheckFromBackendApi } from "../../../../libs/MultiversX";
import { useParams } from "react-router-dom";
import { Address, IAddress } from "@multiversx/sdk-core/out";
import { sendTransactions } from "@multiversx/sdk-dapp/services";

type CurateNftsProp = {
  nftMinter: NftMinter;
  viewContractConfig: ContractConfiguration;
};

type FreezeUnfreezeNfts = {
  senderAddress: string;
  nonce: number;
  freezeAddress: string;
  nftImgUrl: string;
};
type aaa = {
  owner: string;
} & DataNft;

export const CurateNfts: React.FC<CurateNftsProp> = (props) => {
  const { nftMinter, viewContractConfig } = props;
  const [createDataNfts, setCreateDataNfts] = useState<Array<NftType>>([]);
  const [addressFrozenNonces, setAddressFrozenNonces] = useState<Array<number>>([]);
  const { chainID } = useGetNetworkConfig();
  const { address } = useGetAccountInfo();
  const { minterAddress } = useParams();
  const tokenIdentifier = viewContractConfig.tokenIdentifier;

  DataNft.setNetworkConfig(chainID === "1" ? "mainnet" : "devnet");
  // console.log(createDataNfts);
  const getCreatedDataNftsFromSdk = async () => {
    const apiLink = getApi(chainID);
    const url = `https://${apiLink}/collections/${tokenIdentifier}/nfts?withOwner=true`;
    const { data } = await axios.get(url);
    setCreateDataNfts(data);
  };
  // console.log(createDataNfts);
  const freezeDataNft = async (creator: string, nonce: number, owner: string | undefined) => {
    const tx = await nftMinter.freezeSingleNFT(new Address(address), nonce, new Address(owner));
    tx.setGasLimit(100000000);
    await sendTransactions({
      transactions: [tx],
    });
  };
  const unFreezeDataNft = async (creator: string, nonce: number, owner: string | undefined) => {
    const tx = await nftMinter.unFreezeSingleNFT(new Address(address), nonce, new Address(owner));
    tx.setGasLimit(100000000);
    await sendTransactions({
      transactions: [tx],
    });
  };
  const wipeDataNft = async (creator: string, nonce: number, owner: string | undefined) => {
    const tx = await nftMinter.wipeSingleNFT(new Address(address), nonce, new Address(owner));
    tx.setGasLimit(100000000);
    await sendTransactions({
      transactions: [tx],
    });
  };

  useEffect(() => {
    getCreatedDataNftsFromSdk();
    // console.log(createDataNfts);
    (async () => {
      const viewAddressFrozenNonces = await nftMinter.viewAddressFrozenNonces(new Address(address));
      console.log(viewAddressFrozenNonces);
      setAddressFrozenNonces(viewAddressFrozenNonces);
    })();
  }, []);

  // console.log(addressFrozenNonces);
  return (
    <Box as="div" flexDirection="column">
      <Text fontSize="1.5rem" fontFamily="Clash-Bold" pb={2} color="teal.200">
        Curate Your Data NFTs
      </Text>
      <Flex flexDirection="row" justifyItems="center" alignItems="center" gap={4}>
        <Text>You have {createDataNfts.length} Data NFT tokens in your collection</Text>
        <Button variant="outline" color="teal.200" borderColor="teal.200" onClick={() => getCreatedDataNftsFromSdk()}>
          Refresh
        </Button>
      </Flex>
      <Flex flexDirection={{ base: "column", md: "row" }} flexWrap="wrap" justifyItems="start" alignItems="start" gap={3}>
        {createDataNfts.map((dataNfts, index) => {
          return (
            <Box key={index}>
              <Image src={dataNfts.url} boxSize="8.5rem" rounded="xl" />
              <Flex flexDirection="row" justifyContent="start" alignItems="center" gap={1.5} pb={2}>
                <Text fontSize="sm" py={1} pl={1}>
                  View on Explore
                </Text>
                <FaArrowRightLong size={12} />
              </Flex>
              <Flex flexDirection="row" gap={2} mb={2}>
                {addressFrozenNonces.includes(dataNfts.nonce) ? (
                  <Flex flexDirection="row" gap={5}>
                    <Button
                      variant="outline"
                      borderColor="teal"
                      textColor="teal"
                      fontSize="sm"
                      size="xs"
                      onClick={() => unFreezeDataNft(dataNfts.creator, dataNfts.nonce, dataNfts.owner)}>
                      UnFreeze
                    </Button>
                    <Button colorScheme="red" fontSize="sm" size="xs" onClick={() => wipeDataNft(dataNfts.creator, dataNfts.nonce, dataNfts.owner)}>
                      Wipe
                    </Button>
                  </Flex>
                ) : (
                  <Button
                    variant="outline"
                    borderColor="red"
                    textColor="red"
                    fontSize="sm"
                    size="sm"
                    onClick={() => freezeDataNft(dataNfts.creator, dataNfts.nonce, dataNfts.owner)}>
                    Freeze
                  </Button>
                )}
              </Flex>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
};
