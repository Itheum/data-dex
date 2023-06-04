import React, { FC, useState } from "react";
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
  Tooltip,
  useColorMode,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import BigNumber from "bignumber.js";
import { DataNftMarketContract } from "libs/MultiversX/dataNftMarket";
import { DataNftMetadataType, OfferType } from "libs/MultiversX/types";
import {
  convertToLocalString,
  convertEsdtToWei,
  convertWeiToEsdt,
  isValidNumericCharacter,
  sleep,
  getTokenWantedRepresentation,
  tokenDecimals,
} from "libs/utils";
import { useMarketStore } from "store";
import { useChainMeta } from "store/ChainMetaContext";

type MyListedDataLowerCardProps = {
  offer: OfferType;
  nftMetadata: DataNftMetadataType;
};

const MyListedDataLowerCard: FC<MyListedDataLowerCardProps> = ({ offer, nftMetadata }) => {
  const { network } = useGetNetworkConfig();
  const { colorMode } = useColorMode();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { chainMeta: _chainMeta } = useChainMeta() as any;
  const contract = new DataNftMarketContract(_chainMeta.networkId);

  const marketRequirements = useMarketStore((state) => state.marketRequirements);
  const maxPaymentFeeMap = useMarketStore((state) => state.maxPaymentFeeMap);
  const itheumPrice = useMarketStore((state) => state.itheumPrice);

  const { isOpen: isDelistModalOpen, onOpen: onDelistModalOpen, onClose: onDelistModalClose } = useDisclosure();
  const { isOpen: isUpdatePriceModalOpen, onOpen: onUpdatePriceModalOpen, onClose: onUpdatePriceModalClose } = useDisclosure();
  const [delistAmount, setDelistAmount] = useState<number>(1);
  const [delistModalState, setDelistModalState] = useState<number>(0); // 0, 1
  const [newListingPrice, setNewListingPrice] = useState<number>(0);
  const [newListingPriceError, setNewListingPriceError] = useState<string>("");
  const [delistAmountError, setDelistAmountError] = useState<string>("");
  const itheumToken = _chainMeta.contracts.itheumToken;
  const toast = useToast();
  const { address } = useGetAccountInfo();

  const fee =
    marketRequirements && offer
      ? convertWeiToEsdt(
          new BigNumber(offer.wanted_token_amount).multipliedBy(10000).div(10000 + (marketRequirements.buyer_fee as number)),
          tokenDecimals(offer.wanted_token_identifier)
        ).toNumber()
      : 0;

  const onDelist = async () => {
    if (!address) {
      toast({
        title: "Connect your wallet",
        status: "error",
        isClosable: true,
      });
      return;
    }
    if (!offer) {
      toast({
        title: "No NFT data",
        status: "error",
        isClosable: true,
      });
      return;
    }

    contract.delistDataNft(offer.index, delistAmount, address);
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
    if (!offer) {
      toast({
        title: "No NFT data",
        status: "error",
        isClosable: true,
      });
      return;
    }

    contract.updateOfferPrice(offer.index, convertEsdtToWei(newListingPrice, tokenDecimals(offer.wanted_token_identifier)).toFixed(), address);

    // a small delay for visual effect
    await sleep(0.5);
    onUpdatePriceModalClose();
  };

  return (
    <>
      <Tooltip colorScheme="teal" hasArrow label="View Data is disabled on devnet" isDisabled={network.id != "devnet"}>
        <Button
          my="3"
          size="sm"
          colorScheme="teal"
          variant="outline"
          isDisabled={network.id == "devnet"}
          onClick={() => {
            window.open(nftMetadata.dataPreview);
          }}>
          <Text py={3} color={colorMode === "dark" ? "white" : "black"}>
            Preview Data
          </Text>
        </Button>
      </Tooltip>

      <Flex justifyContent="space-between" mt="2" gap="2">
        <Button
          size="sm"
          colorScheme="teal"
          w="full"
          isDisabled={hasPendingTransactions}
          onClick={() => {
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
            if (marketRequirements) {
              setNewListingPrice(
                convertWeiToEsdt(
                  new BigNumber(offer.wanted_token_amount).multipliedBy(10000).div(10000 + marketRequirements.buyer_fee),
                  tokenDecimals(offer.wanted_token_identifier)
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

      {offer && nftMetadata && (
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
                          {nftMetadata.tokenName}
                          <br />
                          Listed supply: {offer.quantity}
                        </Text>
                      </Flex>
                    </Box>
                    <Box flex="1">
                      <Image src={nftMetadata.nftImgUrl} h="auto" w="100%" borderRadius="md" m="auto" />
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
                      max={offer.quantity}
                      isValidCharacter={isValidNumericCharacter}
                      value={delistAmount}
                      onChange={(valueAsString) => {
                        const value = Number(valueAsString);
                        let error = "";
                        if (value <= 0) error = "Cannot be zero or negative";
                        if (value > offer.quantity) error = "Cannot exceed balance";
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
                    <Button colorScheme="teal" size="sm" variant="outline" ml="2" onClick={() => setDelistAmount(offer.quantity)}>
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
                          {nftMetadata ? nftMetadata.tokenName : ""}
                          <br />
                          Listed supply: {offer.quantity}
                        </Text>
                      </Flex>
                    </Box>
                    <Box flex="1">
                      <Image src={nftMetadata ? nftMetadata.nftImgUrl : ""} h="auto" w="100%" borderRadius="md" m="auto" />
                    </Box>
                  </HStack>
                  <Text fontSize="md" mt="28px">
                    You are about to de-list{" "}
                    <Text as="span" backgroundColor="blackAlpha.300">
                      {delistAmount} Data NFT{delistAmount > 1 ? "s" : ""}
                    </Text>{" "}
                    from the Public Marketplace. Are you sure you want to proceed?
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

      {offer && marketRequirements && nftMetadata && (
        <Modal isOpen={isUpdatePriceModalOpen} onClose={onUpdatePriceModalClose} closeOnEsc={false} closeOnOverlayClick={false}>
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px) hue-rotate(90deg)" />
          <ModalContent>
            <ModalBody py={6}>
              <HStack spacing={5} alignItems="center">
                <Box flex="4" alignContent="center">
                  <Text fontSize="lg">Update Listing Fee for Each</Text>
                  <Flex mt="1">
                    <Text px="15px" py="5px" borderRadius="md" fontWeight="bold" fontSize="md" backgroundColor="blackAlpha.300" textAlign="center">
                      {nftMetadata.tokenName}
                    </Text>
                  </Flex>
                </Box>
                <Box flex="1">
                  <Image src={nftMetadata.nftImgUrl} h="auto" w="100%" borderRadius="md" m="auto" />
                </Box>
              </HStack>
              <Box mt="8">
                <Flex justifyContent="flex-start" alignItems="center">
                  <Box width="180px" fontSize="md">
                    Current Fee per Data NFT
                  </Box>
                  <Box fontSize="md">
                    : {fee} {getTokenWantedRepresentation(offer.wanted_token_identifier, offer.wanted_token_nonce)}{" "}
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
