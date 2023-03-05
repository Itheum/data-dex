import React, { FC, useEffect, useState } from "react";
import {
  Button,
  Flex,
  Box,
  Image,
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
  useDisclosure,
  useToast,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Modal,
  Checkbox,
} from "@chakra-ui/react";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import BigNumber from "bignumber.js";
import { convertWeiToEsdt, isValidNumericCharacter, sleep } from "../libs/util";
import { printPrice } from "../libs/util2";
import { getAccountTokenFromApi } from "../MultiversX/api";
import { DataNftMarketContract } from "../MultiversX/dataNftMarket";
import { tokenDecimals, getTokenWantedRepresentation } from "../MultiversX/tokenUtils";
import { DataNftMetadataType, MarketplaceRequirementsType, OfferType } from "../MultiversX/types";
import { useChainMeta } from "../store/ChainMetaContext";

type MarketplaceLowerCardProps = {
  offer: OfferType;
  offers: OfferType[];
  nftMetadatas: DataNftMetadataType[];
  index: number;
};

const MarketplaceLowerCard: FC<MarketplaceLowerCardProps> = (props) => {
  const { offer, index, offers, nftMetadatas } = props;

  const { hasPendingTransactions } = useGetPendingTransactions();
  const { chainMeta: _chainMeta } = useChainMeta() as any;
  const [amountOfTokens, setAmountOfTokens] = useState<any>({});
  const [amountErrors, setAmountErrors] = useState<string[]>([]);
  const [readTermsChecked, setReadTermsChecked] = useState(false);
  const [selectedOfferIndex, setSelectedOfferIndex] = useState<number>(-1); // no selection
  const [marketRequirements, setMarketRequirements] = useState<MarketplaceRequirementsType | undefined>(undefined);
  const { isOpen: isReadTermsModalOpen, onOpen: onReadTermsModalOpen, onClose: onReadTermsModalClose } = useDisclosure();
  const { isOpen: isProcureModalOpen, onOpen: onProcureModalOpen, onClose: onProcureModalClose } = useDisclosure();
  const [maxPaymentFeeMap, setMaxPaymentFeeMap] = useState<Record<string, number>>({});
  const [wantedTokenBalance, setWantedTokenBalance] = useState<string>("0");
  const contract = new DataNftMarketContract("ED");
  const [pageCount, setPageCount] = useState<number>(1);
  const [pageIndex, setPageIndex] = useState<number>(0); // pageIndex starts from 0
  const [pageSize, setPageSize] = useState<number>(10);
  const toast = useToast();
  const { address } = useGetAccountInfo();

  useEffect(() => {
    (async () => {
      // init - no selection
      setSelectedOfferIndex(-1);
      const _offers = await contract.viewPagedOffers(pageIndex * pageSize, (pageIndex + 1) * pageSize - 1, address);

      const amounts: any = {};
      const _amountErrors: string[] = [];
      for (let i = 0; i < _offers.length; i++) {
        amounts[i] = 1;
        _amountErrors.push("");
      }
      setAmountOfTokens(amounts);
      setAmountErrors(_amountErrors);
    })();
  }, [hasPendingTransactions]);

  useEffect(() => {
    (async () => {
      if (!(address && selectedOfferIndex >= 0 && selectedOfferIndex < offers.length)) return;

      // wanted_token must be ESDT (not NFT, SFT or Meta-ESDT)
      const _token = await getAccountTokenFromApi(address, offers[selectedOfferIndex].wanted_token_identifier, _chainMeta.networkId);
      if (_token) {
        setWantedTokenBalance(_token.balance ? _token.balance : "0");
      } else {
        setWantedTokenBalance("0");
      }
    })();
  }, [address, offers, selectedOfferIndex, hasPendingTransactions]);

  useEffect(() => {
    (async () => {
      const _marketRequirements = await contract.getRequirements();
      console.log("_marketRequirements", _marketRequirements);
      setMarketRequirements(_marketRequirements);

      if (_marketRequirements) {
        const _maxPaymentFeeMap: Record<string, number> = {};
        for (let i = 0; i < _marketRequirements.accepted_payments.length; i++) {
          _maxPaymentFeeMap[_marketRequirements.accepted_payments[i]] = convertWeiToEsdt(
            _marketRequirements.maximum_payment_fees[i],
            tokenDecimals(_marketRequirements.accepted_payments[i])
          ).toNumber();
        }
        setMaxPaymentFeeMap(_maxPaymentFeeMap);
      } else {
        setMaxPaymentFeeMap({});
      }
    })();
    console.log(amountOfTokens[index]);
  }, []);

  const onProcure = async () => {
    if (!address) {
      toast({
        title: "Connect your wallet",
        status: "error",
        isClosable: true,
      });
      return;
    }
    if (!marketRequirements) {
      toast({
        title: "Data is not loaded",
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
    if (!readTermsChecked) {
      toast({
        title: "You must READ and Agree on Terms of Use",
        status: "error",
        isClosable: true,
      });
      return;
    }
    const offer = offers[selectedOfferIndex];
    const paymentAmount = BigNumber(offer.wanted_token_amount).multipliedBy(amountOfTokens[selectedOfferIndex]);
    if (offer.wanted_token_identifier == "EGLD") {
      contract.sendAcceptOfferEgldTransaction(offer.index, paymentAmount.toFixed(), amountOfTokens[selectedOfferIndex], address);
    } else {
      if (offer.wanted_token_nonce === 0) {
        contract.sendAcceptOfferEsdtTransaction(
          offer.index,
          paymentAmount.toFixed(),
          offer.wanted_token_identifier,
          amountOfTokens[selectedOfferIndex],
          address
        );
      } else {
        contract.sendAcceptOfferNftEsdtTransaction(
          offer.index,
          paymentAmount.toFixed(),
          offer.wanted_token_identifier,
          offer.wanted_token_nonce,
          amountOfTokens[selectedOfferIndex],
          address
        );
      }
    }
    // a small delay for visual effect
    await sleep(0.5);
    onProcureModalClose();
  };

  return (
    <>
      <HStack h="3rem">
        <Text fontSize="xs">How many to procure </Text>
        <NumberInput
          size="xs"
          maxW={16}
          step={1}
          min={1}
          max={offer.quantity}
          isValidCharacter={isValidNumericCharacter}
          value={amountOfTokens[index]}
          defaultValue={1}
          onChange={(valueAsString) => {
            const value = Number(valueAsString);
            let error = "";
            if (value <= 0) {
              error = "Cannot be zero or negative";
            } else if (value > offer.quantity) {
              error = "Cannot exceed balance";
            }
            setAmountErrors((oldErrors: any) => {
              const newErrors = [...oldErrors];
              newErrors[index] = error;
              return newErrors;
            });
            setAmountOfTokens((oldAmounts: any) => {
              const newAmounts = { ...oldAmounts };
              newAmounts[index] = value;
              return newAmounts;
            });
          }}>
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <Button
          size="xs"
          colorScheme="teal"
          width="72px"
          isDisabled={hasPendingTransactions || !!amountErrors[index]}
          onClick={() => {
            setReadTermsChecked(false);
            setSelectedOfferIndex(index);
            onProcureModalOpen();
          }}>
          Procure
        </Button>
      </HStack>
      {amountErrors[index] && (
        <Text color="red.400" fontSize="xs">
          {amountErrors[index]}
        </Text>
      )}

      {selectedOfferIndex >= 0 && nftMetadatas.length > selectedOfferIndex && (
        <Modal isOpen={isProcureModalOpen} onClose={onProcureModalClose} closeOnEsc={false} closeOnOverlayClick={false}>
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px) hue-rotate(90deg)" />
          <ModalContent>
            <ModalBody py={6}>
              <HStack spacing="5" alignItems="center">
                <Box flex="4" alignContent="center">
                  <Text fontSize="lg">Procure Access to Data NFTs</Text>
                  <Flex mt="1">
                    <Text fontWeight="bold" fontSize="md" backgroundColor="blackAlpha.300" px="1" textAlign="center">
                      {nftMetadatas[selectedOfferIndex].tokenName}
                    </Text>
                  </Flex>
                </Box>
                <Box flex="1">
                  <Image src={nftMetadatas[selectedOfferIndex].nftImgUrl} h="auto" w="100%" borderRadius="md" m="auto" />
                </Box>
              </HStack>
              <Flex fontSize="md" mt="2">
                <Box w="140px">How many</Box>
                <Box>: {amountOfTokens[selectedOfferIndex]}</Box>
              </Flex>
              <Flex fontSize="md" mt="2">
                <Box w="140px">Fee per NFT</Box>
                <Box>
                  {marketRequirements ? (
                    <>
                      {": "}
                      {printPrice(
                        convertWeiToEsdt(
                          BigNumber(offers[selectedOfferIndex].wanted_token_amount)
                            .multipliedBy(10000)
                            .div(10000 + marketRequirements.buyer_fee),
                          tokenDecimals(offers[selectedOfferIndex].wanted_token_identifier)
                        ).toNumber(),
                        getTokenWantedRepresentation(offers[selectedOfferIndex].wanted_token_identifier, offers[selectedOfferIndex].wanted_token_nonce)
                      )}
                    </>
                  ) : (
                    "-"
                  )}
                </Box>
              </Flex>
              <Flex>
                {BigNumber(offers[selectedOfferIndex].wanted_token_amount).multipliedBy(amountOfTokens[selectedOfferIndex]).comparedTo(wantedTokenBalance) >
                  0 && (
                  <Text ml="146" color="red.400" fontSize="xs" mt="1 !important">
                    Your wallet token balance is too low to proceed
                  </Text>
                )}
              </Flex>
              <Flex fontSize="md" mt="2">
                <Box w="140px">Buyer Fee (per NFT)</Box>
                <Box>
                  :{" "}
                  {marketRequirements
                    ? `${marketRequirements.buyer_fee / 100}% (${convertWeiToEsdt(
                        BigNumber(offers[selectedOfferIndex].wanted_token_amount)
                          .multipliedBy(marketRequirements.buyer_fee)
                          .div(10000 + marketRequirements.buyer_fee),
                        tokenDecimals(offers[selectedOfferIndex].wanted_token_identifier)
                      ).toNumber()} ${getTokenWantedRepresentation(
                        offers[selectedOfferIndex].wanted_token_identifier,
                        offers[selectedOfferIndex].wanted_token_nonce
                      )})`
                    : "-"}
                </Box>
              </Flex>
              <Flex fontSize="md" mt="2">
                <Box w="140px">Total Fee</Box>
                <Box>
                  {": "}
                  {marketRequirements ? (
                    <>
                      {printPrice(
                        convertWeiToEsdt(
                          BigNumber(offers[selectedOfferIndex].wanted_token_amount).multipliedBy(amountOfTokens[selectedOfferIndex]),
                          tokenDecimals(offers[selectedOfferIndex].wanted_token_identifier)
                        ).toNumber(),
                        getTokenWantedRepresentation(offers[selectedOfferIndex].wanted_token_identifier, offers[selectedOfferIndex].wanted_token_nonce)
                      )}
                    </>
                  ) : (
                    "-"
                  )}
                </Box>
              </Flex>
              <Flex fontSize="xs" mt="0">
                <Box w="146px"></Box>
                <Box>
                  {marketRequirements ? (
                    <>
                      {BigNumber(offers[selectedOfferIndex].wanted_token_amount).comparedTo(0) <= 0 ? (
                        ""
                      ) : (
                        <>
                          {" " +
                            convertWeiToEsdt(
                              BigNumber(offers[selectedOfferIndex].wanted_token_amount)
                                .multipliedBy(amountOfTokens[selectedOfferIndex])
                                .multipliedBy(10000)
                                .div(10000 + marketRequirements.buyer_fee),
                              tokenDecimals(offers[selectedOfferIndex].wanted_token_identifier)
                            ).toNumber() +
                            " "}
                          {getTokenWantedRepresentation(offers[selectedOfferIndex].wanted_token_identifier, offers[selectedOfferIndex].wanted_token_nonce)}
                          {" + "}
                          {convertWeiToEsdt(
                            BigNumber(offers[selectedOfferIndex].wanted_token_amount)
                              .multipliedBy(amountOfTokens[selectedOfferIndex])
                              .multipliedBy(marketRequirements.buyer_fee)
                              .div(10000 + marketRequirements.buyer_fee),
                            tokenDecimals(offers[selectedOfferIndex].wanted_token_identifier)
                          ).toNumber()}
                          {" " +
                            getTokenWantedRepresentation(offers[selectedOfferIndex].wanted_token_identifier, offers[selectedOfferIndex].wanted_token_nonce)}
                        </>
                      )}
                    </>
                  ) : (
                    "-"
                  )}
                </Box>
              </Flex>
              <Flex mt="4 !important">
                <Button colorScheme="teal" variant="outline" size="sm" onClick={onReadTermsModalOpen}>
                  Read Terms of Use
                </Button>
              </Flex>
              <Checkbox size="sm" mt="3 !important" isChecked={readTermsChecked} onChange={(e: any) => setReadTermsChecked(e.target.checked)}>
                I have read all terms and agree to them
              </Checkbox>
              {!readTermsChecked && (
                <Text color="red.400" fontSize="xs" mt="1 !important">
                  You must READ and Agree on Terms of Use
                </Text>
              )}
              <Flex justifyContent="end" mt="4 !important">
                <Button
                  colorScheme="teal"
                  size="sm"
                  mx="3"
                  onClick={onProcure}
                  isDisabled={
                    !readTermsChecked ||
                    BigNumber(offers[selectedOfferIndex].wanted_token_amount).multipliedBy(amountOfTokens[selectedOfferIndex]).comparedTo(wantedTokenBalance) >
                      0
                  }>
                  Proceed
                </Button>
                <Button colorScheme="teal" size="sm" variant="outline" onClick={onProcureModalClose}>
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

export default MarketplaceLowerCard;
