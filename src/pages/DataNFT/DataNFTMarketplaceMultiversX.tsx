import React, { FC, useEffect, useState } from "react";
import { Icon } from "@chakra-ui/icons";
import {
  Box,
  Card,
  CardBody,
  Checkbox,
  CloseButton,
  Flex,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Tooltip,
  Spinner,
  useColorMode,
  useDisclosure,
  useToast,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { DataNft, Offer } from "@itheum/sdk-mx-data-nft/out";
import { Address, TransactionWatcher } from "@multiversx/sdk-core/out";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetAccountInfo, useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { SignedTransactionsBodyType } from "@multiversx/sdk-dapp/types";
import BigNumber from "bignumber.js";
import { FaBrush, FaStore } from "react-icons/fa";
import { MdOutlineInfo } from "react-icons/md";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CustomPagination } from "components/CustomPagination";
import MarketplaceLowerCard from "components/MarketplaceLowerCard";
import MyListedDataLowerCard from "components/MyListedDataLowerCard";
import NftMediaComponent from "components/NftMediaComponent";
import ProcureDataNFTSuccessCTAModel from "components/ProcureDataNFTSuccessCTAModel";
import { NoDataHere } from "components/Sections/NoDataHere";
import ConditionalRender from "components/UtilComps/ApiWrapper";
import UpperCardComponent from "components/UtilComps/UpperCardComponent";
import useThrottle from "components/UtilComps/UseThrottle";
import { getOfersAsCollectionFromBackendApi, getOffersCountFromBackendApi, getOffersFromBackendApi } from "libs/MultiversX";
import { getApi, getNetworkProvider, getNftsByIds } from "libs/MultiversX/api";
import { DataNftMarketContract } from "libs/MultiversX/dataNftMarket";
import { DataNftMintContract } from "libs/MultiversX/dataNftMint";
import { DataNftCollectionType } from "libs/MultiversX/types";
import { convertWeiToEsdt, createNftId, hexZero, getBondsForOffers, sleep, tokenDecimals } from "libs/utils";
import { DataNFTCollectionObject } from "libs/utils/types/marketplace";
import DataNFTDetails from "pages/DataNFT/DataNFTDetails";
import { useMarketStore } from "store";
import { FeaturedDataNFTListings } from "./components/FeaturedDataNFTListings";
import { DataNftCollectionCard } from "./DataNftCollection";

interface PropsType {
  tabState: number; // 1 for "Public Marketplace", 2 for "My Data NFTs"
}

export const Marketplace: FC<PropsType> = ({ tabState }) => {
  const toast = useToast();
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();
  const { pageNumber } = useParams();
  const pageIndex = pageNumber ? Number(pageNumber) : 0;
  const { chainID } = useGetNetworkConfig();
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions, pendingTransactions } = useGetPendingTransactions();
  const mintContract = new DataNftMintContract(chainID);
  const marketContract = new DataNftMarketContract(chainID);
  const isMarketPaused = useMarketStore((state) => state.isMarketPaused);
  const extendedOffers = useMarketStore((state) => state.offers);
  const updateOffers = useMarketStore((state) => state.updateOffers);
  const loadingOffers = useMarketStore((state) => state.loadingOffers);
  const updateLoadingOffers = useMarketStore((state) => state.updateLoadingOffers);

  // pagination
  const pageCount = useMarketStore((state) => state.pageCount);
  const updatePageCount = useMarketStore((state) => state.updatePageCount);
  const pageSize = 8;

  const [nftMetadatas, setNftMetadatas] = useState<DataNft[]>([]);
  const [nftMetadatasLoading, setNftMetadatasLoading] = useState<boolean>(false);
  const [oneNFTImgLoaded, setOneNFTImgLoaded] = useState(false);
  const [marketFreezedNonces, setMarketFreezedNonces] = useState<number[]>([]);
  const isApiUp = useMarketStore((state) => state.isApiUp);
  const isMarketplaceApiUp = useMarketStore((state) => state.isMarketplaceApiUp);
  const [offerForDrawer, setOfferForDrawer] = useState<Offer | undefined>();
  const { isOpen: isOpenDataNftDetails, onOpen: onOpenDataNftDetails, onClose: onCloseDataNftDetails } = useDisclosure();
  const { isOpen: isOpenDataNftCollectionModal, onOpen: onOpenDataNftCollectionModal, onClose: onCloseDataNftCollectionModal } = useDisclosure();
  const [collectionForDrawer, setCollectionForDrawer] = useState<DataNFTCollectionObject | undefined>();
  const [myListedCount, setMyListedCount] = useState<number>(0);
  const [publicMarketCount, setPublicMarketCount] = useState<number>(0);
  const [showGroupedDataNfts, setShowGroupedDataNfts] = useState(true);
  const [groupedCollections, setGroupedCollections] = useState<DataNFTCollectionObject[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const hasWebWalletTx = sessionStorage.getItem("web-wallet-tx");
  const { isOpen: isMintFeeInfoVisible, onClose, onOpen } = useDisclosure({ defaultIsOpen: false });
  const { isOpen: isProcureSuccessCTAModalOpen, onOpen: onProcureSuccessCTAModalOpen, onClose: onProcureSuccessCTAModalClose } = useDisclosure();
  const [procureSuccessForCollectionAndNonce, setProcureSuccessForCollectionAndNonce] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const _marketFreezedNonces = await mintContract.getSftsFrozenForAddress(marketContract.contract.getContractAddress());
      setMarketFreezedNonces(_marketFreezedNonces);
    })();
  }, []);

  useEffect(() => {
    if (hasPendingTransactions) return;
    if (showGroupedDataNfts) {
      groupDataNfts();
    }
  }, [showGroupedDataNfts, hasWebWalletTx, hasPendingTransactions]);

  useEffect(() => {
    (async () => {
      if (hasPendingTransactions) return;

      if (isApiUp) {
        const publicCount = await getOffersCountFromBackendApi(chainID);
        const listedCount = await getOffersCountFromBackendApi(chainID, address);
        setMyListedCount(listedCount);
        setPublicMarketCount(publicCount);
      }

      // start loading offers
      updateLoadingOffers(true);

      let _numberOfOffers = 0;
      if (tabState === 1) {
        // global offers
        _numberOfOffers = (await marketContract.viewNumberOfOffers()) ?? 0;
      } else {
        // offers of User
        _numberOfOffers = await marketContract.viewUserTotalOffers(address);
      }

      const _pageCount = Math.max(1, Math.ceil(_numberOfOffers / pageSize));
      updatePageCount(_pageCount);

      // if pageIndex is out of range
      if (pageIndex >= _pageCount) {
        onGotoPage(0);
      }
    })();
  }, [hasWebWalletTx, hasPendingTransactions, tabState]);

  useEffect(() => {
    (async () => {
      if (hasPendingTransactions) return;

      // start loading offers
      updateLoadingOffers(true);

      let _offers: Offer[] = [];
      const start = pageIndex * pageSize;
      if (isApiUp && isMarketplaceApiUp) {
        _offers = await getOffersFromBackendApi(chainID, start, pageSize, tabState === 1 ? undefined : address);
      } else {
        _offers = await marketContract.viewPagedOffers(start, start + pageSize - 1, tabState === 1 ? undefined : new Address(address));
      }
      const settingExtendOffer = await getBondsForOffers(_offers);

      updateOffers(settingExtendOffer);

      setNftMetadatasLoading(true);
      const nftIds = _offers.map((offer) => createNftId(offer.offeredTokenIdentifier, offer.offeredTokenNonce));
      const _nfts = await getNftsByIds(nftIds, chainID);
      const _metadatas: DataNft[] = [];

      for (let i = 0; i < _nfts.length; i++) {
        _metadatas.push(mintContract.decodeNftAttributes(_nfts[i]));
      }
      setNftMetadatas(_metadatas);
      setNftMetadatasLoading(false);

      // end loading offers
      await sleep(0.5);
      updateLoadingOffers(false);
    })();
  }, [pageIndex, tabState, hasPendingTransactions, hasWebWalletTx]);

  useEffect(() => {
    if (!pendingTransactions) return;

    const networkProvider = getNetworkProvider(chainID);
    const watcher = new TransactionWatcher(networkProvider);
    for (const [, value] of Object.entries(pendingTransactions)) {
      const stxs = (value as SignedTransactionsBodyType).transactions;
      if (stxs && stxs.length > 0) {
        (async () => {
          const stx = stxs[0];
          const transactionOnNetwork = await watcher.awaitCompleted({ getHash: () => ({ hex: () => stx.hash }) });
          if (transactionOnNetwork.status.isFailed()) {
            for (const event of transactionOnNetwork.logs.events) {
              if (event.identifier == "internalVMErrors") {
                const input = event.data.toString();
                let matches = null;
                try {
                  matches = input.match(/\[([^\][]*)]/g);
                  if (matches) {
                    matches = matches.map((match) => match.slice(1, -1));
                  }
                } catch (e) {
                  console.error(e);
                }
                if (matches) {
                  const title =
                    matches[1] == "acceptOffer"
                      ? "Purchase transaction failed"
                      : matches[1] == "cancelOffer"
                        ? "De-List transaction failed"
                        : matches[1] == "changeOfferPrice"
                          ? "Update price transaction failed"
                          : "Transaction failed";
                  const description = matches[matches.length - 1];

                  toast({
                    title,
                    description,
                    status: "error",
                    duration: 9000,
                    isClosable: true,
                  });

                  return;
                }
              }
            }
          }
        })();
      }
    }
  }, [pendingTransactions]);

  useEffect(() => {
    if (searchParams.has("tokenId") && searchParams.has("offerId")) {
      const tokenId = searchParams.get("tokenId");
      const offerId = searchParams.get("offerId");
      searchParams.delete("tokenId");
      searchParams.delete("offerId");
      setSearchParams(searchParams);
      sleep(0.5).then(() => {
        navigate(`/datanfts/marketplace/${tokenId}/offer-${offerId}`);
      });
    }
  }, []);

  const setPageIndex = (newPageIndex: number) => {
    navigate(`/datanfts/marketplace/${tabState === 1 ? "market" : "my"}${newPageIndex > 0 ? "/" + newPageIndex : ""}`);
  };

  const onGotoPage = useThrottle((newPageIndex: number) => {
    if (0 <= newPageIndex && newPageIndex < pageCount) {
      setPageIndex(newPageIndex);
    }
  });

  const groupDataNfts = () => {
    (async () => {
      if (!chainID) return;

      // start loading offers
      updateLoadingOffers(true);

      const _groupedCollections: DataNFTCollectionObject[] = await getOfersAsCollectionFromBackendApi(chainID);
      setGroupedCollections(_groupedCollections);

      updateLoadingOffers(false);
    })();
  };

  async function openNftDetailsModal(index: number) {
    if (collectionForDrawer) {
      setOfferForDrawer(collectionForDrawer.dataNfts[index].minOffer);
    } else if (showGroupedDataNfts && tabState === 1) {
      if (groupedCollections[index].type === "NonFungibleESDT") {
        setCollectionForDrawer(groupedCollections[index]);
        onOpenDataNftCollectionModal();
        return;
      } else {
        setOfferForDrawer(groupedCollections[index].dataNfts[0].minOffer);
      }
    } else {
      setOfferForDrawer(extendedOffers[index]);
    }
    onOpenDataNftDetails();
  }

  async function closeDetailsView(meta?: any) {
    onCloseDataNftDetails();
    let didAlterParams = false;

    if (searchParams.has("tokenId")) {
      searchParams.delete("tokenId");
      didAlterParams = true;
    }

    if (searchParams.has("offerId")) {
      searchParams.delete("offerId");
      didAlterParams = true;
    }

    if (didAlterParams) {
      setSearchParams(searchParams);
    }

    setOfferForDrawer(undefined);

    if (meta?.purchaseWasSuccess) {
      setProcureSuccessForCollectionAndNonce(null); // we don't have this meta yet passes via the redirect so reset in case old meta from last purchase was stored

      await sleep(2);
      onProcureSuccessCTAModalOpen();
    }
  }

  function closeCollectionView() {
    onCloseDataNftCollectionModal();
    let didAlterParams = false;
    if (searchParams.has("tokenId")) {
      searchParams.delete("tokenId");
      didAlterParams = true;
    }
    if (searchParams.has("offerId")) {
      searchParams.delete("offerId");
      didAlterParams = true;
    }
    if (didAlterParams) {
      setSearchParams(searchParams);
    }
    setCollectionForDrawer(undefined);
  }

  const handleSetPurchaseWasSuccess = (meta?: any) => {
    (async () => {
      if (meta?.collection && meta?.nonce) {
        setProcureSuccessForCollectionAndNonce({
          collection: meta?.collection,
          nonce: meta?.nonce,
        });
      } else {
        setProcureSuccessForCollectionAndNonce(null); // reset just in case repeat purchases happen
      }

      await sleep(5);
      onProcureSuccessCTAModalOpen();
    })();
  };

  return (
    <>
      <Stack>
        <Heading size="xl" fontFamily="Clash-Medium" mt={10} mx={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }}>
          Data NFT Marketplace
        </Heading>
        <Heading size="1rem" opacity=".7" fontFamily="Satoshi-Medium" fontWeight="light" px={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }}>
          Explore and discover new Data NFTs direct from Data Creators and peer-to-peer data traders.
        </Heading>

        <FeaturedDataNFTListings />

        <Box position="relative">
          <Tabs pt={10} index={tabState - 1}>
            <TabList
              alignItems={{ base: "center", md: "start" }}
              justifyContent={{ base: "center", lg: "space-between" }}
              overflowX={{ base: "scroll", md: "scroll", lg: "unset" }}
              flexDirection={{ base: "column", md: "row" }}>
              <Flex flexDirection={{ base: "column", md: "row" }}>
                <Tab
                  _selected={{ borderBottom: "5px solid", borderBottomColor: "teal.200" }}
                  flexDirection="row"
                  _disabled={{ opacity: 1 }}
                  p={{ base: "0", md: "initial" }}
                  fontSize={{ base: "sm", md: "md" }}
                  onClick={() => {
                    if (hasPendingTransactions) return;
                    navigate("/datanfts/marketplace/market");
                  }}>
                  <Flex ml={{ base: "0", md: "4.7rem" }} alignItems="center" py={3}>
                    <Icon as={FaStore} mx={2} size="0.95rem" textColor={colorMode === "dark" ? "white" : "black"} />
                    <ConditionalRender
                      fallback={
                        <>
                          <Text fontSize="lg" fontWeight="medium" w="max-content" color={colorMode === "dark" ? "white" : "black"}>
                            Public Marketplace
                          </Text>
                        </>
                      }
                      checkFunction={isApiUp}>
                      <Text fontSize="lg" fontWeight="medium" w="max-content" color={colorMode === "dark" ? "white" : "black"}>
                        Public Marketplace
                      </Text>
                      <Text fontSize="sm" px={1} color={colorMode == "dark" ? "whiteAlpha.800" : "blackAlpha.800"}>
                        {publicMarketCount > 0 && publicMarketCount}
                      </Text>
                    </ConditionalRender>
                  </Flex>
                </Tab>
                <Tab
                  _selected={{ borderBottom: "5px solid", borderBottomColor: "teal.200" }}
                  _disabled={{ opacity: 1 }}
                  p={{ base: "0", md: "initial" }}
                  fontSize={{ base: "sm", md: "md" }}
                  onClick={() => {
                    if (hasPendingTransactions) return;

                    navigate("/datanfts/marketplace/my");
                  }}>
                  {isMxLoggedIn && (
                    <Flex ml={{ base: "0", md: "4.7rem" }} alignItems="center" py={3}>
                      <Icon as={FaBrush} size="0.95rem" mx={2} textColor={colorMode === "dark" ? "white" : "black"} />
                      <ConditionalRender
                        fallback={
                          <>
                            <Text fontSize="lg" fontWeight="medium" color={colorMode === "dark" ? "white" : "black"} w="max-content">
                              My Listed Data NFT(s)
                            </Text>
                          </>
                        }
                        checkFunction={isApiUp}>
                        <Text fontSize="lg" fontWeight="medium" color={colorMode === "dark" ? "white" : "black"} w="max-content">
                          My Listed Data NFT(s)
                        </Text>
                        <Text fontSize="sm" px={1} color={colorMode == "dark" ? "whiteAlpha.800" : "blackAlpha.800"}>
                          {myListedCount > 0 && myListedCount}
                        </Text>
                      </ConditionalRender>
                    </Flex>
                  )}
                </Tab>
              </Flex>

              <Flex
                pr={{ lg: "10" }}
                gap={{ base: "5", lg: "20" }}
                flexDirection={{ base: "column", md: "row" }}
                alignItems={"center"}
                justifyContent={"center"}>
                <Flex height={{ base: "20px", md: "100%" }}>
                  {!window.location.href.includes("my") && (
                    <Checkbox isChecked={!showGroupedDataNfts} onChange={() => setShowGroupedDataNfts(!showGroupedDataNfts)} colorScheme={"teal"}>
                      <Tooltip colorScheme="teal" hasArrow label="Toggle this button to view all data NFTs ">
                        <HStack spacing="10px" width={"100%"}>
                          <Text align="center"> Show all offers </Text>
                          <Stack>
                            <MdOutlineInfo color={"teal"} />
                          </Stack>
                        </HStack>
                      </Tooltip>
                    </Checkbox>
                  )}
                </Flex>
                {
                  <CustomPagination
                    pageCount={showGroupedDataNfts && tabState === 1 ? 1 : pageCount}
                    pageIndex={showGroupedDataNfts && tabState === 1 ? 0 : pageIndex}
                    gotoPage={onGotoPage}
                    disabled={hasPendingTransactions}
                  />
                }
              </Flex>
            </TabList>

            <TabPanels>
              <TabPanel mt={2} width={"full"}>
                {loadingOffers || nftMetadatasLoading ? (
                  <Flex direction={"column"} justifyContent={"center"} alignItems={"center"} minHeight={"500px"}>
                    <Spinner size="xl" color="teal.200" margin="auto !important" label="Loading Data NFT Offers..." />
                  </Flex>
                ) : (
                  <>
                    {extendedOffers.length === 0 ? (
                      <NoDataHere />
                    ) : (
                      <SimpleGrid
                        columns={showGroupedDataNfts ? { sm: 1, lg: 2 } : { sm: 1, md: 2, lg: 3, xl: 4 }}
                        spacingY={4}
                        gap={8}
                        mx={{ base: 0, "2xl": "12 !important" }}
                        mt="5 !important"
                        justifyItems={"center"}>
                        {!showGroupedDataNfts
                          ? extendedOffers.map((offer, index) => (
                              <UpperCardComponent
                                key={index}
                                nftImageLoading={oneNFTImgLoaded && !loadingOffers}
                                imageUrl={`https://${getApi(chainID)}/nfts/${offer?.offeredTokenIdentifier}-${hexZero(offer?.offeredTokenNonce)}/thumbnail`}
                                setNftImageLoaded={setOneNFTImgLoaded}
                                nftMetadata={nftMetadatas[index]}
                                offer={offer}
                                index={index}
                                marketFreezedNonces={marketFreezedNonces}
                                openNftDetailsDrawer={openNftDetailsModal}>
                                <MarketplaceLowerCard
                                  index={index}
                                  nftMetadata={nftMetadatas[index]}
                                  extendedOffer={offer}
                                  notifyPurchaseWasSuccess={handleSetPurchaseWasSuccess}
                                />
                              </UpperCardComponent>
                            ))
                          : groupedCollections.map((collectionObject: DataNFTCollectionObject, index) => {
                              const { dataNfts } = collectionObject;
                              const offer: DataNftCollectionType = dataNfts[0];
                              return (
                                <DataNftCollectionCard
                                  key={index}
                                  index={index}
                                  nftImageLoading={oneNFTImgLoaded && !loadingOffers}
                                  imageUrl={offer.nftImgUrl}
                                  title={offer.title}
                                  description={offer.description}
                                  floorPrice={convertWeiToEsdt(
                                    offer.minOffer.wantedTokenAmount as BigNumber.Value,
                                    tokenDecimals(offer.minOffer.wantedTokenIdentifier)
                                  ).toNumber()}
                                  listed={offer.minOffer?.quantity}
                                  openNftDetailsDrawer={openNftDetailsModal}
                                  supply={offer?.supply}
                                  dataPreview={offer?.dataPreview}
                                />
                              );
                            })}
                      </SimpleGrid>
                    )}
                  </>
                )}
              </TabPanel>
              <TabPanel mt={2} width={"full"}>
                {loadingOffers || nftMetadatasLoading ? (
                  <Flex direction={"column"} justifyContent={"center"} alignItems={"center"} minHeight={"500px"}>
                    <Spinner size="xl" color="teal.200" margin="auto !important" label="Loading Data NFT Offers..." />
                  </Flex>
                ) : (
                  <>
                    {extendedOffers.length === 0 ? (
                      <NoDataHere />
                    ) : (
                      <SimpleGrid
                        columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
                        spacingY={4}
                        mx={{ base: 0, "2xl": "24 !important" }}
                        mt="5 !important"
                        justifyItems={"center"}>
                        {extendedOffers.length > 0 &&
                          extendedOffers.map((offer, index) => (
                            <UpperCardComponent
                              key={index}
                              nftImageLoading={oneNFTImgLoaded && !loadingOffers}
                              imageUrl={`https://${getApi(chainID)}/nfts/${offer?.offeredTokenIdentifier}-${hexZero(offer?.offeredTokenNonce)}/thumbnail`}
                              setNftImageLoaded={setOneNFTImgLoaded}
                              nftMetadata={nftMetadatas[index]}
                              offer={offer}
                              index={index}
                              marketFreezedNonces={marketFreezedNonces}
                              openNftDetailsDrawer={openNftDetailsModal}>
                              <MyListedDataLowerCard offer={offer} nftMetadata={nftMetadatas[index]} />
                            </UpperCardComponent>
                          ))}
                      </SimpleGrid>
                    )}
                  </>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
          {
            /* show bottom pagination only if offers exist */
            extendedOffers.length > 0 && !showGroupedDataNfts && (
              <Flex justifyContent={{ base: "center", md: "center" }} py="5">
                <CustomPagination
                  pageCount={showGroupedDataNfts && tabState === 1 ? 1 : pageCount}
                  pageIndex={showGroupedDataNfts && tabState === 1 ? 0 : pageIndex}
                  gotoPage={onGotoPage}
                  disabled={hasPendingTransactions}
                />
              </Flex>
            )
          }

          <Box
            position="absolute"
            top="0"
            bottom="0"
            left="0"
            right="0"
            height="100%"
            width="100%"
            backgroundColor="blackAlpha.700"
            backdropFilter="auto"
            backdropBlur="4px"
            rounded="lg"
            visibility={isMarketPaused ? "visible" : "collapse"}
            verticalAlign="middle"
            borderTop="solid .1rem"
            borderColor="teal.200"
            backgroundImage={
              colorMode === "dark" ? "linear-gradient(to bottom, rgba(255,0,0,0), rgb(15 15 15))" : "linear-gradient(to bottom, rgba(255,0,0,0), #F5F5F5)"
            }>
            <Box top="20vh" position="relative" textAlign="center" fontSize="24px" fontWeight="500" lineHeight="38px" textColor="teal.200">
              - Marketplace is PAUSED -
              <Text fontSize="16px" fontWeight="400" textColor="white" lineHeight="25px" px={3}>
                Data NFT Marketplace is currently paused. Please check back later.
              </Text>
            </Box>
          </Box>
        </Box>
      </Stack>

      <>
        <ProcureDataNFTSuccessCTAModel
          isOpen={isProcureSuccessCTAModalOpen}
          onClose={() => {
            onProcureSuccessCTAModalClose();
          }}
          nftData={
            procureSuccessForCollectionAndNonce
              ? { collection: procureSuccessForCollectionAndNonce.collection, nonce: procureSuccessForCollectionAndNonce.nonce }
              : undefined
          }
        />
      </>

      {offerForDrawer && (
        <>
          <Modal onClose={onCloseDataNftDetails} isOpen={isOpenDataNftDetails} size="6xl" closeOnEsc={false} closeOnOverlayClick={false}>
            <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(15px)" />
            <ModalContent overflowY="scroll" h="90%">
              <ModalHeader paddingBottom={0} bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
                <HStack spacing="5">
                  <CloseButton size="lg" onClick={closeDetailsView} />
                </HStack>
                <Text fontFamily="Clash-Medium" fontSize="32px" mt={3}>
                  Data NFT Details
                </Text>
              </ModalHeader>
              <ModalBody bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
                <DataNFTDetails
                  tokenIdProp={createNftId(offerForDrawer.offeredTokenIdentifier, offerForDrawer.offeredTokenNonce)}
                  offerIdProp={offerForDrawer.index}
                  closeDetailsView={closeDetailsView}
                />
              </ModalBody>
            </ModalContent>
          </Modal>
        </>
      )}

      {collectionForDrawer && (
        <>
          <Modal onClose={onCloseDataNftCollectionModal} isOpen={isOpenDataNftCollectionModal} size="6xl" closeOnOverlayClick={false}>
            <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(15px)" />
            <ModalContent overflowY="scroll" h="90%">
              <ModalHeader paddingBottom={0} bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
                <HStack spacing="5">
                  <CloseButton size="lg" onClick={closeCollectionView} />
                </HStack>
                <Text fontFamily="Clash-Medium" fontSize="32px">
                  Collection - {collectionForDrawer.collection}
                </Text>
                <Text fontSize="md">Type : {collectionForDrawer.type}</Text>{" "}
              </ModalHeader>
              <ModalBody bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
                <Wrap justify={{ base: "center", md: "start" }} align="start" spacing={4} w="100%" h="100%" p={4}>
                  {collectionForDrawer.dataNfts.map((dataNft, index) => {
                    const offer: Offer = dataNft.minOffer;
                    return (
                      <WrapItem key={index}>
                        <Card
                          key={index}
                          maxW="sm"
                          variant="outline"
                          backgroundColor="none"
                          border=".01rem solid transparent"
                          borderColor="#00C79740"
                          borderRadius="0.75rem">
                          <CardBody pb={4}>
                            <Box cursor={"pointer"} onClick={() => openNftDetailsModal(index)}>
                              <NftMediaComponent nftMedia={dataNft?.media} autoSlide imageHeight="230px" imageWidth="225px" borderRadius="md" />

                              <Stack mt={"4"}>
                                <Heading size="md" noOfLines={1} fontFamily="Clash-Medium">
                                  {dataNft.title}
                                </Heading>
                                <Text fontSize="md">Token Identifier : {dataNft?.tokenIdentifier}</Text>

                                <Text fontSize="md">Supply Available : {Number(offer?.quantity)}</Text>
                                <Text fontSize="sm">
                                  Unlock for {offer?.wantedTokenAmount === 0 ? "Free" : `${Number(convertWeiToEsdt(offer?.wantedTokenAmount))} ITHEUM/NFT`}
                                </Text>
                              </Stack>
                            </Box>
                          </CardBody>
                        </Card>
                      </WrapItem>
                    );
                  })}
                </Wrap>
              </ModalBody>
            </ModalContent>
          </Modal>
        </>
      )}
    </>
  );
};

export default Marketplace;
