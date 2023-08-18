import { AbiRegistry, SmartContract, Address, ResultsParser, Transaction, ContractFunction, ContractCallPayloadBuilder } from "@multiversx/sdk-core/out";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import { refreshAccount } from "@multiversx/sdk-dapp/utils/account";
import { contractsForChain } from "libs/MultiversX";
import { NetworkIdType } from "libs/types";
import jsonData from "./ABIs/devnetfaucet.abi.json";
import { getNetworkProvider } from "./api";

export class FaucetContract {
  timeout: number;
  claimsContractAddress: string;
  chainID: string;
  contract: SmartContract;

  constructor(networkId: NetworkIdType) {
    this.timeout = 5000;
    this.claimsContractAddress = contractsForChain(networkId).faucet;

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

  async getFaucetTime(address: string) {
    const networkProvider = getNetworkProvider("", this.chainID);

    const interaction = this.contract.methods.getLastFaucet([new Address(address)]);
    const query = interaction.buildQuery();
    const res = await networkProvider.queryContract(query);
    const endpointDefinition = interaction.getEndpoint();
    const { firstValue } = new ResultsParser().parseQueryResponse(res, endpointDefinition);

    return firstValue?.valueOf().toNumber() * 1000;
  }

  async sendActivateFaucetTransaction(address: string) {
    const faucetTransaction = new Transaction({
      value: 0,
      data: new ContractCallPayloadBuilder().setFunction(new ContractFunction("activateFaucet")).build(),
      receiver: new Address(this.claimsContractAddress),
      sender: new Address(address),
      gasLimit: 20000000,
      chainID: "D",
    });

    await refreshAccount();

    const { sessionId, error } = await sendTransactions({
      transactions: faucetTransaction,
      transactionsDisplayInfo: {
        processingMessage: "Getting faucet tokens",
        errorMessage: "Faucet error",
        successMessage: "Faucet tokens sent",
      },
      redirectAfterSign: false,
    });
    return { sessionId, error };
  }
}
