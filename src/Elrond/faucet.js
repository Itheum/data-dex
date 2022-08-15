import { ProxyNetworkProvider } from '@elrondnetwork/erdjs-network-providers/out';
import { AbiRegistry, SmartContractAbi, SmartContract, Address, ResultsParser, Transaction, TransactionPayload, ContractFunction, U64Value } from '@elrondnetwork/erdjs/out';
import { refreshAccount, sendTransactions } from '@elrondnetwork/dapp-core';
import jsonData from './ABIs/devnetfaucet.abi.json';
import { contractsForChain } from 'libs/util';

export class FaucetContract {
  constructor(networkId) {
    this.timeout = 5000;
    this.claimsContractAddress = contractsForChain(networkId).faucet;

    if (networkId === 'E1') {
      throw new Error('Faucet not available on Elrond mainnet');
    } else {
      this.networkProvider = new ProxyNetworkProvider('https://devnet-gateway.elrond.com', { timeout: this.timeout });
    }

    const json = JSON.parse(JSON.stringify(jsonData));
    const abiRegistry = AbiRegistry.create(json);
    const abi = new SmartContractAbi(abiRegistry, ['DevNetFaucet']);

    this.contract = new SmartContract({
      address: new Address(this.claimsContractAddress),
      abi: abi,
    });
  }

  async getFaucetTime(address) {
    const interaction = this.contract.methods.getLastFaucet([new Address(address)]);
    const query = interaction.buildQuery();
    const res = await this.networkProvider.queryContract(query);
    const endpointDefinition = interaction.getEndpoint();
    const { firstValue } = new ResultsParser().parseQueryResponse(res, endpointDefinition);

    return firstValue.valueOf().toNumber() * 1000;
  }

  async sendActivateFaucetTransaction() {
    const faucetTransaction = new Transaction({
      value: 0,
      data: TransactionPayload.contractCall()
        .setFunction(new ContractFunction('activateFaucet'))
        .build(),
      receiver: new Address(this.claimsContractAddress),
      gasLimit: 20000000,
      chainID: 'D',
    });

    await refreshAccount();

    const { sessionId, error } = await sendTransactions({
      transactions: faucetTransaction,
      transactionsDisplayInfo: {
        processingMessage: 'Getting ITHEUM through faucet',
        errorMessage: 'Error occured during ITHEUM claiming',
        successMessage: 'ITHEUM claimed successfully',
      },
      redirectAfterSign: false,
    });

    return { sessionId, error };
  }
}
