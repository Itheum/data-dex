import React, { FC, useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Image, Link,
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
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import BigNumber from "bignumber.js";
import {
  CHAIN_TX_VIEWER,
  convertEsdtToWei,
  convertWeiToEsdt,
  isValidNumericCharacter,
  sleep,
  uxConfig,
} from "../libs/util";
import { DataNftMarketContract } from "../MultiversX/dataNftMarket";
import { getTokenWantedRepresentation, tokenDecimals } from "../MultiversX/tokenUtils";
import { DataNftMetadataType, ItemType, MarketplaceRequirementsType, OfferType } from "../MultiversX/types";
import { useChainMeta } from "../store/ChainMetaContext";
import { ShortAddress } from "../UtilComps/ShortAddress";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import moment from "moment/moment";
import { convertToLocalString } from "../libs/util2";
import { Address } from "@multiversx/sdk-core/out";

type MyListedDataLowerCardProps = {
  item: ItemType;
  offers: OfferType[];
  nftMetadatas: DataNftMetadataType[];
  index: number;
};

const MyListedDataLowerCard: FC<MyListedDataLowerCardProps> = (props) => {
  const { offers, index, nftMetadatas, item } = props;
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { chainMeta: _chainMeta } = useChainMeta() as any;
  const ChainExplorer = CHAIN_TX_VIEWER[_chainMeta.networkId as keyof typeof CHAIN_TX_VIEWER];
  const contract = new DataNftMarketContract("ED");
  const { isOpen: isDelistModalOpen, onOpen: onDelistModalOpen, onClose: onDelistModalClose } = useDisclosure();
  const { isOpen: isUpdatePriceModalOpen, onOpen: onUpdatePriceModalOpen, onClose: onUpdatePriceModalClose } = useDisclosure();
  const [selectedOfferIndex, setSelectedOfferIndex] = useState<number>(-1); // no selection
  const [delistAmount, setDelistAmount] = useState<number>(1);
  const [delistModalState, setDelistModalState] = useState<number>(0); // 0, 1
  const [marketRequirements, setMarketRequirements] = useState<MarketplaceRequirementsType | undefined>(undefined);
  const [newListingPrice, setNewListingPrice] = useState<number>(0);
  const [newListingPriceError, setNewListingPriceError] = useState<string>("");
  const [amountOfTokens, setAmountOfTokens] = useState<any>({});
  const [maxPaymentFeeMap, setMaxPaymentFeeMap] = useState<Record<string, number>>({});
  const [delistAmountError, setDelistAmountError] = useState<string>("");
  const itheumToken = _chainMeta.contracts.itheumToken;
  const toast = useToast();
  const { address } = useGetAccountInfo();

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
      const _marketRequirements = await contract.getRequirements();
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
  }, []);

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
      <Flex display="flex" flexDirection="column">
        <Box color="gray.600" fontSize="sm">
          Creator: <ShortAddress address={new Address(nftMetadatas[index]?.creator)} />
          <Link href={`${ChainExplorer}/accounts/${new Address(nftMetadatas[index]?.creator)}`} isExternal>
            <ExternalLinkIcon mx="2px" />
          </Link>
        </Box>

        <Box color="gray.600" fontSize="sm">
          Owner: <ShortAddress address={new Address(item?.owner)} />
          <Link href={`${ChainExplorer}/accounts/${new Address(item?.owner)}`} isExternal>
            <ExternalLinkIcon mx="2px" />
          </Link>
        </Box>
        <Box display="flex" flexDirection="column" justifyContent="flex-start" alignItems="flex-start" gap="1" my="1" height="5rem">
          {address && address == nftMetadatas[index]?.creator && (
            <Badge borderRadius="full" px="2" colorScheme="teal">
              <Text>You are the Creator</Text>
            </Badge>
          )}

          {address && address == item?.owner && (
            <Badge borderRadius="full" px="2" colorScheme="teal">
              <Text>You are the Owner</Text>
            </Badge>
          )}

          <Badge borderRadius="full" px="2" colorScheme="blue">
            Fully Transferable License
          </Badge>
        </Box>
      </Flex>
      <Box display="flex" justifyContent="flex-start" mt="2">
        <Text fontSize="xs">{`Creation time:   ${moment(nftMetadatas[index]?.creationTime).format(uxConfig.dateStr)}`}</Text>
      </Box>

      {nftMetadatas[index] && (
        <Box color="gray.600" fontSize="sm">
          {`Listed: ${item?.quantity}`} <br />
          {`Total supply: ${nftMetadatas[index]?.supply}`} <br />
          {`Royalty: ${convertToLocalString(nftMetadatas[index]?.royalties * 100)}%`}
        </Box>
      )}

      <Button
        mt="2"
        size="sm"
        colorScheme="teal"
        height="7"
        variant="outline"
        onClick={() => {
          window.open(nftMetadatas[index].dataPreview);
        }}>
        Preview Data
      </Button>

      <Flex mt="2" gap="2">
        <Button
          size="xs"
          colorScheme="teal"
          width="90px"
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
          size="xs"
          colorScheme="teal"
          width="90px"
          isDisabled={hasPendingTransactions}
          onClick={() => {
            setSelectedOfferIndex(index);
            if (marketRequirements) {
              setNewListingPrice(
                convertWeiToEsdt(
                  BigNumber(offers[index].wanted_token_amount)
                    .multipliedBy(amountOfTokens[index])
                    .multipliedBy(10000)
                    .div(10000 + marketRequirements.buyer_fee),
                  tokenDecimals(offers[index].wanted_token_identifier)
                ).toNumber()
              );
            } else {
              setNewListingPrice(0);
            }
            console.log(amountOfTokens[index]);
            onUpdatePriceModalOpen();
          }}>
          Update Price
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
                        <Text fontWeight="bold" fontSize="md" backgroundColor="blackAlpha.300" px="1">
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
                  <Flex mt="8" justifyContent="flex-start" alignItems="center">
                    <Text width="160px" fontSize="md">
                      How many would you like to delist?
                    </Text>
                    <NumberInput
                      size="xs"
                      ml="30px"
                      maxW={16}
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
                    <Button
                      colorScheme="teal"
                      size="xs"
                      variant="outline"
                      ml="2"
                      onClick={() => {
                        setDelistAmount(offers[selectedOfferIndex]?.quantity);
                        console.log(offers[selectedOfferIndex]?.quantity);
                      }}>
                      De-List All
                    </Button>
                  </Flex>
                  {delistAmountError && (
                    <Text color="red.400" fontSize="xs" ml="190px" mt="1">
                      {delistAmountError}
                    </Text>
                  )}
                  <Flex justifyContent="end" mt="6 !important">
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
                        <Text fontWeight="bold" fontSize="md" backgroundColor="blackAlpha.300" px="1">
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
                  <Text fontSize="md" mt="8" width={205}>
                    You are about to de-list {delistAmount} Data NFT{delistAmount > 1 ? "s" : ""} from the Public Marketplace.
                  </Text>
                  <Flex justifyContent="end" mt="6 !important">
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
                  <Text fontSize="lg">Update Listing Price for Each</Text>
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
              <Box mt="8">
                <Flex justifyContent="flex-start" alignItems="center">
                  <Text width="160px" fontSize="md">
                    Current Price per Data NFT
                  </Text>
                  <Box>
                    :{" "}
                    {marketRequirements &&
                      convertWeiToEsdt(
                        BigNumber(offers[selectedOfferIndex].wanted_token_amount)
                          .multipliedBy(amountOfTokens[selectedOfferIndex] as number)
                          .multipliedBy(10000)
                          .div(10000 + (marketRequirements.buyer_fee as number)),
                        tokenDecimals(offers[selectedOfferIndex].wanted_token_identifier)
                      ).toNumber()}{" "}
                    {getTokenWantedRepresentation(offers[selectedOfferIndex].wanted_token_identifier, offers[selectedOfferIndex].wanted_token_nonce)}
                  </Box>
                </Flex>
                <Flex justifyContent="flex-start" alignItems="center">
                  <Text width="160px" fontSize="md">
                    New Price
                  </Text>
                  <NumberInput
                    size="xs"
                    maxW={16}
                    step={5}
                    min={0}
                    max={maxPaymentFeeMap[itheumToken] ? maxPaymentFeeMap[itheumToken] : 0} // need to update hardcoded tokenId
                    isValidCharacter={isValidNumericCharacter}
                    value={newListingPrice}
                    onChange={(valueAsString) => {
                      const value = Number(valueAsString);
                      let error = "";
                      if (value < 0) error = "Cannot be negative";
                      if (value > maxPaymentFeeMap[itheumToken] ? maxPaymentFeeMap[itheumToken] : 0) error = "Cannot exceed maximum listing price";
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
                  <Text color="red.400" fontSize="xs" ml="164px" mt="1">
                    {newListingPriceError}
                  </Text>
                )}
              </Box>
              <Flex justifyContent="end" mt="6 !important">
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
