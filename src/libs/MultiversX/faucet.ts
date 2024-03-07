import { AbiRegistry, SmartContract, ResultsParser, Transaction, ContractFunction, ContractCallPayloadBuilder, IAddress } from "@multiversx/sdk-core/out";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import { refreshAccount } from "@multiversx/sdk-dapp/utils/account";
import { contractsForChain } from "libs/MultiversX";
import jsonData from "./ABIs/devnetfaucet.abi.json";
import { getNetworkProvider } from "./api";

export class FaucetContract {
  timeout: number;
  claimsContractAddress: IAddress;
  chainID: string;
  contract: SmartContract;

  constructor(chainID: string) {
    this.timeout = 5000;
    this.claimsContractAddress = contractsForChain(chainID).faucet;
    this.chainID = chainID;

    const json = JSON.parse(JSON.stringify(jsonData));
    const abiRegistry = AbiRegistry.create(json);

    this.contract = new SmartContract({
      address: this.claimsContractAddress,
      abi: abiRegistry,
    });
  }

  async getFaucetTime(address: IAddress) {
    const networkProvider = getNetworkProvider(this.chainID);

    const interaction = this.contract.methods.getLastFaucet([address]);
    const query = interaction.buildQuery();
    const res = await networkProvider.queryContract(query);
    const endpointDefinition = interaction.getEndpoint();
    const { firstValue } = new ResultsParser().parseQueryResponse(res, endpointDefinition);

    return firstValue?.valueOf().toNumber() * 1000;
  }

  async sendActivateFaucetTransaction(address: IAddress) {
    const faucetTransaction = new Transaction({
      value: 0,
      data: new ContractCallPayloadBuilder().setFunction(new ContractFunction("activateFaucet")).build(),
      receiver: this.claimsContractAddress,
      sender: address,
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
