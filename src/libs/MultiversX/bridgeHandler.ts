import {
  BigUIntValue,
  StringValue,
  AbiRegistry,
  SmartContract,
  ResultsParser,
  Transaction,
  ContractFunction,
  ContractCallPayloadBuilder,
  IAddress,
} from "@multiversx/sdk-core/out";

import { sendTransactions } from "@multiversx/sdk-dapp/services";
import { refreshAccount } from "@multiversx/sdk-dapp/utils/account";
import { contractsForChain } from "libs/MultiversX";
import jsonData from "./ABIs/bridge_handler.abi.json";
import { getNetworkProvider } from "./api";
import { Address, TypedValue } from "@multiversx/sdk-core/out";
import { convertEsdtToWei } from "libs/utils";

export class BridgeHandlerContract {
  timeout: number;
  bridgeHandlerContractAddress: IAddress;
  chainID: string;
  contract: SmartContract;

  constructor(chainID: string) {
    this.timeout = 5000;
    this.bridgeHandlerContractAddress = contractsForChain(chainID).bridgeHandler;
    this.chainID = chainID;

    const json = JSON.parse(JSON.stringify(jsonData));
    const abiRegistry = AbiRegistry.create(json);

    this.contract = new SmartContract({
      address: this.bridgeHandlerContractAddress,
      abi: abiRegistry,
    });
  }

  async getAdminAddress() {
    const networkProvider = getNetworkProvider(this.chainID);
    const interaction = this.contract.methods.viewAdminAddress();
    const query = interaction.buildQuery();
    const res = await networkProvider.queryContract(query);
    const endpointDefinition = interaction.getEndpoint();
    const { firstValue } = new ResultsParser().parseQueryResponse(res, endpointDefinition);

    return firstValue;
  }

  async getIsPaused(): Promise<boolean> {
    try {
      const networkProvider = getNetworkProvider(this.chainID);
      const interaction = this.contract.methods.getIsPaused();
      const query = interaction.buildQuery();
      const res = await networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();
      const { firstValue } = new ResultsParser().parseQueryResponse(res, endpointDefinition);

      console.log("a", firstValue);

      return Boolean(firstValue?.valueOf());
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async sendLockTransaction({
    recipient,
    sender,
    itheumToken,
    antiSpamTax,
    contractAddress = this.bridgeHandlerContractAddress,
  }: {
    recipient: string;
    sender: string;
    itheumToken: string;
    antiSpamTax: number;
    contractAddress?: IAddress;
  }) {
    const data = new ContractCallPayloadBuilder()
      .setFunction(new ContractFunction("ESDTTransfer"))
      .addArg(new StringValue(itheumToken))
      .addArg(new BigUIntValue(convertEsdtToWei(antiSpamTax)))
      .addArg(new StringValue("lock"))
      .addArg(new StringValue(recipient))
      .build();

    const mintTransaction = new Transaction({
      data,
      sender: new Address(sender),
      receiver: contractAddress,
      gasLimit: 60000000,
      chainID: this.chainID,
    });

    await refreshAccount();

    const { sessionId, error } = await sendTransactions({
      transactions: mintTransaction,
      transactionsDisplayInfo: {
        processingMessage: "Depositing tokens...",
        errorMessage: "Bridge deposit failed :(",
        successMessage: "Deposit completed successfully!",
      },
      redirectAfterSign: false,
    });

    return { sessionId, error };
  }
}
