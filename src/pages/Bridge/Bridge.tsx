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
  Box,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { AbiRegistry, BinaryCodec } from "@multiversx/sdk-core/out";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { FaBrush } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { NoDataHere } from "components/Sections/NoDataHere";
import useThrottle from "components/UtilComps/UseThrottle";
import WalletDataNFTMX from "components/WalletDataNFTMX/WalletDataNFTMX";
import { contractsForChain } from "libs/config";
import dataNftMintJson from "libs/MultiversX/ABIs/datanftmint.abi.json";
import { getNftsOfACollectionForAnAddress } from "libs/MultiversX/api";
import { createDataNftType, DataNftType } from "libs/MultiversX/types";
import { useMarketStore } from "store";

export default function MyDataNFTsMx({ tabState }: { tabState: number }) {
  const { colorMode } = useColorMode();
  const { chainID } = useGetNetworkConfig();
  const itheumToken = contractsForChain(chainID).itheumToken;
  const { address } = useGetAccountInfo();
  const navigate = useNavigate();

  const marketRequirements = useMarketStore((state) => state.marketRequirements);
  // const userData = useMintStore((state) => state.userData);
  const maxPaymentFeeMap = useMarketStore((state) => state.maxPaymentFeeMap);

  const [dataNfts, setDataNfts] = useState<DataNftType[]>(() => {
    const _dataNfts: DataNftType[] = [];
    for (let index = 0; index < 8; index++) {
      _dataNfts.push(createDataNftType());
    }
    return _dataNfts;
  });
  const purchasedDataNfts: DataNftType[] = dataNfts.filter((item) => item.creator != address);
  const [oneNFTImgLoaded, setOneNFTImgLoaded] = useState(false);
  const { hasPendingTransactions } = useGetPendingTransactions();

  const [nftForDrawer, setNftForDrawer] = useState<DataNftType | undefined>();
  const { isOpen: isOpenDataNftDetails, onOpen: onOpenDataNftDetails, onClose: onCloseDataNftDetails } = useDisclosure();

  const getOnChainNFTs = async () => {
    const onChainNfts = await getNftsOfACollectionForAnAddress(
      address,
      contractsForChain(chainID).dataNftTokens.map((v) => v.id),
      chainID
    );

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
          supply: nft.supply ? Number(nft.supply) : 1,
          balance: nft.balance !== undefined ? Number(nft.balance) : 1,
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

    getOnChainNFTs();
  }, [hasPendingTransactions]);

  function openNftDetailsDrawer(index: number) {
    setNftForDrawer(dataNfts[index]);
    onOpenDataNftDetails();
  }

  return (
    <>
      <Stack>
        <Heading size="xl" fontFamily="Clash-Medium" mt={10} mx={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }}>
          Token Bridge
        </Heading>
        <Heading size="1rem" opacity=".7" fontFamily="Satoshi-Medium" fontWeight="light" px={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }}>
          Bridge ITHEUM tokens to external blockchains
        </Heading>

        <Box>
          {dataNfts.length > 0 ? (
            <SimpleGrid
              columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
              spacingY={4}
              mx={{ base: 0, "2xl": "24 !important" }}
              mt="5 !important"
              justifyItems={"center"}>
              {dataNfts.map((item, index) => (
                <WalletDataNFTMX
                  key={index}
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
        </Box>
      </Stack>
    </>
  );
}
