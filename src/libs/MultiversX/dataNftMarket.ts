import { useToast } from "@chakra-ui/react";
import { DataNftMarket, Offer } from "@itheum/sdk-mx-data-nft/out";
import {
  AbiRegistry,
  SmartContract,
  Address,
  ResultsParser,
  BigUIntValue,
  Transaction,
  ContractFunction,
  U64Value,
  TokenIdentifierValue,
  AddressValue,
  StringValue,
  U32Value,
  AddressType,
  OptionalValue,
  BooleanValue,
  ContractCallPayloadBuilder,
} from "@multiversx/sdk-core/out";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import { refreshAccount } from "@multiversx/sdk-dapp/utils/account";
import BigNumber from "bignumber.js";
import { contractsForChain, uxConfig } from "libs/config";
import { labels } from "libs/language";
import { getNetworkProvider } from "./api";
import { MarketplaceRequirementsType } from "./types";

export class DataNftMarketContract {
  contract: DataNftMarket;
  itheumToken: string;

  toast = useToast();

  constructor(chainID: string) {
    let env = "devnet";
    if (chainID === "1") {
      env = "mainnet";
    }
    this.contract = new DataNftMarket(env, uxConfig.mxAPITimeoutMs);
    this.itheumToken = contractsForChain(chainID).itheumToken as unknown as string; // TODO: check if working without last part
  }

  async sendAcceptOfferEsdtTransaction(index: number, paymentAmount: string, tokenId: string, amount: BigNumber.Value, sender: string, callbackRoute?: string) {
    let offerEsdtTx;
    if (new BigNumber(paymentAmount).comparedTo(0) > 0) {
      offerEsdtTx = this.contract.acceptOfferWithESDT(new Address(sender), index, amount, new BigNumber(paymentAmount), tokenId);
    } else {
      offerEsdtTx = this.contract.acceptOfferWithNoPayment(new Address(sender), index, amount);
    }

    await refreshAccount();

    const { sessionId, error } = await sendTransactions({
      transactions: offerEsdtTx,
      transactionsDisplayInfo: {
        processingMessage: "Accepting offer",
        errorMessage: "Error occurred during accepting offer",
        successMessage: "Offer accepted successfully",
      },
      redirectAfterSign: callbackRoute ? true : false,
      callbackRoute: callbackRoute ?? window.location.pathname,
    });

    return { sessionId, error };
  }

  async sendAcceptOfferNftEsdtTransaction(
    index: number,
    paymentAmount: string,
    tokenId: string,
    nonce: number,
    amount: number,
    senderAddress: string,
    callbackRoute?: string
  ) {
    const offerEsdtTx = new Transaction({
      value: 0,
      data: new ContractCallPayloadBuilder()
        .setFunction(new ContractFunction("ESDTNFTTransfer"))
        .addArg(new TokenIdentifierValue(tokenId))
        .addArg(new U64Value(nonce))
        .addArg(new BigUIntValue(paymentAmount))
        .addArg(new AddressValue(this.contract.getContractAddress()))
        .addArg(new StringValue("acceptOffer"))
        .addArg(new U64Value(index))
        .addArg(new BigUIntValue(amount))
        .build(),
      receiver: new Address(senderAddress),
      sender: new Address(senderAddress),
      gasLimit: 20000000,
      chainID: this.contract.chainID,
    });

    await refreshAccount();

    const { sessionId, error } = await sendTransactions({
      transactions: offerEsdtTx,
      transactionsDisplayInfo: {
        processingMessage: "Accepting offer",
        errorMessage: "Error occurred during accepting offer",
        successMessage: "Offer accepted successfully",
      },
      redirectAfterSign: callbackRoute ? true : false,
      callbackRoute: callbackRoute ?? window.location.pathname,
    });

    return { sessionId, error };
  }

  async sendAcceptOfferEgldTransaction(index: number, paymentAmount: string, amount: BigNumber.Value, senderAddress: string) {
    const offerEgldTx = this.contract.acceptOfferWithEGLD(new Address(senderAddress), index, amount, new BigNumber(paymentAmount));

    await refreshAccount();

    const { sessionId, error } = await sendTransactions({
      transactions: offerEgldTx,
      transactionsDisplayInfo: {
        processingMessage: "Accepting offer",
        errorMessage: "Error occurred during accepting offer",
        successMessage: "Offer accepted successfully",
      },
      redirectAfterSign: false,
    });

    return { sessionId, error };
  }

  async sendCancelOfferTransaction(index: number, senderAddress: string) {
    const cancelTx = this.contract.cancelOffer(new Address(senderAddress), index);

    await refreshAccount();

    const { sessionId, error } = await sendTransactions({
      transactions: cancelTx,
      transactionsDisplayInfo: {
        processingMessage: "Cancelling offer",
        errorMessage: "Error occurred during offer cancellation",
        successMessage: "Offer cancelled successfully",
      },
      redirectAfterSign: false,
    });

    return { sessionId, error };
  }

  async addToMarket(addTokenCollection: string, addTokenNonce: number, addTokenQuantity: number, price: BigNumber.Value, addressOfSender: string) {
    const addToMarketTx = this.contract.addOffer(
      new Address(addressOfSender),
      addTokenCollection,
      addTokenNonce,
      addTokenQuantity,
      this.itheumToken,
      0,
      new BigNumber(price).multipliedBy(10 ** 18),
      0
    );

    await refreshAccount();

    const { sessionId, error } = await sendTransactions({
      transactions: addToMarketTx,
      transactionsDisplayInfo: {
        processingMessage: "Adding Data NFT to marketplace",
        errorMessage: "Error occurred",
        successMessage: "Data NFT added to marketplace",
      },
      redirectAfterSign: false,
    });

    return { sessionId, error };
  }

  async delistDataNft(index: number, delistAmount: number, senderAddress: string) {
    const cancelOfferTx = this.contract.cancelOffer(new Address(senderAddress), index);

    await refreshAccount();

    const { sessionId, error } = await sendTransactions({
      transactions: cancelOfferTx,
      transactionsDisplayInfo: {
        processingMessage: "De-Listing offer",
        errorMessage: "Error occurred during de-listing offer",
        successMessage: "Offer de-listed successfully",
      },
      redirectAfterSign: false,
      sessionInformation: "delist-tx",
    });

    return { sessionId, error };
  }

  async viewNumberOfOffers() {
    try {
      const numberOfOffers = await this.contract.viewNumberOfOffers();
      return numberOfOffers;
    } catch (e) {
      console.error(e);
      this.toast({
        title: labels.ERR_MARKET_NR_OFFERS_FAIL,
        status: "error",
        isClosable: true,
        duration: 20000,
      });
      return undefined;
    }
  }

  async viewRequirements(): Promise<MarketplaceRequirementsType | undefined> {
    try {
      const marketplaceRequirements = await this.contract.viewRequirements();
      return {
        ...marketplaceRequirements,
        buyerFee: marketplaceRequirements.buyerTaxPercentage - marketplaceRequirements.buyerTaxPercentageDiscount,
        sellerFee: marketplaceRequirements.sellerTaxPercentage - marketplaceRequirements.sellerTaxPercentageDiscount,
      };
    } catch (e) {
      console.error(e);
      this.toast({
        title: labels.ERR_MARKET_REQ_FAIL,
        status: "error",
        isClosable: true,
        duration: 20000,
      });
      return undefined;
    }
  }

  //TODO: change to SDK
  async viewOffers(startIndex: number, stopIndex: number): Promise<Offer[]> {
    // this will spread out a new array from startIndex to stopIndex e.g. startIndex=0, stopIndex=5 : you get [1,2,3,4,5]
    const indexRange = Array.from({ length: stopIndex - startIndex }, (_, i) => new U64Value(startIndex + 1 + i));

    const interaction = this.contract.methodsExplicit.viewOffers(indexRange);
    const query = interaction.buildQuery();

    try {
      const networkProvider = getNetworkProvider(this.chainID);

      const res = await networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();
      const { firstValue, returnCode, returnMessage } = new ResultsParser().parseQueryResponse(res, endpointDefinition);

      if (!firstValue || !returnCode.isSuccess()) {
        console.error(returnMessage);
        return [];
      }

      const values = firstValue.valueOf();
      const decoded = values.map((value: any) => ({
        index: value.offer_id.toNumber(),
        owner: value.owner.toString(),
        offered_token_identifier: value.offered_token_identifier.toString(),
        offered_token_nonce: value.offered_token_nonce.toNumber(),
        offered_token_amount: value.offered_token_amount.toFixed(),
        wanted_token_identifier: value.wanted_token_identifier.toString(),
        wanted_token_nonce: value.wanted_token_nonce.toNumber(),
        wanted_token_amount: value.wanted_token_amount.toFixed(),
        quantity: value.quantity.toNumber(),
      }));

      return decoded;
    } catch (e) {
      console.error(e);
      this.toast({
        title: labels.ERR_MARKET_OFFERS_FAIL,
        status: "error",
        isClosable: true,
        duration: 20000,
      });
      return [];
    }
  }

  //TODO: add user address when SDK supports it
  async viewPagedOffers(startIndex: number, stopIndex: number, userAddress?: string): Promise<Offer[]> {
    const pagedOffers = await this.contract.viewPagedOffers(startIndex, stopIndex);

    try {
      const networkProvider = getNetworkProvider(this.chainID);

      const res = await networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();
      const { firstValue, returnCode, returnMessage } = new ResultsParser().parseQueryResponse(res, endpointDefinition);

      if (!firstValue || !returnCode.isSuccess()) {
        console.error(returnMessage);
        return [];
      }

      const values = firstValue.valueOf();
      const decoded = values.map((value: any) => ({
        index: value.offer_id.toNumber(),
        owner: value.owner.toString(),
        offered_token_identifier: value.offered_token_identifier.toString(),
        offered_token_nonce: value.offered_token_nonce.toNumber(),
        offered_token_amount: value.offered_token_amount.toFixed(),
        wanted_token_identifier: value.wanted_token_identifier.toString(),
        wanted_token_nonce: value.wanted_token_nonce.toNumber(),
        wanted_token_amount: value.wanted_token_amount.toFixed(),
        quantity: value.quantity.toNumber(),
      }));

      return decoded;
    } catch (e) {
      console.error(e);
      this.toast({
        title: labels.ERR_MARKET_OFFERS_FAIL,
        status: "error",
        isClosable: true,
        duration: 20000,
      });
      return [];
    }
  }

  //TODO: change this to SDK when it supports it
  async viewOffer(index: number): Promise<Offer | undefined> {
    const interaction = this.contract.methodsExplicit.viewOffer([new U64Value(index)]);
    const query = interaction.buildQuery();

    try {
      const networkProvider = getNetworkProvider(this.chainID);

      const res = await networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();
      const { firstValue, returnCode, returnMessage } = new ResultsParser().parseQueryResponse(res, endpointDefinition);

      if (!firstValue || !returnCode.isSuccess()) {
        console.error(returnMessage);
        return undefined;
      }

      const value = firstValue.valueOf();
      const decoded = {
        index: value.offer_id.toNumber(),
        owner: value.owner.toString(),
        offered_token_identifier: value.offered_token_identifier.toString(),
        offered_token_nonce: value.offered_token_nonce.toNumber(),
        offered_token_amount: value.offered_token_amount.toFixed(),
        wanted_token_identifier: value.wanted_token_identifier.toString(),
        wanted_token_nonce: value.wanted_token_nonce.toNumber(),
        wanted_token_amount: value.wanted_token_amount.toFixed(),
        quantity: value.quantity.toNumber(),
      };

      return decoded;
    } catch (e) {
      console.error(e);
      this.toast({
        title: labels.ERR_MARKET_OFFERS_FAIL,
        status: "error",
        isClosable: true,
        duration: 20000,
      });
      return undefined;
    }
  }

  async viewUserTotalOffers(userAddress: string): Promise<number> {
    try {
      const userTotalOffers = await this.contract.viewAddressTotalOffers(new Address(userAddress));
      return userTotalOffers;
    } catch (e) {
      console.error(e);
      this.toast({
        title: labels.ERR_MARKET_OFFERS_FAIL,
        status: "error",
        isClosable: true,
        duration: 20000,
      });
      return 0;
    }
  }

  async updateOfferPrice(index: number, newPrice: string, senderAddress: string) {
    const changeOfferPriceTx = await this.contract.changeOfferPrice(new Address(senderAddress), index, new BigNumber(newPrice), 0);

    await refreshAccount();

    const { sessionId, error } = await sendTransactions({
      transactions: changeOfferPriceTx,
      transactionsDisplayInfo: {
        processingMessage: "Updating price",
        errorMessage: "Error occurred during updating price",
        successMessage: "Fee updated successfully",
      },
      redirectAfterSign: false,
      sessionInformation: "update-price-tx",
    });

    return { sessionId, error };
  }

  async getLastValidOfferId(): Promise<number> {
    const lastValidOfferId = await this.contract.viewLastValidOfferId();

    try {
      lastValidOfferId;
      return lastValidOfferId;
    } catch (e) {
      console.error(e);
      this.toast({
        title: labels.ERR_MARKET_OFFERS_FAIL,
        status: "error",
        isClosable: true,
        duration: 20000,
      });
      return 0;
    }
  }

  async getIsPaused(): Promise<boolean> {
    try {
      const isPaused = await this.contract.viewContractPauseState();
      return isPaused;
    } catch (e) {
      console.error(e);
      this.toast({
        title: labels.ERR_CONTRACT_PARAM_READ,
        status: "error",
        isClosable: true,
        duration: 20000,
      });

      return false;
    }
  }
}
