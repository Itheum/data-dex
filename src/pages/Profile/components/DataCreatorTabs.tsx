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
  Skeleton,
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
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { contractsForChain } from "libs/config";
import MyListedDataLowerCard from "../../../components/MyListedDataLowerCard";
import { NoDataHere } from "../../../components/Sections/NoDataHere";
import UpperCardComponent from "../../../components/UtilComps/UpperCardComponent";
import useThrottle from "../../../components/UtilComps/UseThrottle";
import WalletDataNFTMX from "../../../components/WalletDataNFTMX";
import { labels } from "../../../libs/language";
import { getApi, getNftsByIds } from "../../../libs/MultiversX/api";
import { DataNftMarketContract } from "../../../libs/MultiversX/dataNftMarket";
import { DataNftMintContract } from "../../../libs/MultiversX/dataNftMint";
import { createDataNftType, DataNftMetadataType, DataNftType, OfferType } from "../../../libs/MultiversX/types";
import { backendApi, createNftId, hexZero, routeChainIDBasedOnLoggedInStatus, sleep } from "../../../libs/utils";
import { useMarketStore } from "../../../store";
import DataNFTDetails from "../../DataNFT/DataNFTDetails";
import { getOffersCountFromBackendApi } from "libs/MultiversX/backend-api";

interface PropsType {
  tabState: number;
}

export const DataCreatorTabs: React.FC<PropsType> = ({ tabState }) => {
  const { chainID } = useGetNetworkConfig();
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();
  const routedChainID = routeChainIDBasedOnLoggedInStatus(isMxLoggedIn, chainID);
  const { hasPendingTransactions } = useGetPendingTransactions();
  const itheumToken = contractsForChain(routedChainID).itheumToken;
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
  const [marketFreezedNonces, setMarketFreezedNonces] = useState<number[]>([]);
  const maxPaymentFeeMap = useMarketStore((state) => state.maxPaymentFeeMap);
  const marketRequirements = useMarketStore((state) => state.marketRequirements);

  const [offerForDrawer, setOfferForDrawer] = useState<OfferType | undefined>();
  const [dataNftForDrawer, setDataNftForDrawer] = useState<DataNftType | undefined>();
  const [myListedCount, setMyListedCount] = useState<number>(0);

  const [nftMetadatasLoading, setNftMetadatasLoading] = useState<boolean>(false);
  const [oneCreatedNFTImgLoaded, setOneCreatedNFTImgLoaded] = useState(false);
  const [oneListedNFTImgLoaded, setOneListedNFTImgLoaded] = useState(false);
  const { pathname } = useLocation();
  const isCreatedPage = "/profile/created";
  const isListedPage = "/profile/listed";

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
  }, [profileAddress, dataNfts, hasPendingTransactions]);

  const setPageIndex = (newPageIndex: number) => {
    navigate(`/datanfts/marketplace/${tabState === 1 ? "market" : "my"}${newPageIndex > 0 ? "/" + newPageIndex : ""}`);
  };

  const onGotoPage = useThrottle((newPageIndex: number) => {
    if (0 <= newPageIndex && newPageIndex < pageCount) {
      setPageIndex(newPageIndex);
    }
  });

  useEffect(() => {
    (async () => {
      const _marketFreezedNonces = await mintContract.getSftsFrozenForAddress(marketContract.dataNftMarketContractAddress);
      setMarketFreezedNonces(_marketFreezedNonces);
    })();
  }, []);

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
        const listedCount = await getOffersCountFromBackendApi(routedChainID, address);
        setMyListedCount(listedCount);
      }
      // if pageIndex is out of range
      if (pageIndex >= _pageCount) {
        onGotoPage(0);
      }
    })();
  }, [hasPendingTransactions, tabState]);

  useEffect(() => {
    (async () => {
      if (!profileAddress || hasPendingTransactions) return;

      // start loading offers
      updateLoadingOffers(true);
      const _offers = await marketContract.viewPagedOffers(pageIndex * pageSize, (pageIndex + 1) * pageSize - 1, tabState === 1 ? "" : profileAddress);

      updateOffers(_offers);

      //
      setNftMetadatasLoading(true);
      const nftIds = _offers.map((offer) => createNftId(offer.offered_token_identifier, offer.offered_token_nonce));
      const _nfts = await getNftsByIds(nftIds, routedChainID);
      const _metadatas: DataNftMetadataType[] = [];
      for (let i = 0; i < _nfts.length; i++) {
        _metadatas.push(mintContract.decodeNftAttributes(_nfts[i], i));
      }
      setNftMetadatas(_metadatas);
      setNftMetadatasLoading(false);

      // end loading offers
      await sleep(0.5);
      updateLoadingOffers(false);
    })();
  }, [pageIndex, pageSize, tabState, hasPendingTransactions]);

  function openNftDetailsModal(index: number) {
    if (pathname === isListedPage) {
      setOfferForDrawer(offers[index]);
      onOpenListingDetails();
    }
    if ((pathname === isCreatedPage || pathname === "/profile") && dataNfts) {
      setDataNftForDrawer(dataNfts[index]);
      onOpenDataNftDetails();
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
                isDisabled={tab.isDisabled}
                _selected={{ borderBottom: "5px solid", borderBottomColor: "teal.200" }}
                onClick={() => {
                  if (hasPendingTransactions) return;
                  navigate(util.format(tab.tabPath, profileAddress));
                }}>
                <Flex ml="4.7rem" alignItems="center" py={3} overflow="hidden">
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
            {!loadingOffers && !nftMetadatasLoading && dataNfts.length === 0 ? (
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
                    <WalletDataNFTMX
                      key={index}
                      hasLoaded={oneCreatedNFTImgLoaded}
                      setHasLoaded={setOneCreatedNFTImgLoaded}
                      maxPayment={maxPaymentFeeMap[itheumToken]}
                      sellerFee={marketRequirements ? marketRequirements.seller_fee : 0}
                      openNftDetailsDrawer={openNftDetailsModal}
                      isProfile={true}
                      {...item}
                    />
                  ))}
              </SimpleGrid>
            )}
          </TabPanel>
          <TabPanel>
            {!loadingOffers && !nftMetadatasLoading && offers.length === 0 ? (
              <NoDataHere />
            ) : (
              <SimpleGrid
                columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
                spacingY={4}
                mx={{ base: 0, "2xl": "24 !important" }}
                mt="5 !important"
                justifyItems={"center"}>
                {offers.length > 0 &&
                  offers.map((offer, index) => (
                    <UpperCardComponent
                      key={index}
                      nftImageLoading={oneListedNFTImgLoaded && !loadingOffers}
                      imageUrl={`https://${getApi(routedChainID)}/nfts/${offer?.offered_token_identifier}-${hexZero(offer?.offered_token_nonce)}/thumbnail`}
                      setNftImageLoaded={setOneListedNFTImgLoaded}
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
          </TabPanel>
          <TabPanel>Nothing here yet...</TabPanel>
          <TabPanel>Nothing here yet...</TabPanel>
        </TabPanels>
      </Tabs>
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
