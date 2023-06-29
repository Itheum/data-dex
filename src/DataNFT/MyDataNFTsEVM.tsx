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
import { createDataNftType, DataNftType, RecordStringNumberType, UserDataType } from "MultiversX/typesEVM";
import { useChainMeta } from "store/ChainMetaContext";
import DataNFTDetails from "./DataNFTDetails";
import WalletDataNFTEVM from "./WalletDataNFTEVM";
import { NoDataHere } from "components/Sections/NoDataHere";

import { ethers } from "ethers";
import { ABIS } from "../EVM/ABIs";

export default function MyDataNFTsEVM({ onRfMount }: { onRfMount: any }) {
  const { colorMode } = useColorMode();
  const { chainMeta: _chainMeta } = useChainMeta();
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

  const getOnChainNFTsEVM = async (myAddress: string) => {
    const headers = new Headers();
    headers.set("Authorization", "Bearer cqt_rQQXcKFYDdrFjMdcbpkFW9jMCGfd");

    const endpointMyDataNFTs = `https://api.covalenthq.com/v1/astar-shibuya/address/${myAddress}/balances_v2/?nft=true`;

    fetch(endpointMyDataNFTs, { method: "GET", headers: headers })
      .then((resp) => resp.json())
      .then((res) => {
        if (res?.data?.items) {
          const dataNFTsRaw = res?.data?.items.filter((val: any) => {
            return (
              val.type === "nft" &&
              val.contract_ticker_symbol === "DATANFTFT1" &&
              val.contract_address.toLowerCase() === _chainMeta.contracts.dnft.toLowerCase()
            );
          });

          // some logic to loop through the raw onChainNFTs and build the dataNfts
          const _dataNfts: DataNftType[] = [];
          const _tokenIdAry: string[] = [];

          for (let index = 0; index < dataNFTsRaw[0]?.nft_data.length; index++) {
            const nft = dataNFTsRaw[0]?.nft_data[index];

            _dataNfts.push({
              index,
              id: nft.token_id,
              nftImgUrl: nft.external_data.image,
              dataPreview: nft.external_data.attributes.find((i: any) => i.trait_type === "Data Preview URL").value || "",
              dataStream: nft.external_data.attributes.find((i: any) => i.trait_type === "Data Stream URL")?.value || "",
              dataMarshal: nft.external_data.attributes.find((i: any) => i.trait_type === "Data Marshal URL")?.value || "",
              tokenName: nft.external_data.name,
              feeInTokens: -2,
              creator: nft.original_owner,
              creationTime: new Date(),
              supply: 1,
              balance: 1,
              description: nft.external_data.description,
              title: nft.external_data.name,
              royalties: -2,
              nonce: nft.token_id,
              collection: "DATANFTFT1",
              transferable: -2,
              secondaryTradeable: -2,
            });

            _tokenIdAry.push(nft.token_id);
          }

          mergeSmartContractMetaData(_tokenIdAry, _dataNfts);
        }
      });
  };

  function mergeSmartContractMetaData(_tokenIdAry: any, _dataNfts: any) {
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
        item.royalties = scMetaMap[item.id].royaltyInPercent;
        item.feeInTokens = scMetaMap[item.id].priceInItheum;
        item.transferable = scMetaMap[item.id].transferable;
        item.secondaryTradeable = scMetaMap[item.id].secondaryTradeable;
      });

      setDataNfts(_dataNfts);
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

  useEffect(() => {
    getOnChainNFTsEVM(_chainMeta.loggedInAddress);
  }, [_chainMeta.loggedInAddress]);

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
          Below are the Data NFTs you created or purchased on the current blockchain
        </Heading>

        <Tabs pt={10}>
          <TabList overflow={{ base: "scroll", md: "unset", lg: "unset" }}>
            {walletTabs.map((tab, index) => {
              return (
                <Tab key={index} isDisabled={tab.isDisabled} _selected={{ borderBottom: "5px solid", borderBottomColor: "teal.200" }}>
                  <Flex ml="4.7rem" alignItems="center" py={3}>
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
            <TabPanel mt={2} width={"full"}>
              {dataNfts.length > 0 ? (
                <SimpleGrid
                  columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
                  spacingY={4}
                  mx={{ base: 0, "2xl": "24 !important" }}
                  mt="5 !important"
                  justifyItems={"center"}>
                  {dataNfts.map((item, index) => (
                    <WalletDataNFTEVM
                      key={index}
                      hasLoaded={oneNFTImgLoaded}
                      setHasLoaded={setOneNFTImgLoaded}
                      userData={userData}
                      maxPayment={100}
                      sellerFee={sellerFee || 0}
                      openNftDetailsDrawer={openNftDetailsDrawer}
                      {...item}
                    />
                  ))}
                </SimpleGrid>
              ) : (
                <Flex>
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
