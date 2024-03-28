import React, { useEffect, useState } from "react";
import { Box, Button, Flex, Image, Text } from "@chakra-ui/react";
import { ContractConfiguration, DataNft, NftMinter } from "@itheum/sdk-mx-data-nft/out";
import { Address } from "@multiversx/sdk-core/out";
import { useGetAccountInfo, useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import { NftType } from "@multiversx/sdk-dapp/types/tokens.types";
import axios from "axios";
import { FaArrowRightLong } from "react-icons/fa6";
import { MdInfo, MdNavigateBefore, MdOutlineNavigateNext } from "react-icons/md";
import { ImageTooltip } from "../../../../components/ImageTooltip";
import { getApi, getExplorer } from "../../../../libs/MultiversX/api";

type CurateNftsProp = {
  nftMinter: NftMinter;
  viewContractConfig: ContractConfiguration;
};

export const CurateNfts: React.FC<CurateNftsProp> = (props) => {
  const { nftMinter, viewContractConfig } = props;
  const [createDataNfts, setCreateDataNfts] = useState<Array<NftType>>([]);
  const [addressFrozenNonces, setAddressFrozenNonces] = useState<Array<number>>([]);
  const [paginationFromNft, setPaginationFromNft] = useState<number>(0);
  const [paginationSizeNft, setPaginationSizeNft] = useState<number>(4);
  const [nftCount, setNftCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasRequestLoaded, setHasRequestLoaded] = useState<boolean>(false);

  const { chainID } = useGetNetworkConfig();
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const tokenIdentifier = viewContractConfig.tokenIdentifier;

  const pageCount = Math.ceil(nftCount / paginationSizeNft);

  DataNft.setNetworkConfig(chainID === "1" ? "mainnet" : "devnet");
  const getCreatedDataNftsFromAPI = async () => {
    setHasRequestLoaded(false);
    const apiLink = getApi(chainID);
    const url = `https://${apiLink}/collections/${tokenIdentifier}/nfts?from=${paginationFromNft}&size=${paginationSizeNft}&withOwner=true&sort=nonce`;
    const urlForNftCount = `https://${apiLink}/collections/${tokenIdentifier}/nfts/count`;
    const { data: paginatedNfts } = await axios.get(url);
    const { data: nftsCount } = await axios.get(urlForNftCount);
    setCreateDataNfts(paginatedNfts);
    setNftCount(nftsCount);
    setHasRequestLoaded(true);
  };
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
  }, [paginationFromNft]);

  useEffect(() => {
    (async () => {
      const viewAddressFrozenNonces = await nftMinter.viewFrozenNonces();
      setAddressFrozenNonces(viewAddressFrozenNonces);
    })();
  }, [hasPendingTransactions]);

  return (
    <Box as="div" flexDirection="column" border="1px solid" borderColor="#00C79740" rounded="3xl" w={{ base: "auto", xl: "100%" }} mb={4}>
      <Flex bgColor="#00C7970D" roundedTop="3xl" alignItems="center">
        <Text fontSize="1.5rem" fontFamily="Clash-Medium" pl={10} pr={2} py={4}>
          Curate Your Data NFTs
        </Text>
        <ImageTooltip description="Ideally, you will use an automated script to mint large number of Data NFTs using a sequential index. But, you can also use the below form to mint single Data NFTs, on-demand. This  will be useful primarily in test collections.">
          <MdInfo />
        </ImageTooltip>
      </Flex>
      <Flex flexDirection="column" px={10} py={4}>
        <Flex flexDirection="row" justifyItems="center" alignItems="center" gap={4}>
          <Text>You have {createDataNfts.length} Data NFT tokens in your collection</Text>
        </Flex>
        <Flex justifyContent="space-between" py={3} gap={3}>
          <Button size="lg" colorScheme="teal" onClick={() => getCreatedDataNftsFromAPI()}>
            Refresh
          </Button>
          <Flex justifyContent="center" alignItems="center">
            <Button
              colorScheme="teal"
              alignItems="center"
              justifyContent="center"
              size="sm"
              px={0}
              isDisabled={paginationFromNft <= 0 || !hasRequestLoaded}
              onClick={() => {
                if (paginationFromNft >= paginationSizeNft) {
                  setPaginationFromNft(paginationFromNft - paginationSizeNft);
                  setCurrentPage(currentPage - 1);
                } else {
                  setPaginationFromNft(0);
                }
              }}>
              <MdNavigateBefore size="1.5rem" />
            </Button>
            <Text px={2}>
              Page {currentPage} of {pageCount}
            </Text>
            <Button
              colorScheme="teal"
              alignItems="center"
              justifyContent="center"
              size="sm"
              px={0}
              isDisabled={nftCount < 1 || pageCount === 1 || !hasRequestLoaded}
              onClick={() => {
                setPaginationFromNft(paginationFromNft + paginationSizeNft);
                setCurrentPage(currentPage + 1);
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
                  <Box position="absolute" boxSize={{ base: "auto", sm: "14.9rem" }} bgColor="#06060680" backdropFilter="blur(4px)" zIndex="10">
                    <Text position="absolute" left="33%" top="45%" px={5} py={1} bgColor="#FF439D">
                      Frozen
                    </Text>
                  </Box>
                )}
                <Image src={dataNfts.url} boxSize="14.9rem" rounded="xl" />
                <Text>{dataNfts.name}</Text>
                <a href={`https://${getExplorer(chainID)}/nfts/${dataNfts.identifier}`} target="_blank" rel="noreferrer">
                  <Flex flexDirection="row" justifyContent="start" alignItems="center" pt={2} gap={1.5} _hover={{ color: "aquamarine" }}>
                    <Text fontSize="sm">View on Explore</Text>
                    <FaArrowRightLong size={12} />
                  </Flex>
                </a>
                <Flex flexDirection="row" gap={2} mt={2}>
                  {addressFrozenNonces.includes(dataNfts.nonce) ? (
                    <Flex flexDirection="row" gap={3} w="full">
                      <Button
                        variant="outline"
                        borderColor="teal.200"
                        rounded="lg"
                        w="50%"
                        onClick={() => unFreezeDataNft(dataNfts.creator, dataNfts.nonce, dataNfts.owner)}>
                        UnFreeze
                      </Button>
                      <Button
                        borderColor="#FF439D"
                        variant="outline"
                        rounded="lg"
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
                      size="md"
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
