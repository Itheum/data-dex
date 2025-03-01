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
import { Offer } from "@itheum/sdk-mx-data-nft/out";
import { DataNft } from "@itheum/sdk-mx-data-nft/out";
import { Address } from "@multiversx/sdk-core/out";
import { useGetAccountInfo, useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import axios from "axios";
import { FaBrush } from "react-icons/fa";
import { MdOutlineShoppingBag } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { CustomPagination } from "components/CustomPagination";
import ProfileCard from "components/ProfileCard";
import { NoDataHere } from "components/Sections/NoDataHere";
import useThrottle from "components/UtilComps/UseThrottle";
import { labels } from "libs/language";
import { contractsForChain, getOffersCountFromBackendApi } from "libs/MultiversX";
import { getNftsByIds, getNftsOfACollectionForAnAddress } from "libs/MultiversX/api";
import { DataNftMarketContract } from "libs/MultiversX/dataNftMarket";
import { DataNftMintContract } from "libs/MultiversX/dataNftMint";
import { backendApi, createNftId, sleep } from "libs/utils";
import DataNFTDetails from "pages/DataNFT/DataNFTDetails";
import { useMarketStore } from "store";

interface PropsType {
  tabState: number;
}

export const DataCreatorTabs: React.FC<PropsType> = ({ tabState }) => {
  const {
    network: { chainId: chainID },
  } = useGetNetworkConfig();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { address } = useGetAccountInfo();
  const isApiUp = useMarketStore((state) => state.isApiUp);
  const { pageNumber, profileAddress } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const offers = useMarketStore((state) => state.offers);
  const updateOffers = useMarketStore((state) => state.updateOffers);
  const [isLoadingFirst, setIsLoadingFirst] = useState<boolean>(false);
  const pageCount = useMarketStore((state) => state.pageCount);
  const updatePageCount = useMarketStore((state) => state.updatePageCount);
  const pageSize = 8;
  const pageIndex = pageNumber ? Number(pageNumber) : 0;
  const mintContract = new DataNftMintContract(chainID);
  const marketContract = new DataNftMarketContract(chainID);
  const [nftMetadatas, setNftMetadatas] = useState<DataNft[]>([]);
  const [isLoadingSecond, setIsLoadingSecond] = useState<boolean>(false);
  const [offerForDrawer, setOfferForDrawer] = useState<Offer | undefined>();
  const [dataNftForDrawer, setDataNftForDrawer] = useState<DataNft | undefined>();
  const [myListedCount, setMyListedCount] = useState<number>(0);
  const [oneCreatedNFTImgLoaded, setOneCreatedNFTImgLoaded] = useState(false);
  const [oneListedNFTImgLoaded, setOneListedNFTImgLoaded] = useState(false);
  const [dataNfts, setDataNft] = useState<Array<DataNft>>([]);
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
  ];

  useEffect(() => {
    if (!profileAddress || hasPendingTransactions) return;
    if (tabState !== 1) return;

    (async () => {
      try {
        // start loading offers
        setIsLoadingFirst(true);
        const _dataNfts = await getOnChainNFTs();
        setDataNft(_dataNfts);

        const backendApiRoute = backendApi(chainID);
        const res = await axios.get(`${backendApiRoute}/data-nfts/${profileAddress}`);
        const _dataNftsBE: Array<DataNft> = res.data ? res.data.map((data: any, index: number) => ({ ...data, index })) : [];
        setDataNft(_dataNftsBE);
      } catch (err: any) {
        setDataNft([]);
        setOneCreatedNFTImgLoaded(false);
        toast({
          title: labels.ERR_API_ISSUE_DATA_NFT_OFFERS,
          description: err.message,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      } finally {
        setIsLoadingFirst(false);
      }
    })();
  }, [profileAddress, hasPendingTransactions, tabState]);

  useEffect(() => {
    (async () => {
      if (!profileAddress || hasPendingTransactions) return;
      if (tabState !== 2) return;

      // start loading offers
      setIsLoadingSecond(true);

      const _numberOfOffers = await marketContract.viewUserTotalOffers(profileAddress);

      const _pageCount = Math.max(1, Math.ceil(_numberOfOffers / pageSize));
      updatePageCount(_pageCount);

      if (isApiUp) {
        const listedCount = await getOffersCountFromBackendApi(chainID, profileAddress);
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
      if (tabState !== 2) return;

      // start loading offers
      setIsLoadingSecond(true);

      const _offers = await marketContract.viewPagedOffers(pageIndex * pageSize, (pageIndex + 1) * pageSize - 1, new Address(profileAddress));
      updateOffers(_offers);

      //
      const nftIds = _offers.map((offer) => createNftId(offer.offeredTokenIdentifier, offer.offeredTokenNonce));
      const _nfts = await getNftsByIds(nftIds, chainID);
      const _metadatas: DataNft[] = [];
      for (let i = 0; i < _nfts.length; i++) {
        _metadatas.push(mintContract.decodeNftAttributes(_nfts[i]));
      }
      setNftMetadatas(_metadatas);

      // end loading offers
      await sleep(0.5);
      setIsLoadingSecond(false);
    })();
  }, [profileAddress, pageIndex, pageSize, tabState, hasPendingTransactions]);

  const getOnChainNFTs = async () => {
    const dataNftsT: DataNft[] = await getNftsOfACollectionForAnAddress(
      address,
      contractsForChain(chainID).dataNftTokens.map((v) => v.id),
      chainID
    );
    return dataNftsT;
  };

  const setPageIndex = (newPageIndex: number) => {
    navigate(`/datanfts/marketplace/${tabState === 1 ? "market" : "my"}${newPageIndex > 0 ? "/" + newPageIndex : ""}`);
  };

  const onGotoPage = useThrottle((newPageIndex: number) => {
    if (0 <= newPageIndex && newPageIndex < pageCount) {
      setPageIndex(newPageIndex);
    }
  });

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

  function closeDetailsView(meta?: any) {
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
                  <Text fontSize="sm" px={2} color={colorMode == "dark" ? "whiteAlpha.800" : "blackAlpha.800"}>
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
              (!isLoadingFirst && dataNfts.length === 0 ? (
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
                        supply={Number(item.supply)}
                        royalties={item.royalties}
                        creationTime={item.creationTime}
                        openNftDetailsDrawer={openNftDetailsModal}
                        hasLoaded={oneCreatedNFTImgLoaded && !isLoadingFirst}
                        setHasLoaded={setOneCreatedNFTImgLoaded}
                      />
                    ))}
                </SimpleGrid>
              ))}
          </TabPanel>
          <TabPanel>
            {tabState == 2 &&
              (!isLoadingSecond && nftMetadatas.length === 0 ? (
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
                        collection={item.collection}
                        nonce={item.nonce}
                        tokenName={item.tokenName}
                        title={item.title}
                        description={item.description}
                        supply={Number(item.supply)}
                        royalties={item.royalties}
                        creationTime={item.creationTime}
                        openNftDetailsDrawer={openNftDetailsModal}
                        hasLoaded={oneListedNFTImgLoaded && !isLoadingSecond}
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

      {tabState == 2 && offers.length > 0 && !isLoadingSecond && (
        <Flex justifyContent={{ base: "center", md: "center" }} py="5">
          <CustomPagination pageCount={pageCount} pageIndex={pageIndex} gotoPage={onGotoPage} disabled={hasPendingTransactions} />
        </Flex>
      )}

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
                tokenIdProp={createNftId(offerForDrawer.offeredTokenIdentifier, offerForDrawer.offeredTokenNonce)}
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
