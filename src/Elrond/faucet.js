import { ProxyNetworkProvider } from '@multiversx/sdk-network-providers/out';
import { AbiRegistry, SmartContractAbi, SmartContract, Address, ResultsParser, Transaction, TransactionPayload, ContractFunction } from '@multiversx/sdk-core/out';
import { refreshAccount } from '@multiversx/sdk-dapp/utils/account';
import { sendTransactions } from '@multiversx/sdk-dapp/services';
import jsonData from './ABIs/devnetfaucet.abi.json';
import { contractsForChain } from 'libs/util';

export class FaucetContract {
  constructor(networkId) {
    this.timeout = 5000;
    this.claimsContractAddress = contractsForChain(networkId).faucet;

    if (networkId === 'E1') {
      throw new Error('Faucet not available on MultiversX mainnet');
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

  async sendActivateFaucetTransaction(address) {
    const faucetTransaction = new Transaction({
      value: 0,
      data: TransactionPayload.contractCall()
        .setFunction(new ContractFunction('activateFaucet'))
        .build(),
      receiver: new Address(this.claimsContractAddress),
      sender: new Address(address),
      gasLimit: 20000000,
      chainID: 'D',
    });

    await refreshAccount();

    const { sessionId, error } = await sendTransactions({
      transactions: faucetTransaction,
      transactionsDisplayInfo: {
        processingMessage: 'Getting faucet tokens',
        errorMessage: 'Faucet error',
        successMessage: 'Faucet tokens sent',
      },
      redirectAfterSign: false,
    });

    return { sessionId, error };
  }
}
