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
import { TransactionWatcher } from "@multiversx/sdk-core/out";
import { useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { SignedTransactionsBodyType } from "@multiversx/sdk-dapp/types";
import { FaStore, FaBrush } from "react-icons/fa";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import DataNFTDetails from "DataNFT/DataNFTDetails";
import { convertWeiToEsdt, sleep } from "libs/util";
import { createNftId } from "libs/util2";
import { getAccountTokenFromApi, getApi, getItheumPriceFromApi, getNetworkProvider, getNftsByIds } from "MultiversX/api";
import { DataNftMintContract } from "MultiversX/dataNftMint";
import { DataNftMetadataType, ItemType, MarketplaceRequirementsType, OfferType, OfferTypeEVM } from "MultiversX/types";
import { useChainMeta } from "store/ChainMetaContext";
import { CustomPagination } from "./CustomPagination";
import MarketplaceLowerCard from "./MarketplaceLowerCard";
import MyListedDataLowerCard from "./MyListedDataLowerCard";
import { DataNftMarketContract } from "../MultiversX/dataNftMarket";
import { hexZero, tokenDecimals } from "../MultiversX/tokenUtils.js";
import UpperCardComponentEVM from "../UtilComps/UpperCardComponentEVM";
import useThrottle from "../UtilComps/UseThrottle";

import { ethers } from "ethers";
import { ABIS } from "../EVM/ABIs";

interface PropsType {
  tabState: number; // 1 for "Public Marketplace", 2 for "My Data NFTs"
}

export const Marketplace: FC<PropsType> = ({ tabState }) => {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();
  const { pageNumber } = useParams();
  const pageIndex = pageNumber ? Number(pageNumber) : 0;

  const { chainMeta: _chainMeta } = useChainMeta() as any;
  const itheumToken = _chainMeta?.contracts?.itheumToken || null;
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions, pendingTransactions } = useGetPendingTransactions();

  const mintContract = new DataNftMintContract(_chainMeta.networkId);
  const marketContract = new DataNftMarketContract(_chainMeta.networkId);

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
    },
  ]);

  const [wantedTokenBalance, setWantedTokenBalance] = useState<string>("0");
  const { isOpen: isDrawerOpenTradeStream, onOpen: onOpenDrawerTradeStream, onClose: onCloseDrawerTradeStream, getDisclosureProps } = useDisclosure();

  // pagination
  const [pageCount, setPageCount] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);
  const marketplace = "/datanfts/marketplace/market";
  const location = useLocation();
  console.log(location.pathname);

  const setPageIndex = (newPageIndex: number) => {
    navigate(`/datanfts/marketplace/${tabState === 1 ? "market" : "my"}${newPageIndex > 0 ? "/" + newPageIndex : ""}`);
  };

  const onGotoPage = useThrottle((newPageIndex: number) => {
    if (0 <= newPageIndex && newPageIndex < pageCount) {
      setPageIndex(newPageIndex);
    }
  });

  useEffect(() => {
    // getOnChainNFTsEVM(_chainMeta.loggedInAddress);
    console.log("loggedInAddress");
    console.log(_chainMeta);
  }, [_chainMeta.loggedInAddress]);

  // useEffect(() => {
  //   console.log("_chainMeta.networkId", _chainMeta.networkId);
  //   (async () => {
  //     if (!_chainMeta.networkId) return;

  //     const _marketRequirements = await marketContract.viewRequirements();
  //     console.log("_marketRequirements", _marketRequirements);
  //     setMarketRequirements(_marketRequirements);

  //     if (_marketRequirements) {
  //       const _maxPaymentFeeMap: Record<string, number> = {};
  //       for (let i = 0; i < _marketRequirements.accepted_payments.length; i++) {
  //         _maxPaymentFeeMap[_marketRequirements.accepted_payments[i]] = convertWeiToEsdt(
  //           _marketRequirements.maximum_payment_fees[i],
  //           tokenDecimals(_marketRequirements.accepted_payments[i])
  //         ).toNumber();
  //       }
  //       setMaxPaymentFeeMap(_maxPaymentFeeMap);
  //     } else {
  //       setMaxPaymentFeeMap({});
  //     }
  //   })();
  // }, [_chainMeta.networkId]);

  // useEffect(() => {
  //   (async () => {
  //     if (!_chainMeta.networkId) return;

  //     const _marketFreezedNonces = await mintContract.getSftsFrozenForAddress(marketContract.dataNftMarketContractAddress);
  //     console.log("_marketFreezedNonces", _marketFreezedNonces);
  //     setMarketFreezedNonces(_marketFreezedNonces);
  //   })();
  // }, [_chainMeta.networkId]);

  // const getItheumPrice = () => {
  //   (async () => {
  //     const _itheumPrice = await getItheumPriceFromApi();
  //     setItheumPrice(_itheumPrice);
  //   })();
  // };

  // useEffect(() => {
  //   getItheumPrice();
  //   const interval = setInterval(() => {
  //     getItheumPrice();
  //   }, 60_000);
  //   return () => clearInterval(interval);
  // }, []);

  // useEffect(() => {
  //   (async () => {
  //     if (hasPendingTransactions) return;
  //     if (!_chainMeta.networkId) return;

  //     // start loading offers
  //     setLoadingOffers(true);

  //     let _numberOfOffers = 0;
  //     if (tabState === 1) {
  //       // global offers
  //       _numberOfOffers = await marketContract.viewNumberOfOffers();
  //     } else {
  //       // offers of User
  //       _numberOfOffers = await marketContract.viewUserTotalOffers(address);
  //     }
  //     console.log("_numberOfOffers", _numberOfOffers);
  //     const _pageCount = Math.max(1, Math.ceil(_numberOfOffers / pageSize));
  //     setPageCount(_pageCount);

  //     // if pageIndex is out of range
  //     if (pageIndex >= _pageCount) {
  //       onGotoPage(0);
  //     }
  //   })();
  // }, [hasPendingTransactions, tabState, _chainMeta.networkId]);

  // const getItheumTokenDetails = async (tokenId) => {
  //   // debugger; //eslint-disable-line
  //   if (_chainMeta?.isEVMAuthenticated) {
  //     const contract = new ethers.Contract(_chainMeta.contracts.dnft, ABIS.dNFT, _chainMeta.ethersProvider);
  //     const tokenDetails = await contract.dataNFTs(tokenId);
  //     console.log(tokenDetails);
  //   }
  // };

  useEffect(() => {
    (async () => {
      // getItheumTokenDetails(tokenId);

      // if (hasPendingTransactions) return;
      if (!_chainMeta.networkId) return;

      // init - no selection
      setSelectedOfferIndex(-1);

      // start loading offers
      setLoadingOffers(true);
      // const _offers = await marketContract.viewPagedOffers(pageIndex * pageSize, (pageIndex + 1) * pageSize - 1, tabState === 1 ? "" : address);

      const allDataNFTs = `https://shibuya.api.bluez.app/api/nft/v3/33b743f848524995fa87ea8519a0b486/getNFTsForContract?contractAddress=0xaC9e9eA0d85641Fa176583215447C81eBB5eD7b3`;

      fetch(allDataNFTs, { method: "GET" })
        .then((resp) => resp.json())
        .then(async (res) => {
          console.log("_offers", res.items);
          setOffers(res.items);

          setItems((prev) => {
            return res.items.map((offer: OfferTypeEVM, i: number) => {
              return {
                ...(prev?.[i] ?? {}),
                index: offer.tokenId,
                owner: offer.ownerAddress,
                wanted_token_identifier: null,
                wanted_token_amount: null,
                wanted_token_nonce: null,
                offered_token_identifier: null,
                offered_token_nonce: null,
                quantity: 1,
              };
            });
          });
          console.log("items", items);

          setNftMetadatasLoading(true);

          const _metadatas: DataNftMetadataType[] = [];

          for (let i = 0; i < res.items.length; i++) {
            _metadatas.push({
              index: res.items[i].tokenId,
              id: res.items[i].tokenId,
              nftImgUrl: res.items[i].image,
              dataPreview: "string",
              dataStream: "string",
              dataMarshal: "string",
              tokenName: "string",
              creator: res.items[i].ownerAddress,
              creationTime: new Date(),
              supply: 1,
              balance: 1,
              description: res.items[i].description,
              title: res.items[i].name,
              royalties: 0,
              nonce: 0,
              collection: res.items[i].contractAddress,
            });
          }

          console.log("_metadatas", _metadatas);

          setNftMetadatas(_metadatas);
          setNftMetadatasLoading(false);

          // end loading offers
          await sleep(0.5);
          setLoadingOffers(false);
        });

      // console.log("_offers", _offers);
      // setOffers(_offers);
      // setItems((prev) => {
      //   return _offers.map((offer: OfferType, i: number) => {
      //     return {
      //       ...(prev?.[i] ?? {}),
      //       index: offer.index,
      //       owner: offer.owner,
      //       wanted_token_identifier: offer.wanted_token_identifier,
      //       wanted_token_amount: offer.wanted_token_amount,
      //       wanted_token_nonce: offer.wanted_token_nonce,
      //       offered_token_identifier: offer.offered_token_identifier,
      //       offered_token_nonce: offer.offered_token_nonce,
      //       quantity: offer.quantity,
      //     };
      //   });
      // });
      // console.log("items", items);

      // //
      // setNftMetadatasLoading(true);
      // const nftIds = _offers.map((offer) => createNftId(offer.offered_token_identifier, offer.offered_token_nonce));
      // const _nfts = await getNftsByIds(nftIds, _chainMeta.networkId);
      // const _metadatas: DataNftMetadataType[] = [];
      // for (let i = 0; i < _nfts.length; i++) {
      //   _metadatas.push(mintContract.decodeNftAttributes(_nfts[i], i));
      // }
      // setNftMetadatas(_metadatas);
      // setNftMetadatasLoading(false);
    })();
  }, [pageIndex, pageSize, tabState, hasPendingTransactions, _chainMeta.networkId]);

  // useEffect(() => {
  //   (async () => {
  //     if (!(address && selectedOfferIndex >= 0 && selectedOfferIndex < offers.length)) return;
  //     if (hasPendingTransactions) return;
  //     if (!_chainMeta.networkId) return;

  //     // wanted_token must be ESDT (not NFT, SFT or Meta-ESDT)
  //     const _token = await getAccountTokenFromApi(address, offers[selectedOfferIndex].wanted_token_identifier, _chainMeta.networkId);
  //     if (_token) {
  //       setWantedTokenBalance(_token.balance ? _token.balance : "0");
  //     } else {
  //       setWantedTokenBalance("0");
  //     }
  //   })();
  // }, [address, offers, selectedOfferIndex, hasPendingTransactions, _chainMeta.networkId]);

  // const getUserData = async () => {
  //   if (address) {
  //     const _userData = await mintContract.getUserDataOut(address, itheumToken);
  //     setUserData(_userData);
  //   }
  // };

  // useEffect(() => {
  //   if (hasPendingTransactions) return;
  //   if (!_chainMeta.networkId) return;

  //   getUserData();
  // }, [address, hasPendingTransactions, _chainMeta.networkId]);

  function openNftDetailsDrawer(index: number) {
    setOfferForDrawer(offers[index]);
    onOpenDrawerTradeStream();
  }

  function closeDetailsView() {
    onCloseDrawerTradeStream();
    setOfferForDrawer(undefined);
  }

  //
  const toast = useToast();
  // useEffect(() => {
  //   if (!pendingTransactions) return;

  //   const networkProvider = getNetworkProvider(_chainMeta.networkId);
  //   const watcher = new TransactionWatcher(networkProvider);
  //   for (const [key, value] of Object.entries(pendingTransactions)) {
  //     const stxs = (value as SignedTransactionsBodyType).transactions;
  //     if (stxs && stxs.length > 0) {
  //       (async () => {
  //         const stx = stxs[0];
  //         const transactionOnNetwork = await watcher.awaitCompleted({ getHash: () => ({ hex: () => stx.hash }) });
  //         console.log("transactionOnNetwork", transactionOnNetwork);
  //         if (transactionOnNetwork.status.isFailed()) {
  //           for (const event of transactionOnNetwork.logs.events) {
  //             if (event.identifier == "internalVMErrors") {
  //               const input = event.data.toString();
  //               const matches = input.match(/(?<=\[)[^\][]*(?=])/g);

  //               if (matches) {
  //                 const title =
  //                   matches[1] == "acceptOffer"
  //                     ? "Purchase transaction failed"
  //                     : matches[1] == "cancelOffer"
  //                     ? "De-List transaction failed"
  //                     : matches[1] == "changeOfferPrice"
  //                     ? "Update price transaction failed"
  //                     : "Transaction failed";
  //                 const description = matches[matches.length - 1];

  //                 toast({
  //                   title,
  //                   description,
  //                   status: "error",
  //                   duration: 9000,
  //                   isClosable: true,
  //                 });

  //                 return;
  //               }
  //             }
  //           }
  //         }
  //       })();
  //     }
  //   }
  // }, [pendingTransactions]);

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
                          imageUrl={nftMetadatas[index].nftImgUrl || ""}
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
