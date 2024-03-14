import { DataNft, SftMinter } from "@itheum/sdk-mx-data-nft/out";
import {
  Transaction,
  ContractFunction,
  BigUIntValue,
  StringValue,
  TokenIdentifierValue,
  U64Value,
  AddressValue,
  ContractCallPayloadBuilder,
  IAddress,
} from "@multiversx/sdk-core/out";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import { NftType } from "@multiversx/sdk-dapp/types/tokens.types";
import { refreshAccount } from "@multiversx/sdk-dapp/utils/account";
import BigNumber from "bignumber.js";
import { uxConfig } from "libs/config";
import { sleep } from "libs/utils";
import { DataNftMetadataType, UserDataType } from "./types";
import { contractsForChain } from "../config";

export class DataNftMintContract {
  contract: SftMinter;
  itheumToken: string;

  constructor(chainID: string) {
    let env = "devnet";
    if (chainID === "1") {
      env = "mainnet";
    }
    this.contract = new SftMinter(env, uxConfig.mxAPITimeoutMs);
    this.itheumToken = contractsForChain(chainID).itheumToken as unknown as string; // TODO: check if working without last part
  }

  async sendMintTransaction({
    name,
    data_marshal,
    data_stream,
    data_preview,
    royalties,
    amount,
    title,
    description,
    sender,
    lockPeriod,
    amountToSend,
  }: {
    name: string;
    data_marshal: string;
    data_stream: string;
    data_preview: string;
    royalties: number;
    amount: BigNumber.Value;
    title: string;
    description: string;
    sender: IAddress;
    contractAddress?: IAddress;
    lockPeriod?: number;
    amountToSend: BigNumber.Value;
  }) {
    const mintTx = this.contract.mint(
      sender,
      name,
      data_marshal,
      data_stream,
      data_preview,
      royalties,
      Number(amount),
      title,
      description,
      Number(amountToSend),
      lockPeriod,
      {
        nftStorageToken: import.meta.env.VITE_ENV_NFT_STORAGE_KEY,
      }
    );

    await sleep(3);
    await refreshAccount();

    const { sessionId, error } = await sendTransactions({
      transactions: mintTx,
      transactionsDisplayInfo: {
        processingMessage: "Minting Data NFT Collection",
        errorMessage: "Collection minting failed :(",
        successMessage: "Collection minted successfully!",
      },
      redirectAfterSign: false,
    });
    return { sessionId, error };
  }

  //TODO
  async sendBurnTransaction(
    sender: IAddress,
    collection: string,
    nonce: number,
    quantity: number,
    contractAddress: IAddress = this.contract.getContractAddress()
  ) {
    const tx = new Transaction({
      value: 0,
      data: new ContractCallPayloadBuilder()
        .setFunction(new ContractFunction("ESDTNFTTransfer")) //method
        .addArg(new TokenIdentifierValue(collection)) //what token id to send
        .addArg(new U64Value(nonce)) //what token nonce to send
        .addArg(new BigUIntValue(quantity)) //how many tokens to send
        .addArg(new AddressValue(contractAddress)) //address to send to
        .addArg(new StringValue("burn")) //what method to call on the contract
        .build(),
      receiver: sender,
      sender: sender,
      gasLimit: 12_000_000,
      chainID: this.contract.chainID,
    });
    await refreshAccount();
    await sendTransactions({
      transactions: tx,
      transactionsDisplayInfo: {
        processingMessage: "Burning Data NFT",
        errorMessage: "Burning Data NFT failed :(",
        successMessage: "Data NFT burnt",
      },
      redirectAfterSign: false,
    });
  }

  async getUserDataOut(address: IAddress, spamTaxTokenId: string): Promise<UserDataType | undefined> {
    try {
      const userData = await this.contract.viewMinterRequirements(address, spamTaxTokenId);
      userData.lastUserMintTime *= 1000;
      userData.mintTimeLimit *= 1000;

      return userData;
    } catch (error) {
      console.error(error);

      return undefined;
    }
  }

  decodeNftAttributes(nft: NftType, index?: number): DataNftMetadataType {
    const decodedAttributes = DataNft.decodeAttributes(nft.attributes);
    const dataNFT: DataNftMetadataType = {
      index: index || 0, // only for view & query
      id: nft.identifier, // ID of NFT -> done
      nftImgUrl: nft.url, // image URL of of NFT -> done
      dataPreview: decodedAttributes.dataPreview || "", // preview URL for NFT data stream -> done
      dataStream: decodedAttributes.dataStream || "", // data stream URL -> done
      dataMarshal: decodedAttributes.dataMarshal || "", // data stream URL -> done
      tokenName: nft.name, // is this different to NFT ID? -> yes, name can be chosen by the user
      creator: decodedAttributes.creator || "", // initial creator of NFT
      creationTime: decodedAttributes.creationTime || new Date(1970), // initial creation time of NFT
      supply: nft.supply ? Number(nft.supply) : 1,
      description: decodedAttributes.description || "",
      title: decodedAttributes.title || "",
      royalties: nft.royalties ? nft.royalties / 100 : 0,
      nonce: nft.nonce,
      collection: nft.collection,
      balance: 0,
    };

    return dataNFT;
  }

  async getSftsFrozenForAddress(targetAddress: IAddress): Promise<number[]> {
    try {
      const frozenSfts = await this.contract.viewAddressFrozenNonces(targetAddress);

      return frozenSfts;
    } catch (error) {
      console.error(error);

      return [];
    }
  }

  async getWhiteList(): Promise<string[]> {
    try {
      const whitelist = await this.contract.viewWhitelist();
      return whitelist;
    } catch (error) {
      console.error(error);

      return [];
    }
  }
}
