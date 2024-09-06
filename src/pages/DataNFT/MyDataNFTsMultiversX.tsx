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
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { DataNft } from "@itheum/sdk-mx-data-nft/out";
import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { useWallet } from "@solana/wallet-adapter-react";
import { BsClockHistory } from "react-icons/bs";
import { FaBrush, FaCoins } from "react-icons/fa";
import { MdFavoriteBorder, MdLockOutline, MdOutlineShoppingBag } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { NoDataHere } from "components/Sections/NoDataHere";
import InteractionTxTable from "components/Tables/InteractionTxTable";
import useThrottle from "components/UtilComps/UseThrottle";
import WalletDataNFTMX from "components/WalletDataNFTMX/WalletDataNFTMX";
import { contractsForChain } from "libs/config";
import { getNftsOfACollectionForAnAddress } from "libs/MultiversX/api";
import { getApiDataDex } from "libs/utils";
import { useAccountStore, useMarketStore } from "store";

import { BondingCards } from "./components/BondingCards";
import { CompensationCards } from "./components/CompensationCards";
import { FavoriteCards } from "./components/FavoriteCards";
import { LivelinessStaking } from "./components/LivelinessStaking";
import DataNFTDetails from "./DataNFTDetails";
import WalletDataNftSol from "components/SolanaNfts/WalletDataNftSol";
// import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";

export default function MyDataNFTsMx({ tabState }: { tabState: number }) {
  const { colorMode } = useColorMode();
  const { chainID } = useGetNetworkConfig();
  const itheumToken = contractsForChain(chainID).itheumToken;
  const { address } = useGetAccountInfo();
  const navigate = useNavigate();
  const marketRequirements = useMarketStore((state) => state.marketRequirements);
  const maxPaymentFeeMap = useMarketStore((state) => state.maxPaymentFeeMap);
  const [dataNfts, setDataNfts] = useState<Array<DataNft>>([]);
  const purchasedDataNfts: DataNft[] = dataNfts.filter((item) => item.creator != address);
  const [oneNFTImgLoaded, setOneNFTImgLoaded] = useState(false);
  const { hasPendingTransactions } = useGetPendingTransactions();
  const [nftForDrawer, setNftForDrawer] = useState<DataNft | undefined>();
  const { isOpen: isOpenDataNftDetails, onOpen: onOpenDataNftDetails, onClose: onCloseDataNftDetails } = useDisclosure();
  // const { mvxNfts, isLoadingMvx, solNfts, isLoadingSol } = useNftsStore();

  /// Solana NFTs
  const SHOW_NFTS_STEP = 10;
  const [numberOfSolNftsShown, setNumberOfSolNftsShown] = useState<number>(SHOW_NFTS_STEP);
  const [shownSolDataNfts, setShownSolDataNfts] = useState<DasApiAsset[]>([]);

  const { publicKey } = useWallet();
  const solAddress = publicKey?.toBase58();

  const solPreaccessNonce = useAccountStore((state: any) => state.solPreaccessNonce);
  const solPreaccessSignature = useAccountStore((state: any) => state.solPreaccessSignature);
  const solPreaccessTimestamp = useAccountStore((state: any) => state.solPreaccessTimestamp);
  const updateSolPreaccessNonce = useAccountStore((state: any) => state.updateSolPreaccessNonce);
  const updateSolPreaccessTimestamp = useAccountStore((state: any) => state.updateSolPreaccessTimestamp);
  const updateSolSignedPreaccess = useAccountStore((state: any) => state.updateSolSignedPreaccess);
  const [fetchingSolNfts, setFetchingSolNfts] = useState<boolean>(false);

  useEffect(() => {
    async function fetchSolNfts() {
      setFetchingSolNfts(true);

      if (!solAddress) {
        setShownSolDataNfts([]);
      } else {
        const resp = await fetch(`${getApiDataDex(chainID)}/bespoke/sol/getDataNFTsByOwner?publicKeyb58=${solAddress}`);
        const data = await resp.json();

        setShownSolDataNfts(data.nfts);
      }

      setFetchingSolNfts(false);
    }
    fetchSolNfts();
  }, [publicKey]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    if (hasPendingTransactions) return;
    (async () => {
      const _dataNfts = await getOnChainNFTs();
      const _alteredDataNfts = _dataNfts.map((nft) => new DataNft({ ...nft, balance: nft.balance ? nft.balance : 1 }));
      setDataNfts(_alteredDataNfts);
    })();

    setOneNFTImgLoaded(false);
  }, [hasPendingTransactions]);

  const onChangeTab = useThrottle((newTabState: number) => {
    navigate(
      `/datanfts/wallet${newTabState === 2 ? "/purchased" : newTabState === 4 ? "/activity" : newTabState === 3 ? "/favorite" : newTabState === 5 ? "/liveliness" : newTabState === 6 ? "/compensation" : ""}`
    );
  }, /* delay: */ 500);

  const walletTabs = [
    {
      tabName: "Your Data NFT(s)",
      icon: FaBrush,
      isDisabled: false,
      pieces: dataNfts.length + shownSolDataNfts.length, ///TODO not best sollution but works, think of something else
    },
    {
      tabName: "Purchased",
      icon: MdOutlineShoppingBag,
      isDisabled: false,
      pieces: purchasedDataNfts.length,
    },
    {
      tabName: "Favorite",
      icon: MdFavoriteBorder,
      isDisabled: false,
    },
    {
      tabName: "Activity",
      icon: BsClockHistory,
      isDisabled: false,
    },
    {
      tabName: "Liveliness",
      icon: MdLockOutline,
      isDisabled: false,
    },
    {
      tabName: "Compensation",
      icon: FaCoins,
      isDisabled: false,
    },
  ];

  const getOnChainNFTs = async () => {
    const dataNftsT: DataNft[] = await getNftsOfACollectionForAnAddress(
      address,
      contractsForChain(chainID).dataNftTokens.map((v) => v.id),
      chainID
    );
    return dataNftsT;
  };

  function openNftDetailsDrawer(index: number) {
    setNftForDrawer(dataNfts[index]);
    onOpenDataNftDetails();
  }

  function closeDetailsView() {
    onCloseDataNftDetails();
    setNftForDrawer(undefined);
  }

  return (
    <>
      <Stack>
        <Heading size="xl" fontFamily="Clash-Medium" mt={10} mx={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }}>
          Data NFT Wallet
        </Heading>
        <Heading size="1rem" opacity=".7" fontFamily="Satoshi-Medium" fontWeight="light" px={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }}>
          Manage the Data NFTs you created or purchased from the peer-to-peer Data NFT Marketplace.
        </Heading>

        <Tabs pt={10} index={tabState - 1}>
          <TabList overflowX={{ base: "scroll", md: "scroll", xl: "unset", "2xl": "unset" }} maxW="100%" overflowY="hidden">
            {walletTabs.map((tab, index) => {
              return (
                <Tab
                  key={index}
                  isDisabled={tab.isDisabled}
                  p={{ base: "3", md: "0" }}
                  _selected={{ borderBottom: "5px solid", borderBottomColor: "teal.200" }}
                  onClick={() => onChangeTab(index + 1)}
                  mx={"auto"}>
                  <Flex
                    height={"100%"}
                    flexDirection={{ base: "column", md: "row" }}
                    alignItems={{ base: "center", md: "center" }}
                    justify={{ md: "center" }}
                    py={3}
                    overflow="hidden">
                    <Icon as={tab.icon} mx={2} size="0.95rem" textColor={colorMode === "dark" ? "white" : "black"} />
                    <Text fontSize="lg" fontWeight="medium" color={colorMode === "dark" ? "white" : "black"} w="max-content">
                      {tab.tabName}
                    </Text>
                    <Text fontSize="sm" px={2} color={colorMode == "dark" ? "whiteAlpha.800" : "blackAlpha.800"}>
                      {tab.pieces}
                    </Text>
                  </Flex>
                </Tab>
              );
            })}
          </TabList>
          <TabPanels>
            {/* Your Data NFTs */}
            <TabPanel mt={2} width={"full"}>
              {tabState === 1 && (dataNfts.length > 0 || shownSolDataNfts.length > 0) ? (
                <SimpleGrid
                  columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
                  spacingY={4}
                  mx={{ base: 0, "2xl": "24 !important" }}
                  mt="5 !important"
                  justifyItems={"center"}>
                  {dataNfts.length > 0
                    ? dataNfts.map((item, index) => (
                        <WalletDataNFTMX
                          key={index}
                          id={index}
                          hasLoaded={oneNFTImgLoaded}
                          setHasLoaded={setOneNFTImgLoaded}
                          maxPayment={maxPaymentFeeMap[itheumToken]}
                          sellerFee={marketRequirements ? marketRequirements.sellerTaxPercentage : 0}
                          openNftDetailsDrawer={openNftDetailsDrawer}
                          isProfile={false}
                          {...item}
                        />
                      ))
                    : shownSolDataNfts.map((item, index) => <WalletDataNftSol key={index} index={index} solDataNft={item} />)}
                </SimpleGrid>
              ) : (
                <Flex onClick={getOnChainNFTs}>
                  <NoDataHere />
                </Flex>
              )}
            </TabPanel>

            {/* Purchased */}
            <TabPanel mt={2} width={"full"}>
              {tabState === 2 && purchasedDataNfts.length >= 0 ? (
                <SimpleGrid
                  columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
                  spacingY={4}
                  mx={{ base: 0, "2xl": "24 !important" }}
                  mt="5 !important"
                  justifyItems={"center"}>
                  {purchasedDataNfts.map((item, index) => (
                    <WalletDataNFTMX
                      key={index}
                      id={index}
                      hasLoaded={oneNFTImgLoaded}
                      setHasLoaded={setOneNFTImgLoaded}
                      maxPayment={maxPaymentFeeMap[itheumToken]}
                      sellerFee={marketRequirements ? marketRequirements.sellerTaxPercentage : 0}
                      openNftDetailsDrawer={openNftDetailsDrawer}
                      isProfile={false}
                      {...item}
                    />
                  ))}
                </SimpleGrid>
              ) : (
                <Flex onClick={getOnChainNFTs}>
                  <NoDataHere />
                </Flex>
              )}
            </TabPanel>

            {/* Favorites */}
            <TabPanel mt={2} width={"full"}>
              {tabState === 3 ? (
                <FavoriteCards />
              ) : (
                <Flex onClick={getOnChainNFTs}>
                  <NoDataHere />
                </Flex>
              )}
            </TabPanel>

            {/* Activity */}
            <TabPanel>
              <InteractionTxTable address={address} />
            </TabPanel>

            {/* Liveliness */}
            <TabPanel mt={2} width={"full"}>
              {tabState === 5 ? (
                <Flex flexDirection={{ base: "column" }} alignItems="start">
                  <LivelinessStaking />
                  <BondingCards />
                </Flex>
              ) : (
                <Flex onClick={getOnChainNFTs}>
                  <NoDataHere />
                </Flex>
              )}
            </TabPanel>

            {/* Compensation */}
            <TabPanel mt={2} width={"full"}>
              {tabState === 6 ? (
                <CompensationCards />
              ) : (
                <Flex onClick={getOnChainNFTs}>
                  <NoDataHere />
                </Flex>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>

      {nftForDrawer && (
        <>
          <Modal onClose={closeDetailsView} isOpen={isOpenDataNftDetails} size="6xl" closeOnEsc={false} closeOnOverlayClick={true}>
            <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(15px)" />
            <ModalContent bgColor={colorMode === "dark" ? "#181818" : "bgWhite"} overflowY="scroll" h="90%">
              <ModalHeader paddingBottom={0} bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
                <HStack spacing="5">
                  <CloseButton size="lg" onClick={closeDetailsView} />
                </HStack>
                <Text fontSize="32px" fontFamily="Clash-Medium" mt={3} fontWeight="500" textAlign="center">
                  Data NFT Details
                </Text>
              </ModalHeader>
              <ModalBody bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
                <DataNFTDetails tokenIdProp={nftForDrawer.tokenIdentifier} closeDetailsView={closeDetailsView} />
              </ModalBody>
            </ModalContent>
          </Modal>
        </>
      )}
    </>
  );
}
