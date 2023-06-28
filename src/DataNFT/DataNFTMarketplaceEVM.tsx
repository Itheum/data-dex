import React, { FC, useEffect, useState } from "react";
import {
  Button,
  Flex,
  Heading,
  HStack,
  Stack,
  Text,
  CloseButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  SimpleGrid,
  TabList,
  Tabs,
  Tab,
  Box,
  Icon,
  TabPanel,
  TabPanels,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { FaStore, FaBrush } from "react-icons/fa";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import DataNFTDetails from "DataNFT/DataNFTDetails";
import { sleep } from "libs/util";
import { createNftId } from "libs/util2";
import { DataNftMetadataType, ItemType, MarketplaceRequirementsType, OfferType, OfferTypeEVM } from "MultiversX/typesEVM";
import { useChainMeta } from "store/ChainMetaContext";
import { CustomPagination } from "./CustomPagination";
import MarketplaceLowerCard from "./MarketplaceLowerCardEVM";
import MyListedDataLowerCard from "./MyListedDataLowerCard";
import UpperCardComponentEVM from "../UtilComps/UpperCardComponentEVM";
import useThrottle from "../UtilComps/UseThrottle";

import { ethers } from "ethers";
import { ABIS } from "../EVM/ABIs";

interface PropsType {
  tabState: number; // 1 for "Public Marketplace", 2 for "My Data NFTs",
  setMenuItem: any;
  onRefreshTokenBalance: any;
}

export const Marketplace: FC<PropsType> = ({ tabState, setMenuItem, onRefreshTokenBalance }) => {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();
  const { pageNumber } = useParams();
  const pageIndex = pageNumber ? Number(pageNumber) : 0;

  const { chainMeta: _chainMeta } = useChainMeta() as any;
  const itheumToken = _chainMeta?.contracts?.itheumToken || null;
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions, pendingTransactions } = useGetPendingTransactions();

  const [itheumPrice, setItheumPrice] = useState<number | undefined>();
  const [loadingOffers, setLoadingOffers] = useState<boolean>(false);
  const [selectedOfferIndex, setSelectedOfferIndex] = useState<number>(-1); // no selection
  const [nftMetadatas, setNftMetadatas] = useState<DataNftMetadataType[]>([]);
  const [nftMetadatasLoading, setNftMetadatasLoading] = useState<boolean>(false);
  const [oneNFTImgLoaded, setOneNFTImgLoaded] = useState(false);
  const [userData, setUserData] = useState<any>({});
  const [marketRequirements, setMarketRequirements] = useState<MarketplaceRequirementsType | undefined>(undefined);
  const [maxPaymentFeeMap, setMaxPaymentFeeMap] = useState<Record<string, number>>({});
  const [marketFreezedNonces, setMarketFreezedNonces] = useState<number[]>([]);

  const [offerForDrawer, setOfferForDrawer] = useState<OfferType | undefined>();

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
      transferable: -2,
      secondaryTradeable: -2,
    },
  ]);

  const [wantedTokenBalance, setWantedTokenBalance] = useState<string>("0");
  const { isOpen: isDrawerOpenTradeStream, onOpen: onOpenDrawerTradeStream, onClose: onCloseDrawerTradeStream, getDisclosureProps } = useDisclosure();

  // pagination
  const [pageCount, setPageCount] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);
  const marketplace = "/datanfts/marketplace/market";
  const location = useLocation();

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

      // init - no selection
      setSelectedOfferIndex(-1);

      // start loading offers
      setLoadingOffers(true);

      const allDataNFTs = `https://shibuya.api.bluez.app/api/nft/v3/33b743f848524995fa87ea8519a0b486/getNFTsForContract?contractAddress=0xaC9e9eA0d85641Fa176583215447C81eBB5eD7b3`;

      fetch(allDataNFTs, { method: "GET" })
        .then((resp) => resp.json())
        .then(async (res) => {
          setOffers(res.items);

          const _dataNfts: any[] = [];
          const _tokenIdAry: number[] = [];

          res.items.forEach((offer: OfferTypeEVM, i: number) => {
            _tokenIdAry.push(offer.tokenId);

            _dataNfts.push({
              index: offer.tokenId,
              owner: offer.ownerAddress,
              wanted_token_identifier: "",
              wanted_token_amount: "",
              wanted_token_nonce: offer.tokenId,
              offered_token_identifier: "",
              offered_token_nonce: offer.tokenId,
              quantity: 1,
            });
          });

          mergeSmartContractMetaData(_tokenIdAry, res.items, _dataNfts);
        });
    })();
  }, [pageIndex, pageSize, tabState, hasPendingTransactions, _chainMeta.networkId]);

  function mergeSmartContractMetaData(_tokenIdAry: any, _allItems: any, _dataNfts: any) {
    // use the list of token IDs to get all the other needed details (price, royalty etc) from the smart contract
    Promise.all(_tokenIdAry.map((i: string) => getTokenDetailsFromContract(i))).then((responses) => {
      const scMetaMap = responses.reduce((sum, i) => {
        sum[i.tokenId] = {
          royaltyInPercent: i.royaltyInPercent,
          secondaryTradeable: i.secondaryTradeable,
          transferable: i.transferable,
          priceInItheum: i.priceInItheum,
        };

        return sum;
      }, {});

      // append the sc meta data like price, royalty etc to the master list
      _dataNfts.forEach((item: any) => {
        item.wanted_token_amount = scMetaMap[item.index].priceInItheum;
      });

      setItems(_dataNfts);

      setNftMetadatasLoading(true);

      const _metadatas: DataNftMetadataType[] = [];

      for (let i = 0; i < _allItems.length; i++) {
        _metadatas.push({
          index: _allItems[i].tokenId,
          id: _allItems[i].tokenId,
          nftImgUrl: _allItems[i].image,
          dataPreview: "",
          dataStream: "",
          dataMarshal: "",
          tokenName: "",
          creator: "", // we don't know who the creator is -- this info only comes via Covalent API for now
          creationTime: new Date(), // we don't know who the creator is -- this info only comes via Covalent API for now
          supply: 1,
          balance: 1,
          description: _allItems[i].description,
          title: _allItems[i].name,
          royalties: scMetaMap[_allItems[i].tokenId].royaltyInPercent,
          nonce: 0,
          collection: _allItems[i].contractAddress,
          feeInTokens: scMetaMap[_allItems[i].tokenId].priceInItheum,
          transferable: scMetaMap[_allItems[i].tokenId].transferable,
          secondaryTradeable: scMetaMap[_allItems[i].tokenId].secondaryTradeable,
        });
      }

      setNftMetadatas(_metadatas);
      setNftMetadatasLoading(false);

      // end loading offers
      setLoadingOffers(false);
    });
  }

  async function getTokenDetailsFromContract(tokenId: string) {
    const contract = new ethers.Contract(_chainMeta.contracts.dnft, ABIS.dNFT, _chainMeta.ethersProvider);
    const tokenDetails = await contract.dataNFTs(parseInt(tokenId));

    const pickDetails = {
      tokenId,
      royaltyInPercent: tokenDetails.royaltyInPercent,
      secondaryTradeable: tokenDetails.secondaryTradeable === true ? 1 : 0, // 1 means true, 0 means false
      transferable: tokenDetails.transferable === true ? 1 : 0, // 1 means true, 0 means false
      priceInItheum: tokenDetails.priceInItheum.toString(),
    };

    return pickDetails;
  }

  function openNftDetailsDrawer(index: number) {
    setOfferForDrawer(offers[index]);
    onOpenDrawerTradeStream();
  }

  function closeDetailsView() {
    onCloseDrawerTradeStream();
    setOfferForDrawer(undefined);
  }

  const toast = useToast();

  return (
    <>
      <Stack>
        <Heading size="xl" fontWeight="medium" mt={10} mx={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }}>
          Data NFT Marketplace
        </Heading>
        <Heading size="1rem" opacity=".7" fontWeight="light" px={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }}>
          Explore and discover new Data NFTs direct from Data Creators and peer-to-peer traders
        </Heading>

        <Box position="relative">
          <Tabs pt={10}>
            <TabList justifyContent={{ base: "start", lg: "space-between" }} overflow={{ base: "scroll", md: "unset", lg: "unset" }}>
              <Flex>
                <Tab
                  _selected={{ borderBottom: "5px solid", borderBottomColor: "teal.200" }}
                  flexDirection="row"
                  _disabled={{ opacity: 1 }}
                  fontSize={{ base: "sm", md: "md" }}
                  onClick={() => {
                    if (hasPendingTransactions) return;
                    navigate("/datanfts/marketplace/market");
                  }}>
                  <Flex ml="4.7rem" alignItems="center" py={3}>
                    <Icon as={FaStore} mx={2} size="0.95rem" textColor={colorMode === "dark" ? "white" : "black"} />
                    <Text fontSize="lg" fontWeight="medium" color={colorMode === "dark" ? "white" : "black"}>
                      Public Marketplace
                    </Text>
                  </Flex>
                </Tab>
                <Tab
                  _selected={{ borderBottom: "5px solid", borderBottomColor: "teal.200" }}
                  isDisabled={true}
                  fontSize={{ base: "sm", md: "md" }}
                  onClick={() => {
                    if (hasPendingTransactions) return;
                    navigate("/datanfts/marketplace/my");
                  }}>
                  {_chainMeta.loggedInAddress && (
                    <Flex ml="4.7rem" alignItems="center" py={3}>
                      <Icon as={FaBrush} size="0.95rem" mx={2} textColor={colorMode === "dark" ? "white" : "black"} />
                      <Text fontSize="lg" fontWeight="medium" color={colorMode === "dark" ? "white" : "black"}>
                        My Listed Data NFT(s)
                      </Text>
                    </Flex>
                  )}
                </Tab>
              </Flex>
              <Flex mr="4.7rem">
                <CustomPagination pageCount={pageCount} pageIndex={pageIndex} pageSize={pageSize} gotoPage={onGotoPage} disabled={hasPendingTransactions} />
              </Flex>
            </TabList>

            <TabPanels>
              <TabPanel mt={2} width={"full"}>
                {!loadingOffers && !nftMetadatasLoading && offers.length === 0 ? (
                  <Text>No data yet...</Text>
                ) : (
                  <SimpleGrid
                    columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
                    spacingY={4}
                    mx={{ base: 0, "2xl": "24 !important" }}
                    mt="5 !important"
                    justifyItems={"center"}>
                    {offers.length > 0 &&
                      items?.map((item, index) => (
                        <UpperCardComponentEVM
                          key={index}
                          nftImageLoading={oneNFTImgLoaded && !loadingOffers}
                          imageUrl={nftMetadatas[index]?.nftImgUrl || ""}
                          setNftImageLoaded={setOneNFTImgLoaded}
                          nftMetadatas={nftMetadatas}
                          marketRequirements={marketRequirements}
                          item={item}
                          userData={userData}
                          index={index}
                          marketFreezedNonces={marketFreezedNonces}
                          openNftDetailsDrawer={openNftDetailsDrawer}
                          itheumPrice={itheumPrice}>
                          {location.pathname.includes(marketplace) && nftMetadatas.length > 0 && !loadingOffers && !nftMetadatasLoading ? (
                            <MarketplaceLowerCard
                              nftMetadatas={nftMetadatas}
                              index={index}
                              item={item}
                              offers={offers}
                              itheumPrice={itheumPrice}
                              marketRequirements={marketRequirements}
                              setMenuItem={setMenuItem}
                              onRefreshTokenBalance={onRefreshTokenBalance}
                            />
                          ) : (
                            <MyListedDataLowerCard
                              index={index}
                              offers={items}
                              nftMetadatas={nftMetadatas}
                              itheumPrice={itheumPrice}
                              marketRequirements={marketRequirements}
                              maxPaymentFeeMap={maxPaymentFeeMap}
                            />
                          )}
                        </UpperCardComponentEVM>
                      ))}
                  </SimpleGrid>
                )}
              </TabPanel>
              <TabPanel mt={2} width={"full"}>
                <Text>Noting here yet...</Text>
              </TabPanel>
            </TabPanels>
          </Tabs>

          {
            /* show bottom pagination only if offers exist */
            offers.length > 0 && (
              <Flex justifyContent={{ base: "center", md: "center" }} py="5">
                <CustomPagination pageCount={pageCount} pageIndex={pageIndex} pageSize={pageSize} gotoPage={onGotoPage} disabled={hasPendingTransactions} />
              </Flex>
            )
          }
        </Box>
      </Stack>

      {offerForDrawer && (
        <>
          <Drawer onClose={closeDetailsView} isOpen={isDrawerOpenTradeStream} size="xl" closeOnEsc={false} closeOnOverlayClick={true}>
            <DrawerOverlay />
            <DrawerContent>
              <DrawerHeader>
                <HStack spacing="5">
                  <CloseButton size="lg" onClick={closeDetailsView} />
                  <Heading as="h4" size="lg">
                    Data NFT Details
                  </Heading>
                </HStack>
              </DrawerHeader>
              <DrawerBody>
                <DataNFTDetails
                  tokenIdProp={createNftId(offerForDrawer.offered_token_identifier, offerForDrawer.offered_token_nonce)}
                  offerIdProp={offerForDrawer.index}
                  closeDetailsView={closeDetailsView}
                />
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </>
      )}
    </>
  );
};

export default Marketplace;
