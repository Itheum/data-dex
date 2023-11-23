import React, { useEffect, useState } from "react";
import { Box, Button, Flex, Image, Text } from "@chakra-ui/react";
import { ContractConfiguration, DataNft, NftMinter } from "@itheum/sdk-mx-data-nft/out";
import { useGetAccountInfo, useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { getApi, getExplorer } from "../../../../libs/MultiversX/api";
import axios from "axios";
import { FaArrowRightLong } from "react-icons/fa6";
import { NftType } from "@multiversx/sdk-dapp/types/tokens.types";
import { Address } from "@multiversx/sdk-core/out";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import { MdNavigateBefore, MdOutlineNavigateNext } from "react-icons/md";

type CurateNftsProp = {
  nftMinter: NftMinter;
  viewContractConfig: ContractConfiguration;
};

export const CurateNfts: React.FC<CurateNftsProp> = (props) => {
  const { nftMinter, viewContractConfig } = props;
  const [createDataNfts, setCreateDataNfts] = useState<Array<NftType>>([]);
  const [addressFrozenNonces, setAddressFrozenNonces] = useState<Array<number>>([]);
  const [paginationFromNft, setPaginationFromNft] = useState<number>(0);
  const [paginationSizeNft, setPaginationSizeNft] = useState<number>(10);
  const { chainID } = useGetNetworkConfig();
  const { address } = useGetAccountInfo();
  const tokenIdentifier = viewContractConfig.tokenIdentifier;

  DataNft.setNetworkConfig(chainID === "1" ? "mainnet" : "devnet");
  // console.log(createDataNfts);
  const getCreatedDataNftsFromAPI = async () => {
    const apiLink = getApi(chainID);
    const url = `https://${apiLink}/collections/${tokenIdentifier}/nfts?from=${paginationFromNft}&size=${paginationSizeNft}&withOwner=true`;
    const { data } = await axios.get(url);
    setCreateDataNfts(data);
    // console.log(data);
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
    getCreatedDataNftsFromAPI();

    // console.log(createDataNfts);
    (async () => {
      const viewAddressFrozenNonces = await nftMinter.viewAddressFrozenNonces(new Address(address));
      // console.log(viewAddressFrozenNonces);
      setAddressFrozenNonces(viewAddressFrozenNonces);
    })();
  }, []);
  useEffect(() => {
    getCreatedDataNftsFromAPI();
    // console.log(paginationFromNft);
  }, [paginationFromNft]);

  // console.log(addressFrozenNonces);
  return (
    <Box as="div" flexDirection="column">
      <Text fontSize="1.5rem" fontFamily="Clash-Bold" pb={2} color="teal.200">
        Curate Your Data NFTs
      </Text>
      <Flex flexDirection="row" justifyItems="center" alignItems="center" gap={4}>
        <Text>You have {createDataNfts.length} Data NFT tokens in your collection</Text>
        <Button variant="outline" color="teal.200" borderColor="teal.200" onClick={() => getCreatedDataNftsFromAPI()}>
          Refresh
        </Button>
      </Flex>
      <Flex justifyContent="center" pb={3} gap={3}>
        <Button
          colorScheme="teal"
          alignItems="center"
          justifyContent="center"
          isDisabled={paginationFromNft <= 0}
          onClick={() => {
            if (paginationFromNft >= 0) {
              setPaginationFromNft(paginationFromNft - paginationSizeNft);
              getCreatedDataNftsFromAPI();
            } else {
              setPaginationFromNft(0);
            }
          }}>
          <MdNavigateBefore />
          Back
        </Button>
        <Button
          colorScheme="teal"
          alignItems="center"
          justifyContent="center"
          isDisabled={createDataNfts.length <= 10}
          onClick={() => {
            if (createDataNfts.length - paginationFromNft >= 10) {
              setPaginationFromNft(paginationFromNft + paginationSizeNft);
              getCreatedDataNftsFromAPI();
              // console.log(paginationFromNft);
            } else {
              return;
            }
          }}>
          Next
          <MdOutlineNavigateNext />
        </Button>
      </Flex>
      <Flex flexDirection={{ base: "column", md: "row" }} flexWrap="wrap" justifyItems="start" alignItems="start" gap={3}>
        {createDataNfts.map((dataNfts, index) => {
          return (
            <Box key={index}>
              <Image src={dataNfts.url} boxSize="8.5rem" rounded="xl" />
              <a href={`https://${getExplorer(chainID)}/nfts/${dataNfts.identifier}`} target="_blank" rel="noreferrer">
                <Flex flexDirection="row" justifyContent="start" alignItems="center" gap={1.5} _hover={{ color: "aquamarine" }}>
                  <Text fontSize="sm" py={1} pl={1}>
                    View on Explore
                  </Text>
                  <FaArrowRightLong size={12} />
                </Flex>
              </a>
              <Flex flexDirection="row" gap={2} my={2}>
                {addressFrozenNonces.includes(dataNfts.nonce) ? (
                  <Flex flexDirection="row" gap={5}>
                    <Button
                      variant="outline"
                      borderColor="teal.200"
                      textColor="teal.200"
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
                    size="xs"
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
