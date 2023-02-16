import React, {useEffect, useState} from "react";
import {ExternalLinkIcon} from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Flex,
  Heading,
  HStack,
  Image,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Skeleton,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import {useGetAccountInfo} from "@multiversx/sdk-dapp/hooks/account";
import {useGetPendingTransactions} from "@multiversx/sdk-dapp/hooks/transactions";
import BigNumber from "bignumber.js";
import moment from "moment";
import {CHAIN_TX_VIEWER, convertEsdtToWei, convertWeiToEsdt, isValidNumericCharacter, sleep, uxConfig} from "libs/util";
import {getAccountTokenFromApi, getApi, getNftsByIds} from "MultiversX/api";
import {DataNftMintContract} from "MultiversX/dataNftMint";
import {DataNftMetadataType, MarketplaceRequirementsType, OfferType} from "MultiversX/types";
import {useChainMeta} from "store/ChainMetaContext";
import SkeletonLoadingList from "UtilComps/SkeletonLoadingList";
import {CustomPagination} from "./CustomPagination";
import {DataNftMarketContract} from "../MultiversX/dataNftMarket";
import {getTokenWantedRepresentation, hexZero, tokenDecimals} from "../MultiversX/tokenUtils.js";

function printPrice(price: number, token: string): string {
  return price <= 0 ? "FREE" : `${price} ${token}`;
}

export default function Marketplace() {
  const { chainMeta: _chainMeta } = useChainMeta() as any;
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const toast = useToast();
  const [tabState, setTabState] = useState<number>(1); // 1 for "Public Marketplace", 2 for "My Data NFTs"
  const [loadingOffers, setLoadingOffers] = useState<boolean>(false);
  const [amountOfTokens, setAmountOfTokens] = useState<any>({});
  const [selectedOfferIndex, setSelectedOfferIndex] = useState<number>(-1); // no selection
  const [nftMetadatas, setNftMetadatas] = useState<DataNftMetadataType[]>([]);
  const contract = new DataNftMarketContract("ED");
  const { isOpen: isProcureModalOpen, onOpen: onProcureModalOpen, onClose: onProcureModalClose } = useDisclosure();
  const { isOpen: isReadTermsModalOpen, onOpen: onReadTermsModalOpen, onClose: onReadTermsModalClose } = useDisclosure();
  const [readTermsChecked, setReadTermsChecked] = useState(false);
  const [oneNFTImgLoaded, setOneNFTImgLoaded] = useState(false);
  const [userData, setUserData] = useState<any>({});
  const [marketRequirements, setMarketRequirements] = useState<MarketplaceRequirementsType | undefined>(undefined);
  const [maxPaymentFeeMap, setMaxPaymentFeeMap] = useState<Record<string, number>>({});
  const mintContract = new DataNftMintContract(_chainMeta.networkId);

  //
  const [offers, setOffers] = useState<OfferType[]>([]);
  const [wantedTokenBalance, setWantedTokenBalance] = useState<string>("0");

  //
  const { isOpen: isDelistModalOpen, onOpen: onDelistModalOpen, onClose: onDelistModalClose } = useDisclosure();
  const [delistModalState, setDelistModalState] = useState<number>(0); // 0, 1
  const [delistAmount, setDelistAmount] = useState<number>(1);

  //
  const { isOpen: isUpdatePriceModalOpen, onOpen: onUpdatePriceModalOpen, onClose: onUpdatePriceModalClose } = useDisclosure();
  const [newListingPrice, setNewListingPrice] = useState<number>(0);
  const [newListingPriceError, setNewListingPriceError] = useState<string>('');

  // pagination
  const [pageCount, setPageCount] = useState<number>(1);
  const [pageIndex, setPageIndex] = useState<number>(0); // pageIndex starts from 0
  const [pageSize, setPageSize] = useState<number>(8);
  const onGotoPage = (newPageIndex: number) => {
    if (0 <= newPageIndex && newPageIndex < pageCount) {
      setPageIndex(newPageIndex);
    }
  };

  //
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
  }, []);
  useEffect(() => {
    (async () => {
      let _numberOfOffers = 0;
      if (tabState === 1) {
        // global offers
        _numberOfOffers = await contract.getNumberOfOffers();
      } else {
        // offers of User
        _numberOfOffers = await contract.getUserTotalOffers(address);
      }
      console.log("_numberOfOffers", _numberOfOffers);
      const _pageCount = Math.max(1, Math.ceil(_numberOfOffers / pageSize));
      setPageCount(_pageCount);

      // if pageIndex is out of range
      if (pageIndex >= _pageCount) {
        onGotoPage(0);
      }
    })();
  }, [hasPendingTransactions, tabState]);

  useEffect(() => {
    (async () => {
      // init - no selection
      setSelectedOfferIndex(-1);

      // start loading offers
      setLoadingOffers(true);
      const _offers = await contract.viewPagedOffers(pageIndex * pageSize, (pageIndex + 1) * pageSize - 1, tabState === 1 ? "" : address);
      console.log("_offers", _offers);
      setOffers(_offers);
      // end loading offers
      setLoadingOffers(false);

      //
      const amounts: any = {};
      for (let i = 0; i < _offers.length; i++) {
        amounts[i] = 1;
      }
      setAmountOfTokens(amounts);

      //
      const nftIds = _offers.map((offer) => `${offer.offered_token_identifier}-${hexZero(offer.offered_token_nonce)}`);
      const _nfts = await getNftsByIds(nftIds, _chainMeta.networkId);
      const _metadatas: DataNftMetadataType[] = [];
      for (let i = 0; i < _nfts.length; i++) {
        _metadatas.push(mintContract.decodeNftAttributes(_nfts[i], i));
      }
      console.log("_metadatas", _metadatas);
      setNftMetadatas(_metadatas);
    })();
  }, [pageIndex, pageSize, tabState, hasPendingTransactions]);

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

  const getUserData = async () => {
    if (address) {
      const _userData = await mintContract.getUserDataOut(address, _chainMeta.contracts.itheumToken);
      setUserData(_userData);
    }
  };
  useEffect(() => {
    getUserData();
  }, [address, hasPendingTransactions]);
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

  const ChainExplorer = CHAIN_TX_VIEWER[_chainMeta.networkId as keyof typeof CHAIN_TX_VIEWER];

  return (
    <>
      <Stack spacing={5}>
        <Heading size="lg">Data NFT Marketplace</Heading>
        <Flex mt="5" gap="12px" justifyContent={{ base: "center", md: "flex-start" }} flexDirection={{ base: "row", md: "row" }}>
          <Button
            colorScheme="teal"
            width={{ base: "160px", md: "160px" }}
            isDisabled={tabState === 1}
            _disabled={{ opacity: 1 }}
            opacity={0.4}
            onClick={() => setTabState(1)}
          >
            Public Marketplace
          </Button>
          <Button
            colorScheme="teal"
            width={{ base: "160px", md: "160px" }}
            isDisabled={tabState === 2}
            _disabled={{ opacity: 1 }}
            opacity={0.4}
            onClick={() => setTabState(2)}
          >
            My Listed Data NFTs
          </Button>
        </Flex>

        <Flex justifyContent="center" alignItems="center">
          <CustomPagination
            pageCount={pageCount}
            pageIndex={pageIndex}
            pageSize={pageSize}
            gotoPage={onGotoPage}
            // setPageSize={() => (() => {})}
          />
        </Flex>

        {loadingOffers ? (
          <SkeletonLoadingList />
        ) : offers.length === 0 ? (
          <Text>No data yet...</Text>
        ) : (
          <Flex wrap="wrap">
            {offers.length > 0 &&
              offers.map((offer, index) => (
                <Box key={index} maxW="xs" borderWidth="1px" borderRadius="lg" overflow="wrap" mr="1rem" mb="1rem" position="relative" w="15.5rem">
                  <Flex justifyContent="center" pt={5}>
                    <Skeleton isLoaded={oneNFTImgLoaded} h={200}>
                      <Image
                        src={`https://${getApi("ED")}/nfts/${offer.offered_token_identifier}-${hexZero(offer.offered_token_nonce)}/thumbnail`}
                        alt={"item.dataPreview"}
                        h={200}
                        w={200}
                        borderRadius="md"
                        onLoad={() => setOneNFTImgLoaded(true)}
                      />
                    </Skeleton>
                  </Flex>

                  <Flex h="30rem" p="3" direction="column" justify="space-between">
                    {nftMetadatas[index] && (
                      <>
                        <Text fontSize="xs">
                          <Link href={`${ChainExplorer}/nfts/${nftMetadatas[index].id}`} isExternal>
                            {nftMetadatas[index].tokenName} <ExternalLinkIcon mx='2px' />
                          </Link>
                        </Text>

                        <Text fontWeight="bold" fontSize="lg" mt="2">                       
                          {nftMetadatas[index].title}
                        </Text>
                        
                        <Flex flexGrow="1">
                          <Popover trigger="hover" placement="auto">
                            <PopoverTrigger>
                              <Text fontSize="sm" mt="2" color="gray.300" noOfLines={[1, 2, 3]}>
                                {nftMetadatas[index].description}
                              </Text>
                            </PopoverTrigger>
                            <PopoverContent mx="2" width="220px" mt="-7">
                              <PopoverHeader fontWeight="semibold">{nftMetadatas[index].tokenName}</PopoverHeader>
                              <PopoverArrow />
                              <PopoverCloseButton />
                              <PopoverBody>
                                <Text fontSize="sm" mt="2" color="gray.300">
                                  {nftMetadatas[index].description}
                                </Text>
                              </PopoverBody>
                            </PopoverContent>
                          </Popover>
                        </Flex>

                        <Box color="gray.600" fontSize="sm">
                          {`Creator: ${nftMetadatas[index].creator.slice(0, 8)} ... ${nftMetadatas[index].creator.slice(-8)}`}

                          <Link href={`${ChainExplorer}/accounts/${nftMetadatas[index].creator}`} isExternal>
                            <ExternalLinkIcon mx='2px' />
                          </Link>
                        </Box>

                        <Box display="flex" flexDirection="column" justifyContent="flex-start" alignItems="flex-start" gap="1" my="1" height="5rem">
                          {address && address == nftMetadatas[index].creator && (
                            <Badge borderRadius="full" px="2" colorScheme="teal">
                              <Text>You are the Creator</Text>
                            </Badge>
                          )}

                          {address && address == offer.owner && (
                            <Badge borderRadius="full" px="2" colorScheme="teal">
                              <Text>You are the Owner</Text>
                            </Badge>
                          )}

                          <Badge borderRadius="full" px="2" colorScheme="blue">
                            Fully Transferable License
                          </Badge>
                        </Box>

                        <Box display="flex" justifyContent="flex-start" mt="2">
                          <Text fontSize="xs">{`Creation time:   ${moment(nftMetadatas[index].creationTime).format(uxConfig.dateStr)}`}</Text>
                        </Box>

                        <Box color="gray.600" fontSize="sm">
                          {`Balance: ${offer.quantity} out of ${nftMetadatas[index].supply}. Royalty: ${nftMetadatas[index].royalties * 100}%`}
                        </Box>
                      </>
                    )}

                    <Box fontSize="xs" mt="2">
                      <Text>
                        Fee per NFT:
                        {marketRequirements ? (
                          <>
                            {" "}
                            {printPrice(
                              convertWeiToEsdt(
                                offer.wanted_token_amount,
                                tokenDecimals(offer.wanted_token_identifier)
                              ).toNumber(),
                              getTokenWantedRepresentation(offer.wanted_token_identifier, offer.wanted_token_nonce)
                            )}
                          </>
                        ) : (
                          " -"
                        )}
                      </Text>
                    </Box>

                    {
                      /* Public Marketplace: Hide Procure part if NFT is owned by User */
                      tabState === 1 && address && address != offer.owner && (
                        <>
                          <HStack mt="2" h="3rem">
                            <Text fontSize="xs">How many to procure </Text>
                            <NumberInput
                              size="xs"
                              maxW={16}
                              step={1}
                              min={1}
                              max={offer.quantity}
                              isValidCharacter={isValidNumericCharacter}
                              value={amountOfTokens[index]}
                              onChange={(valueString) =>
                                setAmountOfTokens((oldAmounts: any) => {
                                  const newAmounts = { ...oldAmounts };
                                  newAmounts[index] = Number(valueString);
                                  return newAmounts;
                                })
                              }
                            >
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
                              isDisabled={hasPendingTransactions}
                              onClick={() => {
                                setReadTermsChecked(false);
                                setSelectedOfferIndex(index);
                                onProcureModalOpen();
                              }}
                            >
                              Procure
                            </Button>
                          </HStack>
                        </>
                      ) || <Box mt="2" h="3rem" />
                    }

                    {
                      tabState === 2 && address && (
                        <>
                          <Flex mt="2" gap="2" >
                            <Button
                              size="xs"
                              colorScheme="teal"
                              width="72px"
                              isDisabled={hasPendingTransactions}
                              onClick={() => {
                                setSelectedOfferIndex(index);
                                setDelistAmount(offers[index].quantity);
                                setDelistModalState(1);
                                onDelistModalOpen();
                              }}
                            >
                              De-List All
                            </Button>
                            {offers[index].quantity > 1 && (
                              <Button
                                size="xs"
                                colorScheme="teal"
                                width="72px"
                                isDisabled={hasPendingTransactions}
                                onClick={() => {
                                  setSelectedOfferIndex(index);
                                  setDelistAmount(1);
                                  setDelistModalState(0);
                                  onDelistModalOpen();
                                }}
                              >
                                De-List Some
                              </Button>
                            )}
                            <Button
                              size="xs"
                              colorScheme="teal"
                              width="72px"
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
                                onUpdatePriceModalOpen();
                              }}
                            >
                              Update Price
                            </Button>
                          </Flex>
                        </>
                      )
                    }
                  </Flex>
                  
                  <Box
                    position="absolute"
                    top="0"
                    bottom="0"
                    left="0"
                    right="0"
                    height="100%"
                    width="100%"
                    backgroundColor="blackAlpha.800"
                    visibility={
                      userData.addressFrozen || (userData.frozenNonces && userData.frozenNonces.includes(offer.offered_token_nonce)) ? "visible" : "collapse"
                    }
                  >
                    <Text
                      fontSize="md"
                      position="absolute"
                      top="45%"
                      textAlign="center"
                      px="2"
                    >
                      - FROZEN - <br />
                      Data NFT is under investigation by the DAO as there was a complaint received against it
                    </Text>
                  </Box>
                </Box>
              ))}
          </Flex>
        )}

        {
          /* show bottom pagination only if offers exist */
          offers.length > 0 && (
            <Flex justifyContent="center" alignItems="center">
              <CustomPagination
                pageCount={pageCount}
                pageIndex={pageIndex}
                pageSize={pageSize}
                gotoPage={onGotoPage}
                // setPageSize={() => (() => {})}
              />
            </Flex>
          )
        }
      </Stack>
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
                  }
                >
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
      <Modal isOpen={isReadTermsModalOpen} onClose={onReadTermsModalClose} closeOnEsc={false} closeOnOverlayClick={false}>
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px) hue-rotate(90deg)" />
        <ModalContent>
          <ModalHeader>Data NFT-FT Terms of Use</ModalHeader>
          <ModalBody pb={6}>
            <Text>
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since
              the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries,
              but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset
              sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
            </Text>
            <Flex justifyContent="end" mt="6 !important">
              <Button colorScheme="teal" onClick={onReadTermsModalClose}>
                I have read this
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
      {selectedOfferIndex >= 0 && selectedOfferIndex < offers.length && (
        <Modal isOpen={isDelistModalOpen} onClose={onDelistModalClose} closeOnEsc={false} closeOnOverlayClick={false}>
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px) hue-rotate(90deg)" />
          <ModalContent>
            {delistModalState === 0 ? (
              <>
                <ModalBody py={6}>
                  <HStack spacing={5} alignItems="center">
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
                      onChange={(valueAsString, valueAsNumber) => setDelistAmount(valueAsNumber)}
                      keepWithinRange={true}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Flex>
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
                <ModalHeader>Are you sure?</ModalHeader>
                <ModalBody pb={6}>
                  <Text fontSize="md" mt="2">
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
                    {convertWeiToEsdt(
                      BigNumber(offers[selectedOfferIndex].wanted_token_amount)
                        .multipliedBy(amountOfTokens[selectedOfferIndex])
                        .multipliedBy(10000)
                        .div(10000 + marketRequirements.buyer_fee),
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
                    max={maxPaymentFeeMap["ITHEUM-a61317"] ? maxPaymentFeeMap["ITHEUM-a61317"] : 0} // need to update hardcoded tokenId
                    isValidCharacter={isValidNumericCharacter}
                    value={newListingPrice}
                    onChange={(valueAsString, valueAsNumber) => {
                      let error = '';
                      if (valueAsNumber < 0) error = 'Cannot be negative';
                      if (valueAsNumber > maxPaymentFeeMap["ITHEUM-a61317"] ? maxPaymentFeeMap["ITHEUM-a61317"] : 0) error = 'Cannot exceed maximum listing price';
                      setNewListingPriceError(error);
                      setNewListingPrice(!valueAsNumber ? 0 : valueAsNumber);
                    }}
                    keepWithinRange={true}
                  >
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
}
