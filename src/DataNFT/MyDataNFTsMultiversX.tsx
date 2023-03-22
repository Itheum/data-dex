import React, { useEffect, useState } from "react";
import { Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { AbiRegistry, BinaryCodec, SmartContractAbi } from "@multiversx/sdk-core/out";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { useLocalStorage } from "libs/hooks";
import { convertWeiToEsdt } from "libs/util";
import { getItheumPriceFromApi, getNftsOfACollectionForAnAddress } from "MultiversX/api";
import { DataNftMarketContract } from "MultiversX/dataNftMarket";
import { DataNftMintContract } from "MultiversX/dataNftMint";
import { DataNftType, ItemType, RecordStringNumberType } from "MultiversX/types";
import { useChainMeta } from "store/ChainMetaContext";
import { SkeletonLoadingList } from "UtilComps/SkeletonLoadingList";
import { DataNftWalletLowerCard } from "./DataNftWalletLowerCard";
import dataNftMintJson from "../MultiversX/ABIs/datanftmint.abi.json";
import { tokenDecimals } from "../MultiversX/tokenUtils.js";
import UpperCardComponent from "../UtilComps/UpperCardComponent";

export default function MyDataNFTsMx({ onRfMount }: { onRfMount: any }) {
  const { chainMeta: _chainMeta } = useChainMeta();
  const itheumToken = _chainMeta?.contracts?.itheumToken || null;
  const { address } = useGetAccountInfo();
  const [dataNfts, setDataNfts] = useState<DataNftType[]>([]);
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
      collection: "",
      creator: "",
      creationTime: new Date(),
    },
  ]);
  const [oneNFTImgLoaded, setOneNFTImgLoaded] = useState(false);
  const [noData, setNoData] = useState(false);
  const [amounts, setAmounts] = useState<number[]>([]);
  const [amountErrors, setAmountErrors] = useState<string[]>([]);
  const [prices, setPrices] = useState<number[]>([]);
  const [priceErrors, setPriceErrors] = useState<string[]>([]);
  const [maxPaymentFeeMap, setMaxPaymentFeeMap] = useState<RecordStringNumberType>({});

  const mintContract = new DataNftMintContract(_chainMeta.networkId);
  const marketContract = new DataNftMarketContract(_chainMeta.networkId);
  const { hasPendingTransactions } = useGetPendingTransactions();

  const [walletUsedSession, setWalletUsedSession] = useLocalStorage("itm-wallet-used", null);
  const [userData, setUserData] = useState<any>(undefined);
  const [marketFreezedNonces, setMarketFreezedNonces] = useState<number[]>([]);
  const [itheumPrice, setItheumPrice] = useState<number | undefined>();

  useEffect(() => {
    // console.log('********** MyDataNFTsMultiversX LOAD _chainMeta ', _chainMeta);

    (async () => {
      if (!_chainMeta.networkId) return;

      const _marketFreezedNonces = await mintContract.getSftsFreezedForAddress(marketContract.dataNftMarketContractAddress);
      setMarketFreezedNonces(_marketFreezedNonces);

      const _marketRequirements = await marketContract.getRequirements();
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

  const getItheumPrice = () => {
    (async () => {
      const _itheumPrice = await getItheumPriceFromApi();
      console.log("_itheumPrice", _itheumPrice);
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

  const getOnChainNFTs = async () => {
    const onChainNfts = await getNftsOfACollectionForAnAddress(address, _chainMeta.contracts.dataNFTFTTicker, _chainMeta.networkId);
    console.log("onChainNfts", onChainNfts);

    if (onChainNfts.length > 0) {
      const codec = new BinaryCodec();
      const json = JSON.parse(JSON.stringify(dataNftMintJson));
      const abiRegistry = AbiRegistry.create(json);
      const abi = new SmartContractAbi(abiRegistry, ["DataNftMint"]);
      const dataNftAttributes = abiRegistry.getStruct("DataNftAttributes");

      // some logic to loop through the raw onChainNFTs and build the dataNfts
      const _dataNfts: DataNftType[] = [];
      const localAmounts: number[] = [];
      const localPrices: number[] = [];
      const localErrors: string[] = [];
      const _amountErrors: string[] = [];

      for (let index = 0; index < onChainNfts.length; index++) {
        const decodedAttributes = codec.decodeTopLevel(Buffer.from(onChainNfts[index].attributes, "base64"), dataNftAttributes).valueOf();
        const nft = onChainNfts[index];

        _dataNfts.push({
          index, // only for view & query
          id: nft.identifier, // ID of NFT -> done
          nftImgUrl: nft.url ? nft.url : "", // image URL of NFT -> done
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

        localAmounts.push(1);
        localPrices.push(10);
        localErrors.push("");
        _amountErrors.push("");
      }

      setAmounts(localAmounts);
      setPrices(localPrices);
      setPriceErrors(localErrors);
      setAmountErrors(_amountErrors);

      setDataNfts(_dataNfts);
      setItems((prev) => {
        return _dataNfts.map((dataNft: DataNftType, i: number) => {
          return {
            ...(prev?.[i] ?? {}),
            id: dataNft.id,
            tokenName: dataNft.tokenName,
            title: dataNft.title,
            description: dataNft.description,
            creator: dataNft.creator,
            balance: dataNft.balance,
            supply: dataNft.supply,
            royalties: dataNft.royalties,
            creationTime: dataNft.creationTime,
            dataPreview: dataNft.dataPreview,
            nftImgUrl: dataNft.nftImgUrl,
            collection: dataNft.collection,
            nonce: dataNft.nonce,
          };
        });
      });
    } else {
      // await sleep(4);
      setNoData(true);
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

  return (
    <Stack spacing={5}>
      <Heading size="lg">Data NFT Wallet</Heading>
      <Heading size="xs" opacity=".7">
        Below are the Data NFTs you created and/or purchased on the current chain
      </Heading>

      {!noData && dataNfts.length === 0 ? (
        <>{<SkeletonLoadingList /> || <Text onClick={getOnChainNFTs}>No data yet...</Text>}</>
      ) : (
        <Flex wrap="wrap" gap="5" justifyContent={{ base: "center", md: "flex-start" }}>
          {items &&
            items.map((item, index) => (
              <div key={index}>
                <UpperCardComponent
                  nftImageLoading={oneNFTImgLoaded}
                  setNftImageLoading={setOneNFTImgLoaded}
                  nftMetadataLoading={oneNFTImgLoaded}
                  nftMetadatas={dataNfts}
                  userData={userData}
                  item={item}
                  index={index}
                  marketFreezedNonces={marketFreezedNonces}>
                  <DataNftWalletLowerCard dataNftItem={item} index={index} itheumPrice={itheumPrice} />
                </UpperCardComponent>
              </div>
            ))}
        </Flex>
      )}
    </Stack>
  );
}
