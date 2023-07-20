import React, { useEffect, useState } from "react";
import { FaBrush } from "react-icons/fa";
import { MdFavoriteBorder, MdOutlineShoppingBag } from "react-icons/md";
import { BsClockHistory } from "react-icons/bs";
import { Flex, SimpleGrid, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useColorMode, useDisclosure } from "@chakra-ui/react";
import { Icon } from "@chakra-ui/icons";
import { NoDataHere } from "../../../components/Sections/NoDataHere";
import UpperCardComponent from "../../../components/UtilComps/UpperCardComponent";
import { getApi, getNftsByIds } from "../../../libs/MultiversX/api";
import { createNftId, hexZero, sleep } from "../../../libs/utils";
import MyListedDataLowerCard from "../../../components/MyListedDataLowerCard";
import { useMarketStore } from "../../../store";
import { useChainMeta } from "../../../store/ChainMetaContext";
import { DataNftMetadataType } from "../../../libs/MultiversX/types";
import { DataNftMintContract } from "../../../libs/MultiversX/dataNftMint";
import { DataNftMarketContract } from "../../../libs/MultiversX/dataNftMarket";
import { useGetAccountInfo, useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { useNavigate, useParams } from "react-router-dom";
import useThrottle from "../../../components/UtilComps/UseThrottle";

interface PropsType {
  tabState: number;
}

export const DataCreatorTabs: React.FC<PropsType> = ({ tabState }) => {
  const { chainMeta: _chainMeta } = useChainMeta() as any;
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();
  const networkId = !isMxLoggedIn && window.location.hostname === "datadex.itheum.io" ? "E1" : _chainMeta.networkId;
  const { hasPendingTransactions, pendingTransactions } = useGetPendingTransactions();
  const { address } = useGetAccountInfo();
  const { pageNumber } = useParams();
  const navigate = useNavigate();

  const offers = useMarketStore((state) => state.offers);
  const loadingOffers = useMarketStore((state) => state.loadingOffers);
  const updateLoadingOffers = useMarketStore((state) => state.updateLoadingOffers);
  const updateOffers = useMarketStore((state) => state.updateOffers);
  // pagination
  const pageCount = useMarketStore((state) => state.pageCount);
  const updatePageCount = useMarketStore((state) => state.updatePageCount);
  const pageSize = 8;
  const pageIndex = pageNumber ? Number(pageNumber) : 0;

  const mintContract = new DataNftMintContract(networkId);
  const marketContract = new DataNftMarketContract(networkId);

  const [nftMetadatas, setNftMetadatas] = useState<DataNftMetadataType[]>([]);
  const [marketFreezedNonces, setMarketFreezedNonces] = useState<number[]>([]);

  const [nftMetadatasLoading, setNftMetadatasLoading] = useState<boolean>(false);
  const [oneNFTImgLoaded, setOneNFTImgLoaded] = useState(false);

  const { isOpen: isOpenDataNftDetails, onOpen: onOpenDataNftDetails, onClose: onCloseDataNftDetails } = useDisclosure();
  const { colorMode } = useColorMode();

  console.log(offers);
  const profileTabs = [
    {
      tabName: "Created Data NFT(s)",
      icon: FaBrush,
      isDisabled: false,
      pieces: 12,
    },
    {
      tabName: "Listed Data NFT(s)",
      icon: MdOutlineShoppingBag,
      isDisabled: false,
      pieces: 1,
    },
    {
      tabName: "Owned Data NFT(s)",
      icon: MdFavoriteBorder,
      isDisabled: true,
    },
    {
      tabName: "Other NFT(s)/Reputation",
      icon: BsClockHistory,
      isDisabled: false,
    },
  ];

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
      if (!_chainMeta.networkId) return;

      const _marketFreezedNonces = await mintContract.getSftsFrozenForAddress(marketContract.dataNftMarketContractAddress);
      setMarketFreezedNonces(_marketFreezedNonces);
    })();
  }, [_chainMeta.networkId]);

  useEffect(() => {
    (async () => {
      if (hasPendingTransactions) return;
      if (!_chainMeta.networkId) return;

      // start loading offers
      updateLoadingOffers(true);

      let _numberOfOffers = 0;
      if (tabState === 1) {
        // global offers
        _numberOfOffers = await marketContract.viewNumberOfOffers();
      } else {
        // offers of User
        _numberOfOffers = await marketContract.viewUserTotalOffers(address);
      }

      // console.log("_numberOfOffers", _numberOfOffers);
      const _pageCount = Math.max(1, Math.ceil(_numberOfOffers / pageSize));
      updatePageCount(_pageCount);

      // if pageIndex is out of range
      if (pageIndex >= _pageCount) {
        onGotoPage(0);
      }
    })();
  }, [hasPendingTransactions, tabState, _chainMeta.networkId]);

  useEffect(() => {
    (async () => {
      if (hasPendingTransactions) return;
      if (!_chainMeta.networkId) return;

      // start loading offers
      updateLoadingOffers(true);
      const _offers = await marketContract.viewPagedOffers(pageIndex * pageSize, (pageIndex + 1) * pageSize - 1, tabState === 1 ? "" : address);
      // console.log("_offers", _offers);
      updateOffers(_offers);

      //
      setNftMetadatasLoading(true);
      const nftIds = _offers.map((offer) => createNftId(offer.offered_token_identifier, offer.offered_token_nonce));
      const _nfts = await getNftsByIds(nftIds, _chainMeta.networkId);
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
    onOpenDataNftDetails();
  }

  function closeDetailsView() {
    onCloseDataNftDetails();
  }

  return (
    <>
      <Tabs pt={10}>
        <TabList overflowX={{ base: "scroll", md: "scroll", xl: "unset", "2xl": "unset" }} maxW="100%" overflowY="hidden">
          {profileTabs.map((tab, index) => {
            return (
              <Tab key={index} isDisabled={tab.isDisabled} _selected={{ borderBottom: "5px solid", borderBottomColor: "teal.200" }}>
                <Flex ml="4.7rem" alignItems="center" py={3} overflow="hidden">
                  <Icon as={tab.icon} mx={2} size="0.95rem" textColor={colorMode === "dark" ? "white" : "black"} />
                  <Text fontSize="lg" fontWeight="medium" color={colorMode === "dark" ? "white" : "black"} w="max-content">
                    {tab.tabName}
                  </Text>
                  <Text fontSize="sm" px={2} color="whiteAlpha.800">
                    {tab.pieces}
                  </Text>
                </Flex>
              </Tab>
            );
          })}
        </TabList>
        <TabPanels>
          <TabPanel mt={2} width={"full"}>
            Hello im here
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
                      nftImageLoading={oneNFTImgLoaded && !loadingOffers}
                      imageUrl={`https://${getApi(_chainMeta.networkId)}/nfts/${offer?.offered_token_identifier}-${hexZero(
                        offer?.offered_token_nonce
                      )}/thumbnail`}
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
          </TabPanel>
          <TabPanel>Nothing here yet...</TabPanel>
          <TabPanel>Nothing here yet...</TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};
