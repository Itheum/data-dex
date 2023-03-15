import {
  AbiRegistry,
  SmartContractAbi,
  SmartContract,
  Address,
  ResultsParser,
  Transaction,
  TransactionPayload,
  ContractFunction,
  BigUIntValue,
  BytesValue,
  StringValue,
  TokenPayment,
  ArgSerializer,
  TokenIdentifierValue,
  U64Value,
  AddressValue,
  BinaryCodec,
} from "@multiversx/sdk-core/out";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import { NftType } from "@multiversx/sdk-dapp/types/tokens.types";
import { refreshAccount } from "@multiversx/sdk-dapp/utils/account";
import { ProxyNetworkProvider } from "@multiversx/sdk-network-providers/out";
import { contractsForChain, convertEsdtToWei } from "libs/util";
import jsonData from "./ABIs/datanftmint.abi.json";
import { DataNftMetadataType, UserDataType } from "./types";

export class DataNftMintContract {
  timeout: number;
  dataNftMarketContractAddress: any;
  chainID: string;
  networkProvider: ProxyNetworkProvider;
  contract: SmartContract;
  abiRegistry: AbiRegistry;
  dataNftMintContractAddress: string;

  constructor(networkId: string) {
    this.timeout = 5000;
    this.dataNftMintContractAddress = contractsForChain(networkId).dataNftMint || "";
    this.chainID = "D";

    if (networkId === "E1") {
      this.networkProvider = new ProxyNetworkProvider("https://gateway.multiversx.com", { timeout: this.timeout });
      this.chainID = "1";
    } else {
      this.networkProvider = new ProxyNetworkProvider("https://devnet-gateway.multiversx.com", {
        timeout: this.timeout,
      });
    }

    const json = JSON.parse(JSON.stringify(jsonData));
    this.abiRegistry = AbiRegistry.create(json);
    const abi = new SmartContractAbi(this.abiRegistry, ["DataNftMintContract"]);

    this.contract = new SmartContract({
      address: new Address(this.dataNftMintContractAddress),
      abi: abi,
    });
  }

  async sendMintTransaction({
    name,
    media,
    metadata,
    data_marchal,
    data_stream,
    data_preview,
    royalties,
    amount,
    title,
    description,
    sender,
    itheumToken,
    antiSpamTax,
  }: {
    name: string;
    media: string;
    metadata: string;
    data_marchal: string;
    data_stream: string;
    data_preview: string;
    royalties: number;
    amount: number;
    title: string;
    description: string;
    sender: string;
    itheumToken: string;
    antiSpamTax: number;
  }) {
    let data;
    if (antiSpamTax > 0) {
      data = TransactionPayload.contractCall()
        .setFunction(new ContractFunction("ESDTTransfer"))
        .addArg(new StringValue(itheumToken))
        .addArg(new BigUIntValue(convertEsdtToWei(antiSpamTax)))
        .addArg(new StringValue("mint"))
        .addArg(new StringValue(name))
        .addArg(new StringValue(media))
        .addArg(new StringValue(metadata))
        .addArg(new StringValue(data_marchal))
        .addArg(new StringValue(data_stream))
        .addArg(new StringValue(data_preview))
        .addArg(new BigUIntValue(royalties))
        .addArg(new BigUIntValue(amount))
        .addArg(new StringValue(title))
        .addArg(new StringValue(description))
        .build();
    } else {
      data = TransactionPayload.contractCall()
        .setFunction(new ContractFunction("mint"))
        .addArg(new StringValue(name))
        .addArg(new StringValue(media))
        .addArg(new StringValue(data_marchal))
        .addArg(new StringValue(data_stream))
        .addArg(new StringValue(data_preview))
        .addArg(new BigUIntValue(royalties))
        .addArg(new BigUIntValue(amount))
        .addArg(new StringValue(title))
        .addArg(new StringValue(description))
        .build();
    }

    const mintTransaction = new Transaction({
      data,
      sender: new Address(sender),
      receiver: new Address(this.dataNftMintContractAddress),
      gasLimit: 60000000,
      chainID: this.chainID,
    });

    await refreshAccount();

    const { sessionId, error } = await sendTransactions({
      transactions: mintTransaction,
      transactionsDisplayInfo: {
        processingMessage: "Minting Data NFT",
        errorMessage: "Data NFT minting error",
        successMessage: "Data NFT minted successfully",
      },
      redirectAfterSign: false,
    });

    return { sessionId, error };
  }

  async sendBurnTransaction(sender: string, collection: string, nonce: number, quantity: number) {
    const tx = new Transaction({
      value: 0,
      data: TransactionPayload.contractCall()
        .setFunction(new ContractFunction("ESDTNFTTransfer")) //method
        .addArg(new TokenIdentifierValue(collection)) //what token id to send
        .addArg(new U64Value(nonce)) //what token nonce to send
        .addArg(new BigUIntValue(quantity)) //how many tokens to send
        .addArg(new AddressValue(new Address(this.dataNftMintContractAddress))) //address to send to
        .addArg(new StringValue("burn")) //what method to call on the contract
        .build(),
      receiver: new Address(sender),
      sender: new Address(sender),
      gasLimit: 12_000_000,
      chainID: "D",
    });
    await refreshAccount();
    await sendTransactions({
      transactions: tx,
      transactionsDisplayInfo: {
        processingMessage: "Burning Data NFT",
        errorMessage: "Error occured",
        successMessage: "Data NFT burnt",
      },
      redirectAfterSign: false,
    });
  }

  async getUserDataOut(address: string, spamTaxTokenId: string): Promise<UserDataType | undefined> {
    const interaction = this.contract.methods.getUserDataOut([new Address(address), spamTaxTokenId]);
    const query = interaction.buildQuery();
    const result = [];

    try {
      const res = await this.networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();

      const { firstValue, secondValue, returnCode } = new ResultsParser().parseQueryResponse(res, endpointDefinition);

      if (returnCode && returnCode.isSuccess() && firstValue) {
        const userData = firstValue.valueOf();
        const returnData: UserDataType = {
          antiSpamTaxValue: userData.anti_spam_tax_value.toNumber(),
          addressFrozen: userData.frozen,
          frozenNonces: userData.frozen_nonces.map((v: any) => v.toNumber()),
          contractPaused: userData.is_paused,
          userWhitelistedForMint: userData.is_whitelisted,
          lastUserMintTime: userData.last_mint_time * 1000,
          maxRoyalties: userData.max_royalties.toNumber(),
          maxSupply: userData.max_supply.toNumber(),
          minRoyalties: userData.min_royalties.toNumber(),
          mintTimeLimit: userData.mint_time_limit * 1000,
          numberOfMintsForUser: userData.minted_per_user.toNumber(),
          totalNumberOfMints: userData.total_minted.toNumber(),
          contractWhitelistEnabled: userData.whitelist_enabled,
        };

        return returnData;
      } else {
        const nonOKErr = new Error("getUserDataOut returnCode returned a non OK value");
        console.error(nonOKErr);

        return undefined;
      }
    } catch (error) {
      console.error(error);

      return undefined;
    }
  }

  decodeNftAttributes(nft: NftType, index: number): DataNftMetadataType {
    const dataNftAttributes = this.abiRegistry.getStruct("DataNftAttributes");
    const decodedAttributes = new BinaryCodec().decodeTopLevel(Buffer.from(nft.attributes, "base64"), dataNftAttributes).valueOf();
    const dataNFT: DataNftMetadataType = {
      index, // only for view & query
      id: nft.identifier, // ID of NFT -> done
      nftImgUrl: nft.url, // image URL of of NFT -> done
      dataPreview: decodedAttributes["data_preview_url"].toString(), // preview URL for NFT data stream -> done
      dataStream: decodedAttributes["data_stream_url"].toString(), // data stream URL -> done
      dataMarshal: decodedAttributes["data_marshal_url"].toString(), // data stream URL -> done
      tokenName: nft.name, // is this different to NFT ID? -> yes, name can be chosen by the user
      creator: decodedAttributes["creator"].toString(), // initial creator of NFT
      creationTime: new Date(Number(decodedAttributes["creation_time"]) * 1000), // initial creation time of NFT
      supply: nft.supply ? Number(nft.supply) : 0,
      description: decodedAttributes["description"].toString(),
      title: decodedAttributes["title"].toString(),
      royalties: nft.royalties ? nft.royalties / 100 : 0,
      nonce: nft.nonce,
      collection: nft.collection,
      balance: 0,
    };

    return dataNFT;
  }

  async getSftsFreezedForAddress(targetAddress: string): Promise<number[]> {
    try {
      const interaction = this.contract.methods.getSftsFreezedForAddress([new Address(targetAddress)]);
      const query = interaction.buildQuery();
      const res = await this.networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();

      const { firstValue, returnCode, returnMessage } = new ResultsParser().parseQueryResponse(res, endpointDefinition);

      if (returnCode && returnCode.isSuccess() && firstValue) {
        const values = firstValue.valueOf();
        const decoded = values.map((value: any) => value.toNumber());

        return decoded;
      } else {
        console.error(returnMessage);

        return [];
      }
    } catch (error) {
      console.error(error);

      return [];
    }
  }
}
