import { useToast } from "@chakra-ui/react";
import { DataNftMarket, Offer } from "@itheum/sdk-mx-data-nft/out";
import {
  Address,
  BigUIntValue,
  Transaction,
  ContractFunction,
  U64Value,
  TokenIdentifierValue,
  AddressValue,
  StringValue,
  ContractCallPayloadBuilder,
} from "@multiversx/sdk-core/out";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import { refreshAccount } from "@multiversx/sdk-dapp/utils/account";
import BigNumber from "bignumber.js";
import { contractsForChain, uxConfig } from "libs/config";
import { labels } from "libs/language";
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
    this.itheumToken = contractsForChain(chainID).itheumToken;
  }

  async sendAcceptOfferEsdtTransaction(
    index: number,
    paymentAmount: string,
    tokenId: string,
    amount: number,
    sender: string,
    callbackRoute?: string,
    showCustomMintMsg?: boolean
  ) {
    let offerEsdtTx;
    if (new BigNumber(paymentAmount).comparedTo(0) > 0) {
      offerEsdtTx = this.contract.acceptOfferWithESDT(new Address(sender), index, amount, new BigNumber(paymentAmount), tokenId);
    } else {
      offerEsdtTx = this.contract.acceptOfferWithNoPayment(new Address(sender), index, amount);
    }
    offerEsdtTx.setGasLimit(20000000);

    await refreshAccount();

    const actionMsg = showCustomMintMsg ? "Minting Data NFT" : "Accepting offer";

    const { sessionId, error } = await sendTransactions({
      transactions: offerEsdtTx,
      transactionsDisplayInfo: {
        processingMessage: actionMsg,
        errorMessage: `${actionMsg} failed :(`,
        successMessage: `${actionMsg} successful!`,
      },
      redirectAfterSign: callbackRoute ? true : false,
      callbackRoute: callbackRoute ?? window.location.pathname,
    });

    return { sessionId, error };
  }

  ///TODO refactor to use Sdk when we are accepting NFT/SFT as payment
  async sendAcceptOfferNftEsdtTransaction(
    index: number,
    paymentAmount: string,
    tokenId: string,
    nonce: number,
    amount: number,
    senderAddress: string,
    callbackRoute?: string,
    showCustomMintMsg?: boolean
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

    const actionMsg = showCustomMintMsg ? "Minting Data NFT" : "Accepting offer";

    const { sessionId, error } = await sendTransactions({
      transactions: offerEsdtTx,
      transactionsDisplayInfo: {
        processingMessage: actionMsg,
        errorMessage: `${actionMsg} failed :(`,
        successMessage: `${actionMsg} successful!`,
      },
      redirectAfterSign: callbackRoute ? true : false,
      callbackRoute: callbackRoute ?? window.location.pathname,
    });

    return { sessionId, error };
  }

  async sendAcceptOfferEgldTransaction(index: number, paymentAmount: string, amount: number, senderAddress: string, showCustomMintMsg?: boolean) {
    const offerEgldTx = this.contract.acceptOfferWithEGLD(new Address(senderAddress), index, amount, new BigNumber(paymentAmount));

    await refreshAccount();

    const actionMsg = showCustomMintMsg ? "Minting Data NFT" : "Accepting Offer";

    const { sessionId, error } = await sendTransactions({
      transactions: offerEgldTx,
      transactionsDisplayInfo: {
        processingMessage: actionMsg,
        errorMessage: `${actionMsg} failed :(`,
        successMessage: `${actionMsg} successful!`,
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
        errorMessage: "Adding Data NFT to marketplace failed :(",
        successMessage: "Data NFT added to marketplace",
      },
      redirectAfterSign: false,
    });

    return { sessionId, error };
  }

  async delistDataNft(index: number, delistAmount: number, senderAddress: string) {
    const cancelOfferTx = this.contract.cancelOffer(new Address(senderAddress), index, delistAmount);

    await refreshAccount();

    const { sessionId, error } = await sendTransactions({
      transactions: cancelOfferTx,
      transactionsDisplayInfo: {
        processingMessage: "De-listing offer",
        errorMessage: "De-listing offer failed :(",
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

  async viewOffers(startIndex: number, stopIndex: number): Promise<Offer[]> {
    try {
      const indexRange = [];
      for (let i = startIndex; i < stopIndex; i++) {
        indexRange.push(i + 1);
      }
      const offers = this.contract.viewOffers(indexRange);

      return offers;
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

  async viewPagedOffers(startIndex: number, stopIndex: number, userAddress?: string): Promise<Offer[]> {
    try {
      const pagedOffers = await this.contract.viewPagedOffers(startIndex, stopIndex, new Address(userAddress ?? ""));

      return pagedOffers;
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

  async viewOffer(index: number): Promise<Offer | undefined> {
    try {
      const offer = this.contract.viewOffer(index);
      return offer;
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
        errorMessage: "Updating price failed :(",
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
