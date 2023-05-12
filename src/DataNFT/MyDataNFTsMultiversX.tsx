import React, { useEffect, useState } from "react";
import { Icon } from "@chakra-ui/icons";
import {
  CloseButton,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  HStack,
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
import { AbiRegistry, BinaryCodec } from "@multiversx/sdk-core/out";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { BsClockHistory } from "react-icons/bs";
import { FaBrush } from "react-icons/fa";
import { MdFavoriteBorder, MdOutlineLocalOffer, MdOutlineShoppingBag } from "react-icons/md";
import { convertWeiToEsdt } from "libs/util";
import { getNftsOfACollectionForAnAddress } from "MultiversX/api";
import { DataNftMarketContract } from "MultiversX/dataNftMarket";
import { DataNftMintContract } from "MultiversX/dataNftMint";
import { createDataNftType, DataNftType, RecordStringNumberType, UserDataType } from "MultiversX/types";
import { useChainMeta } from "store/ChainMetaContext";
import DataNFTDetails from "./DataNFTDetails";
import WalletDataNFTMX from "./WalletDataNFTMX";
import dataNftMintJson from "../MultiversX/ABIs/datanftmint.abi.json";
import { tokenDecimals } from "../MultiversX/tokenUtils.js";
import { NoDataHere } from "Sections/NoDataHere";

export default function MyDataNFTsMx({ onRfMount }: { onRfMount: any }) {
  const { colorMode } = useColorMode();
  const { chainMeta: _chainMeta } = useChainMeta();
  const itheumToken = _chainMeta?.contracts?.itheumToken || null;
  const { address } = useGetAccountInfo();
  const [dataNfts, setDataNfts] = useState<DataNftType[]>(() => {
    const _dataNfts: DataNftType[] = [];
    for (let index = 0; index < 5; index++) {
      _dataNfts.push(createDataNftType());
    }
    return _dataNfts;
  });
  const [oneNFTImgLoaded, setOneNFTImgLoaded] = useState(false);
  const [maxPaymentFeeMap, setMaxPaymentFeeMap] = useState<RecordStringNumberType>({});
  const mintContract = new DataNftMintContract(_chainMeta.networkId);
  const marketContract = new DataNftMarketContract(_chainMeta.networkId);
  const { hasPendingTransactions } = useGetPendingTransactions();
  const [userData, setUserData] = useState<UserDataType | undefined>(undefined);
  const [sellerFee, setSellerFee] = useState<number | undefined>();

  const [nftForDrawer, setNftForDrawer] = useState<DataNftType | undefined>();
  const { isOpen: isDrawerOpenTradeStream, onOpen: onOpenDrawerTradeStream, onClose: onCloseDrawerTradeStream, getDisclosureProps } = useDisclosure();

  const walletTabs = [
    {
      tabName: "Your Data NFT(s)",
      icon: FaBrush,
      isDisabled: false,
      pieces: dataNfts ? dataNfts.length : 0,
    },
    {
      tabName: "Purchased",
      icon: MdOutlineShoppingBag,
      isDisabled: true,
    },
    {
      tabName: "Favorite",
      icon: MdFavoriteBorder,
      isDisabled: true,
    },
    {
      tabName: "Activity",
      icon: BsClockHistory,
      isDisabled: true,
    },
    {
      tabName: "Offers",
      icon: MdOutlineLocalOffer,
      isDisabled: true,
    },
  ];

  useEffect(() => {
    // console.log('********** MyDataNFTsMultiversX LOAD _chainMeta ', _chainMeta);

    (async () => {
      if (!_chainMeta.networkId) return;

      const _marketRequirements = await marketContract.viewRequirements();
      setSellerFee(_marketRequirements?.seller_fee);
      const _maxPaymentFeeMap: RecordStringNumberType = {};

      if (_marketRequirements) {
        for (let i = 0; i < _marketRequirements.accepted_payments.length; i++) {
          _maxPaymentFeeMap[_marketRequirements.accepted_payments[i]] = convertWeiToEsdt(
            _marketRequirements.maximum_payment_fees[i],
            tokenDecimals(_marketRequirements.accepted_payments[i])
          ).toNumber();
        }
      }

      setMaxPaymentFeeMap(_maxPaymentFeeMap);
    })();
  }, [_chainMeta.networkId]);

  const getOnChainNFTs = async () => {
    const onChainNfts = await getNftsOfACollectionForAnAddress(address, _chainMeta.contracts.dataNFTFTTicker, _chainMeta.networkId);

    if (onChainNfts.length > 0) {
      const codec = new BinaryCodec();
      const json = JSON.parse(JSON.stringify(dataNftMintJson));
      const abiRegistry = AbiRegistry.create(json);
      const dataNftAttributes = abiRegistry.getStruct("DataNftAttributes");

      // some logic to loop through the raw onChainNFTs and build the dataNfts
      const _dataNfts: DataNftType[] = [];

      for (let index = 0; index < onChainNfts.length; index++) {
        const decodedAttributes = codec.decodeTopLevel(Buffer.from(onChainNfts[index].attributes, "base64"), dataNftAttributes).valueOf();
        const nft = onChainNfts[index];

        _dataNfts.push({
          index, // only for view & query
          id: nft.identifier, // ID of NFT -> done
          nftImgUrl: nft.url ? nft.url : "", // image URL of of NFT -> done
          dataPreview: decodedAttributes["data_preview_url"].toString(), // preview URL for NFT data stream -> done
          dataStream: decodedAttributes["data_stream_url"].toString(), // data stream URL -> done
          dataMarshal: decodedAttributes["data_marshal_url"].toString(), // data stream URL -> done
          tokenName: nft.name, // is this different to NFT ID? -> yes, name can be chosen by the user
          feeInTokens: 100, // how much in ITHEUM tokens => should not appear here as it's in the wallet, not on the market
          creator: decodedAttributes["creator"].toString(), // initial creator of NFT
          creationTime: new Date(Number(decodedAttributes["creation_time"]) * 1000), // initial creation time of NFT
          supply: nft.supply ? Number(nft.supply) : 0,
          balance: Number(nft.balance),
          description: decodedAttributes["description"].toString(),
          title: decodedAttributes["title"].toString(),
          royalties: nft.royalties / 100,
          nonce: nft.nonce,
          collection: nft.collection,
        });
      }
      setDataNfts(_dataNfts);
    } else {
      // await sleep(4);
      setDataNfts([]);
    }
  };

  useEffect(() => {
    if (hasPendingTransactions) return;
    if (!_chainMeta.networkId) return;

    getOnChainNFTs();
  }, [hasPendingTransactions, _chainMeta.networkId]);

  useEffect(() => {
    (async () => {
      if (!_chainMeta.networkId) return;
      if (address && !hasPendingTransactions) {
        const _userData = await mintContract.getUserDataOut(address, _chainMeta.contracts.itheumToken);
        setUserData(_userData);
      }
    })();
  }, [address, hasPendingTransactions, _chainMeta.networkId]);

  function openNftDetailsDrawer(index: number) {
    setNftForDrawer(dataNfts[index]);
    onOpenDrawerTradeStream();
  }

  function closeDetailsView() {
    onCloseDrawerTradeStream();
    setNftForDrawer(undefined);
  }

  return (
    <>
      <Stack>
        <Heading size="xl" fontWeight="medium" mt={10} mx={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }}>
          Data NFT Wallet
        </Heading>
        <Heading size="1rem" opacity=".7" fontWeight="light" px={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }}>
          Below are the Data NFTs you created and/or purchased on the current chain
        </Heading>

        <Tabs pt={10}>
          <TabList overflow={{ base: "scroll", md: "unset", lg: "unset" }}>
            {walletTabs.map((tab, index) => {
              return (
                <Tab key={index} isDisabled={tab.isDisabled} _selected={{ borderBottom: "5px solid", borderBottomColor: "teal.200" }}>
                  <Flex ml="4.7rem" alignItems="center">
                    <Icon as={tab.icon} mx={2} textColor={colorMode === "dark" ? "white" : "black"} />
                    <Text fontSize="lg" color={colorMode === "dark" ? "white" : "black"}>
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
            <TabPanel mt={10}>
              {dataNfts.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 4 }} spacingY={4} mx={"24 !important"}>
                  {dataNfts.map((item, index) => (
                    <WalletDataNFTMX
                      key={index}
                      hasLoaded={oneNFTImgLoaded}
                      setHasLoaded={setOneNFTImgLoaded}
                      userData={userData}
                      maxPayment={maxPaymentFeeMap[itheumToken]}
                      sellerFee={sellerFee || 0}
                      openNftDetailsDrawer={openNftDetailsDrawer}
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
            <TabPanel>Nothing here yet...</TabPanel>
            <TabPanel>Nothing here yet...</TabPanel>
            <TabPanel>Nothing here yet...</TabPanel>
            <TabPanel>Nothing here yet...</TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>
      {nftForDrawer && (
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
                <DataNFTDetails tokenIdProp={nftForDrawer.id} closeDetailsView={closeDetailsView} />
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </>
      )}
    </>
  );
}
