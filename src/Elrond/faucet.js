import { ProxyNetworkProvider } from "@elrondnetwork/erdjs-network-providers/out";
import { AbiRegistry, SmartContractAbi, SmartContract, Address, ResultsParser, Transaction, TransactionPayload, ContractFunction, U64Value } from "@elrondnetwork/erdjs/out";
import { refreshAccount, sendTransactions } from "@elrondnetwork/dapp-core";
import jsonData from "./ABIs/devnetfaucet.abi.json";
import { faucetContractAddress_Elrond } from "../libs/contactAddresses.js";

export class FaucetContract {
  constructor(networkId) {
    if (networkId === "E1") {
      this.networkProvider = new ProxyNetworkProvider("https://gateway.elrond.com");
    } else {
      this.networkProvider = new ProxyNetworkProvider("https://devnet-gateway.elrond.com");
    }

    const json = JSON.parse(JSON.stringify(jsonData));
    const abiRegistry = AbiRegistry.create(json);
    const abi = new SmartContractAbi(abiRegistry, ["DevNetFaucet"]);

    this.contract = new SmartContract({
      address: new Address(faucetContractAddress_Elrond),
      abi: abi,
    });
  }

  async getFaucetTime(address) {
    const interaction = this.contract.methods.getLastFaucet([new Address(address)]);
    const query = interaction.buildQuery();

    const res = await this.networkProvider.queryContract(query);
    const endpointDefinition = interaction.getEndpoint();
    const { firstValue } = new ResultsParser().parseQueryResponse(res, endpointDefinition);

    return firstValue.valueOf().toNumber() * 1000
  }

  static async sendActivateFaucetTransaction() {
    const faucetTransaction = new Transaction({
      value: 0,
      data: TransactionPayload.contractCall()
        .setFunction(new ContractFunction("activateFaucet"))
        .build(),
      receiver: new Address(faucetContractAddress_Elrond),
      gasLimit: 20000000,
      chainID: "D",
    });

    await refreshAccount();

    const { sessionId, error } = await sendTransactions({
      transactions: faucetTransaction,
      transactionsDisplayInfo: {
        processingMessage: "Getting ITHEUM through faucet",
        errorMessage: "Error occured during ITHEUM claiming",
        successMessage: "ITHEUM claimed successfully",
      },
      redirectAfterSign: false,
    });

    return { sessionId, error };
  }
}
