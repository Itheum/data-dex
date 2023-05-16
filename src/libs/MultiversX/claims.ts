import {
  AbiRegistry,
  SmartContract,
  Address,
  ResultsParser,
  Transaction,
  ContractFunction,
  U64Value,
  ContractCallPayloadBuilder,
} from "@multiversx/sdk-core/out";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import { refreshAccount } from "@multiversx/sdk-dapp/utils/account";
import { contractsForChain } from 'libs/MultiversX';
import { NetworkIdType } from "libs/types";
import jsonData from "./ABIs/claims.abi.json";
import { getNetworkProvider } from "./api";

export class ClaimsContract {
  timeout: number;
  claimsContractAddress: string;
  chainID: string;
  contract: SmartContract;

  constructor(networkId: NetworkIdType) {
    this.timeout = 5000;
    this.claimsContractAddress = contractsForChain(networkId).claims;
    this.chainID = "D";

    if (networkId === "E1") {
      this.chainID = "1";
    } else {
      this.chainID = "D";
    }

    const json = JSON.parse(JSON.stringify(jsonData));
    const abiRegistry = AbiRegistry.create(json);

    this.contract = new SmartContract({
      address: new Address(this.claimsContractAddress),
      abi: abiRegistry,
    });
  }

  async getClaims(address: string) {
    const interaction = this.contract.methods.viewClaimWithDate([new Address(address)]);
    const query = interaction.buildQuery();
    const result: any[] = [];

    try {
      const networkProvider = getNetworkProvider(this.chainID);

      const res = await networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();

      const { firstValue, returnCode } = new ResultsParser().parseQueryResponse(res, endpointDefinition);

      if (returnCode && returnCode.isSuccess() && firstValue) {
        firstValue.valueOf().forEach((item: any) => {
          result.push({
            amount: item.amount.toNumber(),
            date: item.date.toNumber() * 1000,
          });
        });

        return {
          data: result,
          error: '',
        };
      } else {
        throw Error("getClaims returnCode returned a non OK value");
      }
    } catch (err) {
      console.error(err);

      return {
        data: undefined,
        error: (err as Error).message,
      };
    }
  }

  async isClaimsContractPaused() {
    const interaction = this.contract.methods.isPaused();
    const query = interaction.buildQuery();
    let result = false;

    try {
      const networkProvider = getNetworkProvider(this.chainID);

      const res = await networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();

      const { firstValue, returnCode } = new ResultsParser().parseQueryResponse(res, endpointDefinition);

      if (returnCode && returnCode.isSuccess() && firstValue) {
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

  async sendClaimRewardsTransaction(sender: string, rewardType: number) {
    const claimTransaction = new Transaction({
      value: 0,
      data: new ContractCallPayloadBuilder().setFunction(new ContractFunction("claim")).addArg(new U64Value(rewardType)).build(),
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
