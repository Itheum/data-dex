import React, { useEffect, useState } from "react";
import {
  CloseButton,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { AbiRegistry, BinaryCodec, SmartContractAbi } from "@multiversx/sdk-core/out";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
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

export default function MyDataNFTsMx({ onRfMount }: { onRfMount: any }) {
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
      const abi = new SmartContractAbi(abiRegistry, ["DataNftMint"]);
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
      <Stack spacing={5}>
        <Heading size="lg">Data NFT Wallet</Heading>
        <Heading size="xs" opacity=".7">
          Below are the Data NFTs you created and/or purchased on the current chain
        </Heading>

        {dataNfts.length > 0 ?
          <SimpleGrid columns={{ base: 1, md: 5 }} spacing={4}>
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
          </SimpleGrid> : <Text onClick={getOnChainNFTs}>No data yet...</Text>}
      </Stack>
      {
        nftForDrawer && (<>
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
                  tokenIdProp={nftForDrawer.id}
                  closeDetailsView={closeDetailsView}
                />
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </>)
      }
    </>
  );
}
