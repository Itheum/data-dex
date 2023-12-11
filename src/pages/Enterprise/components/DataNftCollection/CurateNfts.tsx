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
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { useMarketStore } from "../../../../store";
import { CustomPagination } from "../../../../components/CustomPagination";

type CurateNftsProp = {
  nftMinter: NftMinter;
  viewContractConfig: ContractConfiguration;
};

export const CurateNfts: React.FC<CurateNftsProp> = (props) => {
  const { nftMinter, viewContractConfig } = props;
  const [createDataNfts, setCreateDataNfts] = useState<Array<NftType>>([]);
  const [addressFrozenNonces, setAddressFrozenNonces] = useState<Array<number>>([]);
  const [paginationFromNft, setPaginationFromNft] = useState<number>(0);
  const [paginationSizeNft, setPaginationSizeNft] = useState<number>(100);
  const { chainID } = useGetNetworkConfig();
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const tokenIdentifier = viewContractConfig.tokenIdentifier;

  const itemsPerPage = 1;

  const startIndex = (paginationFromNft - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = createDataNfts.slice(startIndex, endIndex);

  DataNft.setNetworkConfig(chainID === "1" ? "mainnet" : "devnet");
  // console.log(createDataNfts);
  const getCreatedDataNftsFromAPI = async () => {
    const apiLink = getApi(chainID);
    const url = `https://${apiLink}/collections/${tokenIdentifier}/nfts?from=${paginationFromNft}&size=${paginationSizeNft}&withOwner=true`;
    const { data } = await axios.get(url);
    setCreateDataNfts(data);
  };
  console.log(createDataNfts.length);
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

  const frozenNoncesAddresses = async () => {
    const viewAddressFrozenNonces = await nftMinter.viewAddressFrozenNonces(new Address(address));
    // console.log(viewAddressFrozenNonces);
    setAddressFrozenNonces(viewAddressFrozenNonces);
  };

  useEffect(() => {
    getCreatedDataNftsFromAPI();
    // console.log(paginationFromNft);
  }, [paginationFromNft]);

  useEffect(() => {
    getCreatedDataNftsFromAPI();
    frozenNoncesAddresses();
    // console.log(createDataNfts);
  }, []);

  useEffect(() => {
    frozenNoncesAddresses();
  }, [hasPendingTransactions]);

  const handlePageChange = (fromNumber: number) => {
    setPaginationFromNft(fromNumber);
  };

  // console.log(addressFrozenNonces);
  return (
    <Box as="div" flexDirection="column" border="1px solid" borderColor="#00C79740" rounded="3xl" w={{ base: "auto", xl: "100%" }} mb={4}>
      <Box bgColor="#00C7970D" roundedTop="3xl">
        <Text fontSize="1.5rem" fontFamily="Clash-Medium" px={10} py={4}>
          Curate Your Data NFTs
        </Text>
      </Box>
      <Flex flexDirection="column" px={10} py={4}>
        <Flex flexDirection="row" justifyItems="center" alignItems="center" gap={4}>
          <Text>You have {createDataNfts.length} Data NFT tokens in your collection</Text>
        </Flex>
        <Flex justifyContent="space-between" py={3} gap={3}>
          <Button size="lg" colorScheme="teal" onClick={() => getCreatedDataNftsFromAPI()}>
            Refresh
          </Button>
          <Flex>
            {/*<CustomPagination pageCount={pageCount} pageIndex={} gotoPage={} disabled={} />*/}
            <Button
              colorScheme="teal"
              alignItems="center"
              justifyContent="center"
              size="sm"
              isDisabled={paginationFromNft <= 0}
              onClick={() => {
                if (paginationFromNft >= paginationSizeNft) {
                  setPaginationFromNft(paginationFromNft - paginationSizeNft);
                  getCreatedDataNftsFromAPI();
                } else {
                  setPaginationFromNft(0);
                }
              }}>
              <MdNavigateBefore size="1.5rem" />
            </Button>
            <Button
              colorScheme="teal"
              alignItems="center"
              justifyContent="center"
              size="sm"
              isDisabled={createDataNfts.length < 1}
              onClick={() => {
                // if (paginationFromNft) {
                handlePageChange(paginationFromNft + 1);
                getCreatedDataNftsFromAPI();
                // console.log(paginationFromNft);
                // } else {
                //   return console.log(createDataNfts.length);
                // }
              }}>
              <MdOutlineNavigateNext size="1.5rem" />
            </Button>
          </Flex>
        </Flex>
        <Flex flexDirection={{ base: "column", md: "row" }} flexWrap="wrap" justifyItems="start" alignItems="start" gap={3}>
          {createDataNfts.map((dataNfts, index) => {
            return (
              <Box key={index} position="relative" border="1px solid" borderColor="#00C79740" rounded="xl" px="1.5rem" py="1.5rem" bgColor="#0F0F0F">
                {addressFrozenNonces.includes(dataNfts.nonce) && (
                  <Box position="absolute" boxSize="14.9rem" bgColor="#06060680" backdropFilter="blur(1px)" zIndex="10">
                    <Text position="absolute" left="33%" top="45%" px={5} py={1} bgColor="#FF439D">
                      Frozen
                    </Text>
                  </Box>
                )}
                <Image src={dataNfts.url} boxSize="14.9rem" rounded="xl" />
                <a href={`https://${getExplorer(chainID)}/nfts/${dataNfts.identifier}`} target="_blank" rel="noreferrer">
                  <Flex flexDirection="row" justifyContent="start" alignItems="center" pt={2} gap={1.5} _hover={{ color: "aquamarine" }}>
                    <Text fontSize="sm" pl={1}>
                      View on Explore
                    </Text>
                    <FaArrowRightLong size={12} />
                  </Flex>
                </a>
                <Flex flexDirection="row" gap={2} mt={2}>
                  {addressFrozenNonces.includes(dataNfts.nonce) ? (
                    <Flex flexDirection="row" gap={3} w="full">
                      <Button
                        variant="outline"
                        borderColor="teal.200"
                        rounded="xl"
                        w="50%"
                        onClick={() => unFreezeDataNft(dataNfts.creator, dataNfts.nonce, dataNfts.owner)}>
                        UnFreeze
                      </Button>
                      <Button
                        borderColor="#FF439D"
                        variant="outline"
                        rounded="xl"
                        w="50%"
                        onClick={() => wipeDataNft(dataNfts.creator, dataNfts.nonce, dataNfts.owner)}>
                        Wipe
                      </Button>
                    </Flex>
                  ) : (
                    <Button
                      variant="outline"
                      borderColor="teal.200"
                      rounded="lg"
                      size="sm"
                      px={8}
                      onClick={() => freezeDataNft(dataNfts.creator, dataNfts.nonce, dataNfts.owner)}>
                      Freeze
                    </Button>
                  )}
                </Flex>
              </Box>
            );
          })}
        </Flex>
      </Flex>
    </Box>
  );
};
