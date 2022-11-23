import { ProxyNetworkProvider } from '@elrondnetwork/erdjs-network-providers/out';
import { AbiRegistry, SmartContractAbi, SmartContract, Address, ResultsParser, Transaction, TransactionPayload, ContractFunction, U64Value } from '@elrondnetwork/erdjs/out';
import { refreshAccount } from '@elrondnetwork/dapp-core/utils/account';
import { sendTransactions } from '@elrondnetwork/dapp-core/services';
import jsonData from './ABIs/claims.abi.json';
import { contractsForChain } from 'libs/util';

export class ClaimsContract {  
  constructor(networkId) {
    this.timeout = 5000;
    this.claimsContractAddress = contractsForChain(networkId).claims;
    this.chainID = 'D';

    if (networkId === 'E1') {
      this.networkProvider = new ProxyNetworkProvider('https://gateway.elrond.com', { timeout: this.timeout });
      this.chainID = '1';
    } else {
      this.networkProvider = new ProxyNetworkProvider('https://devnet-gateway.elrond.com', { timeout: this.timeout });
    }

    const json = JSON.parse(JSON.stringify(jsonData));
    const abiRegistry = AbiRegistry.create(json);
    const abi = new SmartContractAbi(abiRegistry, ['ClaimsContract']);

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
      const res = await this.networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();

      const { firstValue, secondValue, returnCode } = new ResultsParser().parseQueryResponse(res, endpointDefinition);

      if (returnCode && returnCode.isSuccess()) {
        firstValue.valueOf().forEach((item, index) => {
          result.push({
            amount: item.amount.toNumber(),
            date: item.date.toNumber() * 1000,
          });
        });

        return result;
      } else {
        const nonOKErr = new Error('getClaims returnCode returned a non OK value');
        console.error(nonOKErr);
        
        return { error: nonOKErr };
      }
    } catch (error) {
      console.error(error);

      return { error };
    }
  }

  async sendClaimRewardsTransaction(sender, rewardType) {
    const claimTransaction = new Transaction({
      value: 0,
      data: TransactionPayload.contractCall()
        .setFunction(new ContractFunction('claim'))
        .addArg(new U64Value(rewardType))
        .build(),
      receiver: new Address(this.claimsContractAddress),
      sender: new Address(sender),
      gasLimit: 6000000,
      chainID: this.chainID
    });

    await refreshAccount();

    const { sessionId, error } = await sendTransactions({
      transactions: claimTransaction,
      transactionsDisplayInfo: {
        processingMessage: 'Claiming ITHEUM',
        errorMessage: 'Error occured during ITHEUM claiming',
        successMessage: 'ITHEUM claimed successfully',
      },
      redirectAfterSign: false,
    });

    return { sessionId, error };
  }
}
