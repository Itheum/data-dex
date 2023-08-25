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
  Tooltip,
  useColorMode,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetAccountInfo, useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions, useGetSuccessfulTransactions, useTrackTransactionStatus } from "@multiversx/sdk-dapp/hooks/transactions";
import BigNumber from "bignumber.js";
import { PREVIEW_DATA_ON_DEVNET_SESSION_KEY, contractsForChain } from "libs/config";
import { useLocalStorage } from "libs/hooks";
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
  routeChainIDBasedOnLoggedInStatus,
  shouldPreviewDataBeEnabled,
  backendApi,
} from "libs/utils";
import { useAccountStore, useMarketStore } from "store";

type MyListedDataLowerCardProps = {
  offer: OfferType;
  nftMetadata: DataNftMetadataType;
};

const MyListedDataLowerCard: FC<MyListedDataLowerCardProps> = ({ offer, nftMetadata }) => {
  const { chainID } = useGetNetworkConfig();
  const { colorMode } = useColorMode();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { tokenLogin } = useGetLoginInfo();

  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();
  const routedChainID = routeChainIDBasedOnLoggedInStatus(isMxLoggedIn, chainID);
  const contract = new DataNftMarketContract(routedChainID);

  const marketRequirements = useMarketStore((state) => state.marketRequirements);
  const maxPaymentFeeMap = useMarketStore((state) => state.maxPaymentFeeMap);
  const itheumPrice = useMarketStore((state) => state.itheumPrice);
  const backendUrl = backendApi(chainID);

  const { isOpen: isDelistModalOpen, onOpen: onDelistModalOpen, onClose: onDelistModalClose } = useDisclosure();
  const { isOpen: isUpdatePriceModalOpen, onOpen: onUpdatePriceModalOpen, onClose: onUpdatePriceModalClose } = useDisclosure();
  const [delistAmount, setDelistAmount] = useState<number>(1);
  const [delistModalState, setDelistModalState] = useState<number>(0); // 0, 1
  const [newListingPrice, setNewListingPrice] = useState<number>(0);
  const [newListingPriceError, setNewListingPriceError] = useState<string>("");
  const [delistAmountError, setDelistAmountError] = useState<string>("");
  const itheumToken = contractsForChain(routedChainID).itheumToken;
  const toast = useToast();
  const { address } = useGetAccountInfo();
  const [sessionId, setSessionId] = useState<string>("");
  const [delistTxStatus, setDelistTxStatus] = useState<boolean>(false);

  const [updatePriceSessionId, setUpdatePriceSessionId] = useState<string>("");
  const [updatePriceTxStatus, setUpdatePriceTxStatus] = useState<boolean>(false);

  const trackUpdatePriceTransactionStatus = useTrackTransactionStatus({
    transactionId: updatePriceSessionId,
  });

  useEffect(() => {
    setUpdatePriceTxStatus(trackUpdatePriceTransactionStatus.isSuccessful ? true : false);
  }, [trackUpdatePriceTransactionStatus]);

  const trackTransactionStatus = useTrackTransactionStatus({
    transactionId: sessionId,
  });

  useEffect(() => {
    setDelistTxStatus(trackTransactionStatus.isSuccessful ? true : false);
  }, [trackTransactionStatus]);

  useEffect(() => {
    async function updatePriceOnBackend() {
      try {
        const headers = {
          Authorization: `Bearer ${tokenLogin?.nativeAuthToken}`,
          "Content-Type": "application/json",
        };

        const price = newListingPrice + (newListingPrice * (marketRequirements?.buyer_fee ?? 0)) / 10000;

        const requestBody = { price: convertEsdtToWei(price, tokenDecimals(offer.wanted_token_identifier)).toFixed() };
        const response = await fetch(`${backendUrl}/updateOffer/${offer.index}`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        console.log("Response:", data);
      } catch (error) {
        console.log("Error:", error);
      }
    }
    if (updatePriceTxStatus) {
      updatePriceOnBackend();
    }
  }, [updatePriceTxStatus]);

  useEffect(() => {
    async function updateOfferOnBackend() {
      try {
        const headers = {
          Authorization: `Bearer ${tokenLogin?.nativeAuthToken}`,
          "Content-Type": "application/json",
        };

        const requestBody = { supply: delistAmount };
        const response = await fetch(`${backendApi(chainID)}/updateOffer/${offer.index}`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(requestBody),
        });

        const responseData = await response.json();
        console.log("Response:", responseData);
      } catch (error) {
        console.log("Error:", error);
      }
    }

    if (delistTxStatus) {
      updateOfferOnBackend();
    }
  }, [delistTxStatus]);

  const [previewDataOnDevnetSession] = useLocalStorage(PREVIEW_DATA_ON_DEVNET_SESSION_KEY, null);

  const fee =
    marketRequirements && offer
      ? convertWeiToEsdt(
          new BigNumber(offer.wanted_token_amount).multipliedBy(10000).div(10000 + (marketRequirements.buyer_fee as number)),
          tokenDecimals(offer.wanted_token_identifier)
        ).toNumber()
      : 0;

  const showErrorToast = (title: string) => {
    toast({
      title,
      status: "error",
      isClosable: true,
    });
  };

  const onDelist = async () => {
    const conditions = [
      {
        condition: !address,
        errorMessage: "Connect your wallet",
      },
      {
        condition: !offer,
        errorMessage: "No NFT data",
      },
    ];

    for (const { condition, errorMessage } of conditions) {
      if (condition) {
        showErrorToast(errorMessage);
        return;
      }
    }

    const { sessionId } = await contract.delistDataNft(offer.index, delistAmount, address);
    console.log(sessionId);
    setSessionId(sessionId);

    // a small delay for visual effect
    await sleep(0.5);
    onDelistModalClose();
    setDelistModalState(0);
  };

  const onUpdatePrice = async () => {
    const conditions = [
      {
        condition: !address,
        errorMessage: "Connect your wallet",
      },
      {
        condition: !offer,
        errorMessage: "No NFT data",
      },
    ];

    for (const { condition, errorMessage } of conditions) {
      if (condition) {
        showErrorToast(errorMessage);
        return;
      }
    }

    const { sessionId } = await contract.updateOfferPrice(
      offer.index,
      convertEsdtToWei(newListingPrice, tokenDecimals(offer.wanted_token_identifier)).toFixed(),
      address
    );
    setUpdatePriceSessionId(sessionId);

    // a small delay for visual effect
    await sleep(0.5);
    onUpdatePriceModalClose();
  };

  return (
    <>
      <Tooltip
        colorScheme="teal"
        hasArrow
        label="View Data is disabled on devnet"
        isDisabled={shouldPreviewDataBeEnabled(routedChainID, previewDataOnDevnetSession)}>
        <Button
          my="3"
          size="sm"
          colorScheme="teal"
          variant="outline"
          _disabled={{ opacity: 0.2 }}
          isDisabled={!shouldPreviewDataBeEnabled(routedChainID, previewDataOnDevnetSession)}
          onClick={() => {
            window.open(nftMetadata.dataPreview);
          }}>
          <Text py={3} color={colorMode === "dark" ? "bgWhite" : "bgDark"}>
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
          <ModalOverlay backdropFilter="blur(10px)" />
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
          <ModalOverlay backdropFilter="blur(10px)" />
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
