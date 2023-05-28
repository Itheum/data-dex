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
import { BsClockHistory } from "react-icons/bs";
import { FaBrush } from "react-icons/fa";
import { MdFavoriteBorder, MdOutlineLocalOffer, MdOutlineShoppingBag } from "react-icons/md";
import { createDataNftType, DataNftType, RecordStringNumberType, UserDataType } from "MultiversX/types";
import { useChainMeta } from "store/ChainMetaContext";
import DataNFTDetails from "./DataNFTDetails";
import WalletDataNFTMX from "./WalletDataNFTMX";

export default function MyDataNFTsEVM({ onRfMount }: { onRfMount: any }) {
  const { colorMode } = useColorMode();
  const { chainMeta: _chainMeta } = useChainMeta();
  const itheumToken = _chainMeta?.contracts?.itheumToken || null;
  const [dataNfts, setDataNfts] = useState<DataNftType[]>(() => {
    const _dataNfts: DataNftType[] = [];
    for (let index = 0; index < 5; index++) {
      _dataNfts.push(createDataNftType());
    }
    return _dataNfts;
  });
  const [oneNFTImgLoaded, setOneNFTImgLoaded] = useState(false);
  const [maxPaymentFeeMap, setMaxPaymentFeeMap] = useState<RecordStringNumberType>({});
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
    (async () => {
      if (!_chainMeta.networkId) return;
    })();
  }, [_chainMeta.networkId]);

  const getOnChainNFTsEVM = async (myAddress : string) => {
    const headers = new Headers();
    headers.set('Authorization', 'Bearer cqt_rQQXcKFYDdrFjMdcbpkFW9jMCGfd');

    const endpointMyDataNFTs = `https://api.covalenthq.com/v1/astar-shibuya/address/${myAddress}/balances_v2/?nft=true`;

    fetch(endpointMyDataNFTs, { method: 'GET', headers: headers })
      .then((resp) => resp.json())
      .then((res) => {
        console.log(res);

        if (res?.data?.items) {
          const dataNFTsRaw = res?.data?.items
            .filter((val : any) => {
              return (
                val.type === 'nft' &&
                val.contract_ticker_symbol === 'DATANFTFT1' &&
                val.contract_address.toLowerCase() === '0xaC9e9eA0d85641Fa176583215447C81eBB5eD7b3'.toLowerCase()
              );
            });

          console.log('dataNFTsRaw');
          console.log(dataNFTsRaw);

          // some logic to loop through the raw onChainNFTs and build the dataNfts
          const _dataNfts: DataNftType[] = [];

          for (let index = 0; index < dataNFTsRaw[0]?.nft_data.length; index++) {
            const nft = dataNFTsRaw[0]?.nft_data[index];

            _dataNfts.push({
              index,
              id: nft.token_id,
              nftImgUrl: nft.external_data.image,
              dataPreview: nft.external_data.attributes.find((i : any) => i.trait_type === 'Data Preview URL').value || '',
              dataStream: nft.external_data.attributes.find((i : any) => i.trait_type === 'Data Stream URL')?.value || '',
              dataMarshal: nft.external_data.attributes.find((i : any) => i.trait_type === 'Data Marshal URL')?.value || '',
              tokenName: nft.external_data.name,
              feeInTokens: 100,
              creator: nft.original_owner,
              creationTime: new Date(),
              supply: 1,
              balance: 1,
              description: nft.external_data.description,
              title: nft.external_data.name,
              royalties: 0,
              nonce: nft.token_id,
              collection: 'DATANFTFT1',
            });
          }

          setDataNfts(_dataNfts);
        }
      });
  };

  useEffect(() => {
    getOnChainNFTsEVM(_chainMeta.loggedInAddress);
  }, [ _chainMeta.loggedInAddress]);


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
          Data NFT Wallet (Astar Network)
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
                <Text>No data yet...</Text>
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
