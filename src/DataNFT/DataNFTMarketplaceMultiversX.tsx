import React, { FC, useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Heading,
  HStack,
  Image,
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
  Stack,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import BigNumber from "bignumber.js";
import { useLocation, useNavigate } from "react-router-dom";
import { CHAIN_TX_VIEWER, convertEsdtToWei, convertWeiToEsdt, isValidNumericCharacter, sleep } from "libs/util";
import { getAccountTokenFromApi, getNftsByIds } from "MultiversX/api";
import moment from "moment";
import { convertToLocalString } from "libs/util2";
import { DataNftMintContract } from "MultiversX/dataNftMint";
import { DataNftMetadataType, ItemType, MarketplaceRequirementsType, OfferType } from "MultiversX/types";
import { useChainMeta } from "store/ChainMetaContext";
import { SkeletonLoadingList } from "UtilComps/SkeletonLoadingList";
import { CustomPagination } from "./CustomPagination";
import MarketplaceLowerCard from "./MarketplaceLowerCard";
import MyListedDataLowerCard from "./MyListedDataLowerCard";
import { DataNftMarketContract } from "../MultiversX/dataNftMarket";
import { getTokenWantedRepresentation, hexZero, tokenDecimals } from "../MultiversX/tokenUtils.js";
import UpperCardComponent from "../UtilComps/UpperCardComponent";
import useThrottle from "../UtilComps/UseThrottle";

interface PropsType {
  tabState: number; // 1 for "Public Marketplace", 2 for "My Data NFTs"
}

export const Marketplace: FC<PropsType> = ({ tabState }) => {
  const navigate = useNavigate();
  const { pageNumber } = useParams();
  const pageIndex = pageNumber ? Number(pageNumber) : 0;

  const { chainMeta: _chainMeta } = useChainMeta() as any;
  const itheumToken = _chainMeta.contracts.itheumToken;
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const toast = useToast();
  const [loadingOffers, setLoadingOffers] = useState<boolean>(false);
  const [amountOfTokens, setAmountOfTokens] = useState<any>({});
  const [amountErrors, setAmountErrors] = useState<string[]>([]);
  const [selectedOfferIndex, setSelectedOfferIndex] = useState<number>(-1); // no selection
  const [nftMetadatas, setNftMetadatas] = useState<DataNftMetadataType[]>([]);
  const [nftMetadatasLoading, setNftMetadatasLoading] = useState<boolean>(false);
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
  const [items, setItems] = useState<ItemType[]>([
    {
      index: 0,
      owner: "",
      wanted_token_identifier: "",
      wanted_token_amount: "",
      wanted_token_nonce: 0,
      offered_token_identifier: "",
      offered_token_nonce: 0,
      balance: 0,
      supply: 0,
      royalties: 0,
      id: "",
      dataPreview: "",
      quantity: 0,
      nonce: 0,
      nftImgUrl: "",
      title: "",
      tokenName: "",
    }
    ]);

  const [wantedTokenBalance, setWantedTokenBalance] = useState<string>("0");

  //
  const { isOpen: isDelistModalOpen, onOpen: onDelistModalOpen, onClose: onDelistModalClose } = useDisclosure();
  const [delistModalState, setDelistModalState] = useState<number>(0); // 0, 1
  const [delistAmount, setDelistAmount] = useState<number>(1);
  const [delistAmountError, setDelistAmountError] = useState<string>("");

  //
  const { isOpen: isUpdatePriceModalOpen, onOpen: onUpdatePriceModalOpen, onClose: onUpdatePriceModalClose } = useDisclosure();
  const [newListingPrice, setNewListingPrice] = useState<number>(0);
  const [newListingPriceError, setNewListingPriceError] = useState<string>("");

  // pagination
  const [pageCount, setPageCount] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const marketplace = "/datanfts/marketplace";
  const location = useLocation();

  const setPageIndex = (newPageIndex: number) => {
    navigate(`/datanfts/marketplace/${tabState === 1 ? 'market' : 'my'}/${newPageIndex}`);
  };

  const onGotoPage = useThrottle((newPageIndex: number) => {
    if (0 <= newPageIndex && newPageIndex < pageCount) {
      setPageIndex(newPageIndex);
    }
  });

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
      setItems((prev) => {
        return _offers.map((offer: OfferType, i: number) => {
            return {
              ...prev?.[i] ?? {},
              index: offer.index,
              owner: offer.owner,
              wanted_token_identifier: offer.wanted_token_identifier,
              wanted_token_amount: offer.wanted_token_amount,
              wanted_token_nonce: offer.wanted_token_nonce,
              offered_token_identifier: offer.offered_token_identifier,
              offered_token_nonce: offer.offered_token_nonce,
              quantity: offer.quantity,
            };
          });
      });
      console.log("items", items);
      // end loading offers
      setLoadingOffers(false);

      //
      const amounts: any = {};
      const _amountErrors: string[] = [];
      for (let i = 0; i < _offers.length; i++) {
        amounts[i] = 1;
        _amountErrors.push("");
      }
      setAmountOfTokens(amounts);
      setAmountErrors(_amountErrors);

      //
      setNftMetadatasLoading(true);
      const nftIds = _offers.map((offer) => `${offer.offered_token_identifier}-${hexZero(offer.offered_token_nonce)}`);
      const _nfts = await getNftsByIds(nftIds, _chainMeta.networkId);
      const _metadatas: DataNftMetadataType[] = [];
      for (let i = 0; i < _nfts.length; i++) {
        _metadatas.push(mintContract.decodeNftAttributes(_nfts[i], i));
      }
      console.log("_metadatas", _metadatas);
      setNftMetadatas(_metadatas);
      setNftMetadatasLoading(false);
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
      const _userData = await mintContract.getUserDataOut(address, itheumToken);
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

  function nftIsOwnedByAnotherAddress(offer: OfferType) {
    return address && address != offer.owner;
  }

  return (
    <>
      <Stack spacing={5}>
        <Heading size="lg">Data NFT Marketplace</Heading>

        <Flex mt="5" pr="5" gap="12px" justifyContent={{ base: "center", md: "flex-start" }} flexDirection={{ base: "row", md: "row" }}>
          <Button
            colorScheme="teal"
            width={{ base: "160px", md: "160px" }}
            isDisabled={tabState === 1}
            _disabled={{ opacity: 1 }}
            opacity={0.4}
            onClick={() => {
              setPageIndex(0);
              navigate("/datanfts/marketplace/market/0");
            }}>
            Public Marketplace
          </Button>
          <Button
            colorScheme="teal"
            width={{ base: "160px", md: "160px" }}
            isDisabled={tabState === 2}
            _disabled={{ opacity: 1 }}
            opacity={0.4}
            onClick={() => {
              setPageIndex(0);
              navigate("/datanfts/marketplace/my/0");
            }}>
            My Listed Data NFTs
          </Button>

          <Box flexGrow="1" />

          <CustomPagination pageCount={pageCount} pageIndex={pageIndex} pageSize={pageSize} gotoPage={onGotoPage} />
        </Flex>

        {loadingOffers ? (
          <SkeletonLoadingList />
        ) : offers.length === 0 ? (
          <Text>No data yet...</Text>
        ) : (
          <Flex wrap="wrap" gap="5">
            {offers.length > 0 &&
              items?.map((item, index) => (
                <div key={index}>
                  <UpperCardComponent
                    nftImageLoading={oneNFTImgLoaded}
                    setNftImageLoading={setOneNFTImgLoaded}
                    nftMetadataLoading={nftMetadatasLoading}
                    nftMetadatas={nftMetadatas}
                    marketRequirements={marketRequirements}
                    item={item}
                    userData={userData}
                    index={index}>
                    {location.pathname === marketplace && nftMetadatas.length > 0 ? (
                      <MarketplaceLowerCard nftMetadatas={nftMetadatas} index={index} item={item} offers={offers} />
                    ) : (
                      <MyListedDataLowerCard index={index} offers={items} nftMetadatas={nftMetadatas} />
                    )}
                  </UpperCardComponent>
                </div>
              ))}
          </Flex>
        )}

        {
          /* show bottom pagination only if offers exist */
          offers.length > 0 && (
            <Flex justifyContent="right" mt="5" pr="5">
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
                      {/*{printPrice(*/}
                      {/*  convertWeiToEsdt(*/}
                      {/*    BigNumber(offers[selectedOfferIndex].wanted_token_amount)*/}
                      {/*      .multipliedBy(10000)*/}
                      {/*      .div(10000 + marketRequirements.buyer_fee),*/}
                      {/*    tokenDecimals(offers[selectedOfferIndex].wanted_token_identifier)*/}
                      {/*  ).toNumber(),*/}
                      {/*  getTokenWantedRepresentation(offers[selectedOfferIndex].wanted_token_identifier, offers[selectedOfferIndex].wanted_token_nonce)*/}
                      {/*)}*/}
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
                  {marketRequirements ? (
                    <>
                      {/*{printPrice(*/}
                      {/*  convertWeiToEsdt(*/}
                      {/*    BigNumber(offers[selectedOfferIndex].wanted_token_amount).multipliedBy(amountOfTokens[selectedOfferIndex]),*/}
                      {/*    tokenDecimals(offers[selectedOfferIndex].wanted_token_identifier)*/}
                      {/*  ).toNumber(),*/}
                      {/*  getTokenWantedRepresentation(offers[selectedOfferIndex].wanted_token_identifier, offers[selectedOfferIndex].wanted_token_nonce)*/}
                      {/*)}*/}
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
                    <Button colorScheme="teal" size="xs" variant="outline" ml="2" onClick={() => setDelistAmount(offers[selectedOfferIndex].quantity)}>
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

export default Marketplace;
