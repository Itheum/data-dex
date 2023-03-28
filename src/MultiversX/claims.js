import {
  AbiRegistry,
  SmartContractAbi,
  SmartContract,
  Address,
  ResultsParser,
  Transaction,
  TransactionPayload,
  ContractFunction,
  U64Value,
} from "@multiversx/sdk-core/out";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import { refreshAccount } from "@multiversx/sdk-dapp/utils/account";
import { ProxyNetworkProvider } from "@multiversx/sdk-network-providers/out";
import { contractsForChain } from "libs/util";
import jsonData from "./ABIs/claims.abi.json";

export class ClaimsContract {
  constructor(networkId) {
    this.timeout = 5000;
    this.claimsContractAddress = contractsForChain(networkId).claims;
    this.chainID = "D";

    if (networkId === "E1") {
      this.chainID = "1";
    }

    const json = JSON.parse(JSON.stringify(jsonData));
    const abiRegistry = AbiRegistry.create(json);
    const abi = new SmartContractAbi(abiRegistry, ["ClaimsContract"]);

    this.contract = new SmartContract({
      address: new Address(this.claimsContractAddress),
      abi: abi,
    });
  }

  async getClaims(address) {
    const interaction = this.contract.methods.viewClaimWithDate([new Address(address)]);
    const query = interaction.buildQuery();
    const result = [];

    try {
      let networkProvider;
      if (this.chainID === "1") {
        networkProvider = new ProxyNetworkProvider("https://gateway.multiversx.com", { timeout: this.timeout });
      } else {
        networkProvider = new ProxyNetworkProvider("https://devnet-gateway.multiversx.com", {
          timeout: this.timeout,
        });
      }

      const res = await networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();

      const { firstValue, returnCode } = new ResultsParser().parseQueryResponse(res, endpointDefinition);

      if (returnCode && returnCode.isSuccess()) {
        firstValue.valueOf().forEach((item) => {
          result.push({
            amount: item.amount.toNumber(),
            date: item.date.toNumber() * 1000,
          });
        });

        return result;
      } else {
        const nonOKErr = new Error("getClaims returnCode returned a non OK value");
        console.error(nonOKErr);

        return { error: nonOKErr };
      }
    } catch (error) {
      console.error(error);

      return { error };
    }
  }

  async isClaimsContractPaused() {
    const interaction = this.contract.methods.isPaused();
    const query = interaction.buildQuery();
    let result = false;

    try {
      let networkProvider;
      if (this.chainID === "1") {
        networkProvider = new ProxyNetworkProvider("https://gateway.multiversx.com", { timeout: this.timeout });
      } else {
        networkProvider = new ProxyNetworkProvider("https://devnet-gateway.multiversx.com", {
          timeout: this.timeout,
        });
      }

      const res = await networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();

      const { firstValue, returnCode } = new ResultsParser().parseQueryResponse(res, endpointDefinition);

      if (returnCode && returnCode.isSuccess()) {
        result = firstValue.valueOf();

        return result;
      } else {
        const nonOKErr = new Error("isPaused returnCode returned a non OK value");
        console.error(nonOKErr);

        return false; // boundary case: treat err as not-paused, and let user proceed as it will fail in TX
      }
    } catch (error) {
      console.error(error);

      return false; // boundary case: as above...
    }
  }

  async sendClaimRewardsTransaction(sender, rewardType) {
    const claimTransaction = new Transaction({
      value: 0,
      data: TransactionPayload.contractCall().setFunction(new ContractFunction("claim")).addArg(new U64Value(rewardType)).build(),
      receiver: new Address(this.claimsContractAddress),
      sender: new Address(sender),
      gasLimit: 6000000,
      chainID: this.chainID,
    });

    await refreshAccount();

    const { sessionId, error } = await sendTransactions({
      transactions: claimTransaction,
      transactionsDisplayInfo: {
        processingMessage: "Claiming ITHEUM",
        errorMessage: "Claiming error",
        successMessage: "Claim tokens sent",
      },
      redirectAfterSign: false,
    });

    return { sessionId, error };
  }
}
