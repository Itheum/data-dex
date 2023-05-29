import React, { FC, useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
  useColorMode,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import BigNumber from "bignumber.js";
import { convertToLocalString } from "libs/util2";
import { convertEsdtToWei, convertWeiToEsdt, isValidNumericCharacter, sleep } from "../libs/util";
import { DataNftMarketContract } from "../MultiversX/dataNftMarket";
import { getTokenWantedRepresentation, tokenDecimals } from "../MultiversX/tokenUtils";
import { DataNftMetadataType, MarketplaceRequirementsType } from "../MultiversX/types";
import { useChainMeta } from "../store/ChainMetaContext";

type MyListedDataLowerCardProps = {
  offers: Record<any, any>;
  nftMetadatas: DataNftMetadataType[];
  index: number;
  itheumPrice: number | undefined;
  marketRequirements: MarketplaceRequirementsType | undefined;
  maxPaymentFeeMap: Record<string, number>;
};

const MyListedDataLowerCard: FC<MyListedDataLowerCardProps> = ({ offers, index, nftMetadatas, itheumPrice, marketRequirements, maxPaymentFeeMap }) => {
  const { colorMode } = useColorMode();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { chainMeta: _chainMeta } = useChainMeta() as any;
  const contract = new DataNftMarketContract(_chainMeta.networkId);
  const { isOpen: isDelistModalOpen, onOpen: onDelistModalOpen, onClose: onDelistModalClose } = useDisclosure();
  const { isOpen: isUpdatePriceModalOpen, onOpen: onUpdatePriceModalOpen, onClose: onUpdatePriceModalClose } = useDisclosure();
  const [selectedOfferIndex, setSelectedOfferIndex] = useState<number>(-1); // no selection
  const [delistAmount, setDelistAmount] = useState<number>(1);
  const [delistModalState, setDelistModalState] = useState<number>(0); // 0, 1
  const [newListingPrice, setNewListingPrice] = useState<number>(0);
  const [newListingPriceError, setNewListingPriceError] = useState<string>("");
  const [amountOfTokens, setAmountOfTokens] = useState<any>({});
  const [delistAmountError, setDelistAmountError] = useState<string>("");
  const itheumToken = _chainMeta.contracts.itheumToken;
  const toast = useToast();
  const { address } = useGetAccountInfo();

  const [fee, setFee] = useState<number>(0);
  useEffect(() => {
    const _fee =
      marketRequirements && offers[selectedOfferIndex]
        ? convertWeiToEsdt(
            new BigNumber(offers[selectedOfferIndex].wanted_token_amount)
              .multipliedBy(amountOfTokens[selectedOfferIndex] as number)
              .multipliedBy(10000)
              .div(10000 + (marketRequirements.buyer_fee as number)),
            tokenDecimals(offers[selectedOfferIndex].wanted_token_identifier as number)
          ).toNumber()
        : 0;
    setFee(_fee);
  }, [marketRequirements, selectedOfferIndex, offers]);

  const onDelist = async () => {
    if (!address) {
      toast({
        title: "Connect your wallet",
        status: "error",
        isClosable: true,
      });
      return;
    }
    if (selectedOfferIndex < 0 || offers.length <= selectedOfferIndex) {
      toast({
        title: "No NFT data",
        status: "error",
        isClosable: true,
      });
      return;
    }

    contract.delistDataNft(offers[selectedOfferIndex].index, delistAmount, address);
    // a small delay for visual effect
    await sleep(0.5);
    onDelistModalClose();
    setDelistModalState(0);
  };

  const onUpdatePrice = async () => {
    if (!address) {
      toast({
        title: "Connect your wallet",
        status: "error",
        isClosable: true,
      });
      return;
    }
    if (selectedOfferIndex < 0 || offers.length <= selectedOfferIndex) {
      toast({
        title: "No NFT data",
        status: "error",
        isClosable: true,
      });
      return;
    }

    contract.updateOfferPrice(
      offers[selectedOfferIndex].index,
      convertEsdtToWei(newListingPrice, tokenDecimals(offers[selectedOfferIndex].wanted_token_identifier)).toFixed(),
      address
    );

    // a small delay for visual effect
    await sleep(0.5);
    onUpdatePriceModalClose();
  };

  useEffect(() => {
    (async () => {
      // init - no selection
      setSelectedOfferIndex(-1);
    })();
    const amounts: any = {};
    for (let i = 0; i < offers.length; i++) {
      amounts[i] = 1;
    }
    setAmountOfTokens(amounts);
  }, [hasPendingTransactions]);

  return (
    <>
      <Button
        my="3"
        size="sm"
        colorScheme="teal"
        variant="outline"
        onClick={() => {
          window.open(nftMetadatas[index].dataPreview);
        }}>
        <Text py={3} color={colorMode === "dark" ? "white" : "black"}>
          Preview Data
        </Text>
      </Button>

      <Flex justifyContent="space-between" mt="2" gap="2">
        <Button
          size="sm"
          colorScheme="teal"
          w="full"
          isDisabled={hasPendingTransactions}
          onClick={() => {
            setSelectedOfferIndex(index);
            setDelistAmount(1);
            setDelistModalState(0);
            onDelistModalOpen();
          }}>
          De-List
        </Button>

        <Button
          size="sm"
          colorScheme="teal"
          w="full"
          isDisabled={hasPendingTransactions}
          onClick={() => {
            setSelectedOfferIndex(index);
            if (marketRequirements) {
              setNewListingPrice(
                convertWeiToEsdt(
                  new BigNumber(offers[index].wanted_token_amount)
                    .multipliedBy(amountOfTokens[index])
                    .multipliedBy(10000)
                    .div(10000 + marketRequirements.buyer_fee),
                  tokenDecimals(offers[index].wanted_token_identifier)
                ).toNumber()
              );
            } else {
              setNewListingPrice(0);
            }
            onUpdatePriceModalOpen();
          }}>
          Update Fee
        </Button>
      </Flex>

      {selectedOfferIndex >= 0 && selectedOfferIndex < offers.length && (
        <Modal isOpen={isDelistModalOpen} onClose={onDelistModalClose} closeOnEsc={false} closeOnOverlayClick={false}>
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px) hue-rotate(90deg)" />
          <ModalContent>
            {delistModalState === 0 ? (
              <>
                <ModalBody py={6}>
                  <HStack spacing={5} alignItems="center">
                    <Box flex="4" alignContent="center">
                      <Text fontSize="lg">De-List Data NFTs from Marketplace</Text>
                      <Flex mt="1">
                        <Text px="15px" py="5px" borderRadius="md" fontWeight="bold" fontSize="md" backgroundColor="blackAlpha.300">
                          {nftMetadatas[selectedOfferIndex].tokenName}
                          <br />
                          Listed supply: {offers[selectedOfferIndex].quantity}
                        </Text>
                      </Flex>
                    </Box>
                    <Box flex="1">
                      <Image src={nftMetadatas[selectedOfferIndex].nftImgUrl} h="auto" w="100%" borderRadius="md" m="auto" />
                    </Box>
                  </HStack>
                  <Flex mt="40px" justifyContent="flex-start" alignItems="center">
                    <Box width="210px" fontSize="md">
                      How many should be de-listed?
                    </Box>
                    <NumberInput
                      size="sm"
                      ml="20px"
                      maxW="20"
                      step={1}
                      min={1}
                      max={offers[selectedOfferIndex].quantity}
                      isValidCharacter={isValidNumericCharacter}
                      value={delistAmount}
                      onChange={(valueAsString) => {
                        const value = Number(valueAsString);
                        let error = "";
                        if (value <= 0) error = "Cannot be zero or negative";
                        if (value > offers[selectedOfferIndex].quantity) error = "Cannot exceed balance";
                        setDelistAmountError(error);
                        setDelistAmount(value);
                      }}
                      keepWithinRange={true}>
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Button colorScheme="teal" size="sm" variant="outline" ml="2" onClick={() => setDelistAmount(offers[selectedOfferIndex].quantity)}>
                      De-List All
                    </Button>
                  </Flex>
                  {delistAmountError && (
                    <Text color="red.400" fontSize="xs" ml="228px" mt="1">
                      {delistAmountError}
                    </Text>
                  )}
                  <Flex justifyContent="end" mt="40px !important">
                    <Button colorScheme="teal" size="sm" mx="3" onClick={() => setDelistModalState(1)}>
                      Proceed
                    </Button>
                    <Button colorScheme="teal" size="sm" variant="outline" onClick={onDelistModalClose}>
                      Cancel
                    </Button>
                  </Flex>
                </ModalBody>
              </>
            ) : (
              <>
                <ModalBody py={6}>
                  <HStack spacing={5} alignItems="center">
                    <Box flex="4" alignContent="center">
                      <Text fontSize="lg">De-List Data NFTs from Marketplace</Text>
                      <Flex mt="1">
                        <Text px="15px" py="5px" borderRadius="md" fontWeight="bold" fontSize="md" backgroundColor="blackAlpha.300">
                          {nftMetadatas[selectedOfferIndex].tokenName}
                          <br />
                          Listed supply: {offers[selectedOfferIndex].quantity}
                        </Text>
                      </Flex>
                    </Box>
                    <Box flex="1">
                      <Image src={nftMetadatas[selectedOfferIndex].nftImgUrl} h="auto" w="100%" borderRadius="md" m="auto" />
                    </Box>
                  </HStack>
                  <Text fontSize="md" mt="28px">
                    You are about to de-list <Text as="span" backgroundColor="blackAlpha.300">{delistAmount} Data NFT{delistAmount > 1 ? "s" : ""}</Text> from the Public Marketplace. Are you sure you want to proceed?
                  </Text>
                  <Flex justifyContent="end" mt="35px !important">
                    <Button colorScheme="teal" size="sm" mx="3" onClick={onDelist}>
                      Proceed
                    </Button>
                    <Button colorScheme="teal" size="sm" variant="outline" onClick={onDelistModalClose}>
                      Cancel
                    </Button>
                  </Flex>
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      )}

      {selectedOfferIndex >= 0 && selectedOfferIndex < offers.length && marketRequirements && (
        <Modal isOpen={isUpdatePriceModalOpen} onClose={onUpdatePriceModalClose} closeOnEsc={false} closeOnOverlayClick={false}>
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px) hue-rotate(90deg)" />
          <ModalContent>
            <ModalBody py={6}>
              <HStack spacing={5} alignItems="center">
                <Box flex="4" alignContent="center">
                  <Text fontSize="lg">Update Listing Fee for Each</Text>
                  <Flex mt="1">
                    <Text px="15px" py="5px" borderRadius="md" fontWeight="bold" fontSize="md" backgroundColor="blackAlpha.300" textAlign="center">
                      {nftMetadatas[selectedOfferIndex].tokenName}
                    </Text>
                  </Flex>
                </Box>
                <Box flex="1">
                  <Image src={nftMetadatas[selectedOfferIndex].nftImgUrl} h="auto" w="100%" borderRadius="md" m="auto" />
                </Box>
              </HStack>
              <Box mt="8">
                
                <Flex justifyContent="flex-start" alignItems="center">
                  <Box width="180px" fontSize="md">
                    Current Fee per Data NFT
                  </Box>
                  <Box fontSize="md">
                    : {fee} {getTokenWantedRepresentation(offers[selectedOfferIndex].wanted_token_identifier, offers[selectedOfferIndex].wanted_token_nonce)}{" "}
                    {fee && itheumPrice ? `(~${convertToLocalString(fee * itheumPrice, 2)} USD)` : ""}
                  </Box>
                </Flex>
                
                <Flex justifyContent="flex-start" alignItems="center" mt="2">
                  <Box width="180px" fontSize="md">
                    New Fee
                  </Box>
                  :
                  <NumberInput
                    ml="3px"
                    size="sm"
                    maxW="24"
                    step={5}
                    min={0}
                    max={maxPaymentFeeMap[itheumToken] ? maxPaymentFeeMap[itheumToken] : 0} // need to update hardcoded tokenId
                    isValidCharacter={isValidNumericCharacter}
                    value={newListingPrice}
                    onChange={(valueAsString) => {
                      const value = Number(valueAsString);
                      let error = "";
                      if (value < 0) error = "Cannot be negative";
                      if (value > maxPaymentFeeMap[itheumToken] ? maxPaymentFeeMap[itheumToken] : 0) error = "Cannot exceed maximum listing fee";
                      setNewListingPriceError(error);
                      setNewListingPrice(value);
                    }}
                    keepWithinRange={true}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </Flex>
                {newListingPriceError && (
                  <Text color="red.400" fontSize="xs" ml="185px" mt="1">
                    {newListingPriceError}
                  </Text>
                )}
              </Box>
              <Flex justifyContent="end" mt="30px !important">
                <Button colorScheme="teal" size="sm" mx="3" onClick={onUpdatePrice}>
                  Proceed
                </Button>
                <Button colorScheme="teal" size="sm" variant="outline" onClick={onUpdatePriceModalClose}>
                  Cancel
                </Button>
              </Flex>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default MyListedDataLowerCard;
