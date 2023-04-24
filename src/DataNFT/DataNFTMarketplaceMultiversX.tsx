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
  useColorMode,
  Box,
} from "@chakra-ui/react";
import { useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import DataNFTDetails from "DataNFT/DataNFTDetails";
import { convertWeiToEsdt, sleep } from "libs/util";
import { createNftId } from "libs/util2";
import { getAccountTokenFromApi, getApi, getItheumPriceFromApi, getNftsByIds } from "MultiversX/api";
import { DataNftMintContract } from "MultiversX/dataNftMint";
import { DataNftMetadataType, ItemType, MarketplaceRequirementsType, OfferType } from "MultiversX/types";
import { useChainMeta } from "store/ChainMetaContext";
import { CustomPagination } from "./CustomPagination";
import MarketplaceLowerCard from "./MarketplaceLowerCard";
import MyListedDataLowerCard from "./MyListedDataLowerCard";
import { DataNftMarketContract } from "../MultiversX/dataNftMarket";
import { hexZero, tokenDecimals } from "../MultiversX/tokenUtils.js";
import UpperCardComponent from "../UtilComps/UpperCardComponent";
import { FaStore, FaBrush } from "react-icons/fa";
import useThrottle from "../UtilComps/UseThrottle";

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
  const { hasPendingTransactions } = useGetPendingTransactions();

  const mintContract = new DataNftMintContract(_chainMeta.networkId);
  const marketContract = new DataNftMarketContract(_chainMeta.networkId);

  const [itheumPrice, setItheumPrice] = useState<number | undefined>();
  const [loadingOffers, setLoadingOffers] = useState<boolean>(false);
  const [amountOfTokens, setAmountOfTokens] = useState<any>({});
  const [amountErrors, setAmountErrors] = useState<string[]>([]);
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
    (async () => {
      if (!_chainMeta.networkId) return;

      const _marketRequirements = await marketContract.viewRequirements();
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
  }, [_chainMeta.networkId]);

  useEffect(() => {
    (async () => {
      if (!_chainMeta.networkId) return;

      const _marketFreezedNonces = await mintContract.getSftsFrozenForAddress(marketContract.dataNftMarketContractAddress);
      console.log("_marketFreezedNonces", _marketFreezedNonces);
      setMarketFreezedNonces(_marketFreezedNonces);
    })();
  }, [_chainMeta.networkId]);

  const getItheumPrice = () => {
    (async () => {
      const _itheumPrice = await getItheumPriceFromApi();
      setItheumPrice(_itheumPrice);
    })();
  };

  useEffect(() => {
    getItheumPrice();
    const interval = setInterval(() => {
      getItheumPrice();
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      if (hasPendingTransactions) return;
      if (!_chainMeta.networkId) return;

      // start loading offers
      setLoadingOffers(true);

      let _numberOfOffers = 0;
      if (tabState === 1) {
        // global offers
        _numberOfOffers = await marketContract.viewNumberOfOffers();
      } else {
        // offers of User
        _numberOfOffers = await marketContract.viewUserTotalOffers(address);
      }
      console.log("_numberOfOffers", _numberOfOffers);
      const _pageCount = Math.max(1, Math.ceil(_numberOfOffers / pageSize));
      setPageCount(_pageCount);

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

      // init - no selection
      setSelectedOfferIndex(-1);

      // start loading offers
      setLoadingOffers(true);
      const _offers = await marketContract.viewPagedOffers(pageIndex * pageSize, (pageIndex + 1) * pageSize - 1, tabState === 1 ? "" : address);
      console.log("_offers", _offers);
      setOffers(_offers);
      setItems((prev) => {
        return _offers.map((offer: OfferType, i: number) => {
          return {
            ...(prev?.[i] ?? {}),
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
      setLoadingOffers(false);
    })();
  }, [pageIndex, pageSize, tabState, hasPendingTransactions, _chainMeta.networkId]);

  useEffect(() => {
    (async () => {
      if (!(address && selectedOfferIndex >= 0 && selectedOfferIndex < offers.length)) return;
      if (hasPendingTransactions) return;
      if (!_chainMeta.networkId) return;

      // wanted_token must be ESDT (not NFT, SFT or Meta-ESDT)
      const _token = await getAccountTokenFromApi(address, offers[selectedOfferIndex].wanted_token_identifier, _chainMeta.networkId);
      if (_token) {
        setWantedTokenBalance(_token.balance ? _token.balance : "0");
      } else {
        setWantedTokenBalance("0");
      }
    })();
  }, [address, offers, selectedOfferIndex, hasPendingTransactions, _chainMeta.networkId]);

  const getUserData = async () => {
    if (address) {
      const _userData = await mintContract.getUserDataOut(address, itheumToken);
      setUserData(_userData);
    }
  };

  useEffect(() => {
    if (hasPendingTransactions) return;
    if (!_chainMeta.networkId) return;

    getUserData();
  }, [address, hasPendingTransactions, _chainMeta.networkId]);

  function openNftDetailsDrawer(index: number) {
    setOfferForDrawer(offers[index]);
    onOpenDrawerTradeStream();
  }

  function closeDetailsView() {
    onCloseDrawerTradeStream();
    setOfferForDrawer(undefined);
  }

  return (
    <>
      <Stack spacing={5}>
        <Heading size="xl" fontWeight="medium" my={10} mx={24}>
          Data NFT Marketplace
        </Heading>

        <Flex mt="5" justifyContent={{ base: "space-around", md: "space-between" }} flexDirection={{ base: "column", md: "row" }} w="full" flexWrap={"wrap"}>
          <Tabs w="full" alignItems="center">
            <TabList justifyContent="space-evenly">
              <Tab _selected={{ borderBottom: "5px solid", borderBottomColor: "teal.200" }}>
                <Button
                  colorScheme="teal"
                  flexDirection="row"
                  isDisabled={tabState === 1}
                  variant="unstyled"
                  _disabled={{ opacity: 1 }}
                  opacity={0.4}
                  fontSize={{ base: "sm", md: "md" }}
                  onClick={() => {
                    if (hasPendingTransactions) return;
                    setPageIndex(0);
                    navigate("/datanfts/marketplace/market");
                  }}>
                  <Flex mx="5" alignItems="center" gap={1.5}>
                    <FaStore size="0.95rem" />
                    <Text fontSize="lg" fontWeight="medium" color={colorMode === "dark" ? "white" : "black"}>
                      Public Marketplace
                    </Text>
                  </Flex>
                </Button>
              </Tab>
              <Tab _selected={{ borderBottom: "5px solid", borderBottomColor: "teal.200" }}>
                {isMxLoggedIn && (
                  <Button
                    colorScheme="teal"
                    isDisabled={tabState === 2}
                    variant="unstyled"
                    _disabled={{ opacity: 1 }}
                    opacity={0.4}
                    fontSize={{ base: "sm", md: "md" }}
                    onClick={() => {
                      if (hasPendingTransactions) return;
                      setPageIndex(0);
                      navigate("/datanfts/marketplace/my");
                    }}>
                    <Flex mx="5" alignItems="center" gap={1.5}>
                      <FaBrush size="0.95rem" />
                      <Text fontSize="lg" fontWeight="medium" color={colorMode === "dark" ? "white" : "black"}>
                        My Listed Data NFT(s)
                      </Text>
                      <Text fontSize="sm" px={1} color="whiteAlpha.800">
                        {offers && offers?.length}
                      </Text>
                    </Flex>
                  </Button>
                )}
              </Tab>
              <Flex py={3}>
                <CustomPagination pageCount={pageCount} pageIndex={pageIndex} pageSize={pageSize} gotoPage={onGotoPage} disabled={hasPendingTransactions} />
              </Flex>
            </TabList>
          </Tabs>
        </Flex>

        {!loadingOffers && !nftMetadatasLoading && offers.length === 0 ? (
          <Text>No data yet...</Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 4 }} spacingY={4} mx={{ base: 0, "2xl": "24 !important" }} mt="5 !important">
            {offers.length > 0 &&
              items?.map((item, index) => (
                <UpperCardComponent
                  key={index}
                  nftImageLoading={oneNFTImgLoaded && !loadingOffers}
                  imageUrl={`https://${getApi(_chainMeta.networkId)}/nfts/${item?.offered_token_identifier}-${hexZero(item?.offered_token_nonce)}/thumbnail`}
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
                </UpperCardComponent>
              ))}
          </SimpleGrid>
        )}

        {
          /* show bottom pagination only if offers exist */
          offers.length > 0 && (
            <Flex justifyContent={{ base: "center", md: "center" }} py="5">
              <CustomPagination pageCount={pageCount} pageIndex={pageIndex} pageSize={pageSize} gotoPage={onGotoPage} disabled={hasPendingTransactions} />
            </Flex>
          )
        }
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
