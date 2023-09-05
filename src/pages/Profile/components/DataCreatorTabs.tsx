import util from "util";
import React, { useEffect, useState } from "react";
import { Icon } from "@chakra-ui/icons";
import {
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
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorMode,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetAccountInfo, useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import axios from "axios";
import { BsClockHistory } from "react-icons/bs";
import { FaBrush } from "react-icons/fa";
import { MdFavoriteBorder, MdOutlineShoppingBag } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { contractsForChain } from "libs/config";
import { CustomPagination } from "components/CustomPagination";
import ProfileCard from "components/ProfileCard";
// import { contractsForChain } from "libs/config";
import { NoDataHere } from "../../../components/Sections/NoDataHere";
import useThrottle from "../../../components/UtilComps/UseThrottle";
import { labels } from "../../../libs/language";
import { getNftsByIds } from "../../../libs/MultiversX/api";
import { DataNftMarketContract } from "../../../libs/MultiversX/dataNftMarket";
import { DataNftMintContract } from "../../../libs/MultiversX/dataNftMint";
import { createDataNftType, DataNftMetadataType, DataNftType, OfferType } from "../../../libs/MultiversX/types";
import { backendApi, createNftId, routeChainIDBasedOnLoggedInStatus, sleep } from "../../../libs/utils";
import { useMarketStore } from "../../../store";
import DataNFTDetails from "../../DataNFT/DataNFTDetails";
import { getOffersCountFromBackendApi } from "../../../libs/MultiversX";

interface PropsType {
  tabState: number;
}

export const DataCreatorTabs: React.FC<PropsType> = ({ tabState }) => {
  const { chainID } = useGetNetworkConfig();
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();
  const routedChainID = routeChainIDBasedOnLoggedInStatus(isMxLoggedIn, chainID);
  const { hasPendingTransactions } = useGetPendingTransactions();
  // const itheumToken = contractsForChain(routedChainID).itheumToken;
  const { address } = useGetAccountInfo();
  const isApiUp = useMarketStore((state) => state.isApiUp);

  const { pageNumber, profileAddress } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const offers = useMarketStore((state) => state.offers);
  const loadingOffers = useMarketStore((state) => state.loadingOffers);
  const updateLoadingOffers = useMarketStore((state) => state.updateLoadingOffers);
  const updateOffers = useMarketStore((state) => state.updateOffers);
  // pagination
  const pageCount = useMarketStore((state) => state.pageCount);
  const updatePageCount = useMarketStore((state) => state.updatePageCount);
  const pageSize = 8;
  const pageIndex = pageNumber ? Number(pageNumber) : 0;

  const mintContract = new DataNftMintContract(routedChainID);
  const marketContract = new DataNftMarketContract(routedChainID);

  const [nftMetadatas, setNftMetadatas] = useState<DataNftMetadataType[]>([]);
  // const [marketFreezedNonces, setMarketFreezedNonces] = useState<number[]>([]);
  // const maxPaymentFeeMap = useMarketStore((state) => state.maxPaymentFeeMap);
  // const marketRequirements = useMarketStore((state) => state.marketRequirements);

  const [offerForDrawer, setOfferForDrawer] = useState<OfferType | undefined>();
  const [dataNftForDrawer, setDataNftForDrawer] = useState<DataNftType | undefined>();
  const [myListedCount, setMyListedCount] = useState<number>(0);

  const [oneCreatedNFTImgLoaded, setOneCreatedNFTImgLoaded] = useState(false);
  const [oneListedNFTImgLoaded, setOneListedNFTImgLoaded] = useState(false);

  const [dataNfts, setDataNft] = useState<DataNftType[]>(() => {
    const _dataNfts: DataNftType[] = [];
    for (let index = 0; index < 8; index++) {
      _dataNfts.push(createDataNftType());
    }
    return _dataNfts;
  });

  const { isOpen: isOpenDataNftDetails, onOpen: onOpenDataNftDetails, onClose: onCloseDataNftDetails } = useDisclosure();
  const { isOpen: isOpenListingDetails, onOpen: onOpenListingDetails, onClose: onCloseListingDetails } = useDisclosure();
  const { colorMode } = useColorMode();

  const profileTabs = [
    {
      tabNumber: 1,
      tabName: "Created Data NFT(s)",
      tabPath: "/profile/%s/created",
      icon: FaBrush,
      isDisabled: false,
      pieces: dataNfts?.length === 0 ? "" : dataNfts?.length,
    },
    {
      tabNumber: 2,
      tabName: "Listed Data NFT(s)",
      tabPath: "/profile/%s/listed",
      icon: MdOutlineShoppingBag,
      isDisabled: false,
      pieces: myListedCount === 0 ? "" : myListedCount,
    },
    {
      tabNumber: 3,
      tabName: "Owned Data NFT(s)",
      tabPath: "/profile/%s/owned",
      icon: MdFavoriteBorder,
      isDisabled: true,
    },
    {
      tabNumber: 4,
      tabName: "Other NFT(s)/Reputation",
      tabPath: "/profile/%s/other",
      icon: BsClockHistory,
      isDisabled: true,
    },
  ];

  const getDataNfts = async (addressArg: string) => {
    const backendApiRoute = backendApi(routedChainID);
    try {
      const res = await axios.get(`${backendApiRoute}/data-nfts/${addressArg}`);
      const _dataNfts: DataNftType[] = res.data.map((data: any, index: number) => ({ ...data, index }));
      setDataNft(_dataNfts);
    } catch (err: any) {
      setOneCreatedNFTImgLoaded(false);
      toast({
        title: labels.ERR_API_ISSUE_DATA_NFT_OFFERS,
        description: err.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    if (!profileAddress) return;
    getDataNfts(profileAddress);
  }, [profileAddress, hasPendingTransactions]);

  const setPageIndex = (newPageIndex: number) => {
    navigate(`/datanfts/marketplace/${tabState === 1 ? "market" : "my"}${newPageIndex > 0 ? "/" + newPageIndex : ""}`);
  };

  const onGotoPage = useThrottle((newPageIndex: number) => {
    if (0 <= newPageIndex && newPageIndex < pageCount) {
      setPageIndex(newPageIndex);
    }
  });

  // useEffect(() => {
  //   (async () => {
  //     const _marketFreezedNonces = await mintContract.getSftsFrozenForAddress(marketContract.dataNftMarketContractAddress);
  //     setMarketFreezedNonces(_marketFreezedNonces);
  //   })();
  // }, []);

  useEffect(() => {
    (async () => {
      if (!profileAddress || hasPendingTransactions) return;

      // start loading offers
      updateLoadingOffers(true);

      let _numberOfOffers = 0;
      if (tabState === 1) {
        // global offers
        _numberOfOffers = dataNfts ? dataNfts.length : 0;
      } else {
        // offers of User
        _numberOfOffers = await marketContract.viewUserTotalOffers(profileAddress);
      }

      const _pageCount = Math.max(1, Math.ceil(_numberOfOffers / pageSize));
      updatePageCount(_pageCount);

      if (isApiUp) {
        const listedCount = await getOffersCountFromBackendApi(routedChainID, profileAddress);
        setMyListedCount(listedCount);
      }
      // if pageIndex is out of range
      if (pageIndex >= _pageCount) {
        onGotoPage(0);
      }
    })();
  }, [profileAddress, hasPendingTransactions, tabState]);

  useEffect(() => {
    (async () => {
      if (!profileAddress || hasPendingTransactions) return;

      // start loading offers
      updateLoadingOffers(true);

      const _offers = await marketContract.viewPagedOffers(pageIndex * pageSize, (pageIndex + 1) * pageSize - 1, tabState === 1 ? "" : profileAddress);
      updateOffers(_offers);

      //
      const nftIds = _offers.map((offer) => createNftId(offer.offered_token_identifier, offer.offered_token_nonce));
      const _nfts = await getNftsByIds(nftIds, routedChainID);
      const _metadatas: DataNftMetadataType[] = [];
      for (let i = 0; i < _nfts.length; i++) {
        _metadatas.push(mintContract.decodeNftAttributes(_nfts[i], i));
      }
      setNftMetadatas(_metadatas);

      // end loading offers
      await sleep(0.5);
      updateLoadingOffers(false);
    })();
  }, [profileAddress, pageIndex, pageSize, tabState, hasPendingTransactions]);

  function openNftDetailsModal(index: number) {
    if (tabState == 1) {
      setDataNftForDrawer(dataNfts[index]);
      onOpenDataNftDetails();
    } else if (tabState == 2) {
      setOfferForDrawer(offers[index]);
      onOpenListingDetails();
    } else {
      throw Error(`openNftDetailsModal: Invalid tabState (${tabState})`);
    }
  }

  function closeDetailsView() {
    onCloseDataNftDetails();
  }

  function closeListingDetailsView() {
    onCloseListingDetails();
    setOfferForDrawer(undefined);
  }

  return (
    <>
      <Tabs pt={10} index={tabState - 1}>
        <TabList overflowX={{ base: "scroll", md: "scroll", xl: "unset", "2xl": "unset" }} maxW="100%" overflowY="hidden">
          {profileTabs.map((tab, index) => {
            return (
              <Tab
                key={index}
                p={{ base: "0", md: "initial" }}
                fontSize={{ base: "sm", md: "md" }}
                isDisabled={tab.isDisabled}
                _selected={{ borderBottom: "5px solid", borderBottomColor: "teal.200" }}
                onClick={() => {
                  if (hasPendingTransactions) return;
                  setOneCreatedNFTImgLoaded(false);
                  setOneListedNFTImgLoaded(false);
                  navigate(util.format(tab.tabPath, profileAddress));
                }}>
                <Flex ml={{ base: "0.5rem", md: "4.7rem" }} alignItems="center" py={3} overflow="hidden">
                  <Icon as={tab.icon} mx={2} size="0.95rem" textColor={colorMode === "dark" ? "white" : "black"} />
                  <Text fontSize="lg" fontWeight="medium" color={colorMode === "dark" ? "white" : "black"} w="max-content">
                    {tab.tabName}
                  </Text>
                  <Text fontSize="sm" px={2} color="whiteAlpha.800">
                    {tab.pieces ?? ""}
                  </Text>
                </Flex>
              </Tab>
            );
          })}
        </TabList>
        <TabPanels>
          <TabPanel>
            {tabState == 1 &&
              (!loadingOffers && dataNfts.length === 0 ? (
                <NoDataHere />
              ) : (
                <SimpleGrid
                  columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
                  spacingY={4}
                  mx={{ base: 0, "2xl": "24 !important" }}
                  mt="5 !important"
                  justifyItems={"center"}>
                  {dataNfts.length > 0 &&
                    dataNfts.map((item, index) => (
                      <ProfileCard
                        key={index}
                        index={index}
                        collection={item.collection}
                        nonce={item.nonce}
                        tokenName={item.tokenName}
                        title={item.title}
                        description={item.description}
                        supply={item.supply}
                        royalties={item.royalties}
                        creationTime={item.creationTime}
                        openNftDetailsDrawer={openNftDetailsModal}
                        hasLoaded={oneCreatedNFTImgLoaded}
                        setHasLoaded={setOneCreatedNFTImgLoaded}
                      />
                    ))}
                </SimpleGrid>
              ))}
          </TabPanel>
          <TabPanel>
            {tabState == 2 &&
              (!loadingOffers && nftMetadatas.length === 0 ? (
                <NoDataHere />
              ) : (
                <SimpleGrid
                  columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
                  spacingY={4}
                  mx={{ base: 0, "2xl": "24 !important" }}
                  mt="5 !important"
                  justifyItems={"center"}>
                  {nftMetadatas.length > 0 &&
                    nftMetadatas.map((item, index) => (
                      <ProfileCard
                        key={index}
                        index={index}
                        collection={nftMetadatas[index].collection}
                        nonce={nftMetadatas[index].nonce}
                        tokenName={nftMetadatas[index].tokenName}
                        title={nftMetadatas[index].title}
                        description={nftMetadatas[index].description}
                        supply={nftMetadatas[index].supply}
                        royalties={nftMetadatas[index].royalties}
                        creationTime={nftMetadatas[index].creationTime}
                        openNftDetailsDrawer={openNftDetailsModal}
                        hasLoaded={oneListedNFTImgLoaded}
                        setHasLoaded={setOneListedNFTImgLoaded}
                      />
                    ))}
                </SimpleGrid>
              ))}
          </TabPanel>
          <TabPanel>Nothing here yet...</TabPanel>
          <TabPanel>Nothing here yet...</TabPanel>
        </TabPanels>
      </Tabs>

      <Flex justifyContent={{ base: "center", md: "center" }} py="5">
        <CustomPagination pageCount={pageCount} pageIndex={pageIndex} gotoPage={onGotoPage} disabled={hasPendingTransactions} />
      </Flex>

      {offerForDrawer && (
        <Modal onClose={onCloseListingDetails} isOpen={isOpenListingDetails} size="6xl" closeOnEsc={false} closeOnOverlayClick={true}>
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(15px)" />
          <ModalContent overflowY="scroll" h="90%">
            <ModalHeader bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
              <HStack spacing="5">
                <CloseButton size="lg" onClick={closeListingDetailsView} />
                <Heading as="h4" size="lg">
                  Data NFT Details
                </Heading>
              </HStack>
            </ModalHeader>
            <ModalBody bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
              <DataNFTDetails
                tokenIdProp={createNftId(offerForDrawer.offered_token_identifier, offerForDrawer.offered_token_nonce)}
                offerIdProp={offerForDrawer.index}
                closeDetailsView={closeListingDetailsView}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
      {dataNftForDrawer && (
        <Modal onClose={onCloseDataNftDetails} isOpen={isOpenDataNftDetails} size="6xl" closeOnEsc={false} closeOnOverlayClick={true}>
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(15px)" />
          <ModalContent overflowY="scroll" h="90%">
            <ModalHeader bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
              <HStack spacing="5">
                <CloseButton size="lg" onClick={closeDetailsView} />
                <Heading as="h4" size="lg">
                  Data NFT Details
                </Heading>
              </HStack>
            </ModalHeader>
            <ModalBody bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
              <DataNFTDetails tokenIdProp={dataNftForDrawer.tokenIdentifier} closeDetailsView={closeDetailsView} />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};
