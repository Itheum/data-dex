import { ProxyNetworkProvider } from '@elrondnetwork/erdjs-network-providers/out';
import { AbiRegistry, SmartContractAbi, SmartContract, Address, ResultsParser, Transaction, TransactionPayload, ContractFunction, BigUIntValue, BytesValue } from '@elrondnetwork/erdjs/out';
import { refreshAccount, sendTransactions } from '@elrondnetwork/dapp-core';
import jsonData from './ABIs/datanftmint.abi.json';
import { contractsForChain } from 'libs/util';

export class DataNftMintContract {
  constructor(networkId) {
    this.timeout = 5000;
    this.dataNftMintContractAddress = contractsForChain(networkId).dataNftMint;
    this.chainID = 'D';

    if (networkId === 'E1') {
      this.networkProvider = new ProxyNetworkProvider('https://gateway.elrond.com', { timeout: this.timeout });
      this.chainID = '1';
    } else {
      this.networkProvider = new ProxyNetworkProvider('https://devnet-gateway.elrond.com', { timeout: this.timeout });
    }

    const json = JSON.parse(JSON.stringify(jsonData));
    const abiRegistry = AbiRegistry.create(json);
    const abi = new SmartContractAbi(abiRegistry, ['DataNftMintContract']);

    this.contract = new SmartContract({
      address: new Address(this.dataNftMintContractAddress),
      abi: abi,
    });
  }

  async sendMintTransaction({ name, media, data_marchal, data_stream, data_preview, royalties, amount }) {
    const mintTransaction = new Transaction({
      value: 0,
      data: TransactionPayload.contractCall()
        .setFunction(new ContractFunction('mint'))
        .addArg(new BytesValue(name))
        .addArg(new BytesValue(media))
        .addArg(new BytesValue(data_marchal))
        .addArg(new BytesValue(data_stream))
        .addArg(new BytesValue(data_preview))
        .addArg(new BigUIntValue(royalties))
        .addArg(new BigUIntValue(amount))
        .build(),
      receiver: new Address(this.dataNftMintContractAddress),
      gasLimit: 6000000,
      chainID: this.chainID
    });

    await refreshAccount();

    const { sessionId, error } = await sendTransactions({
      transactions: mintTransaction,
      transactionsDisplayInfo: {
        processingMessage: 'Minting Data NFT',
        errorMessage: 'Error occured during Data NFT minting',
        successMessage: 'Data NFT minted successfully',
      },
      redirectAfterSign: false,
    });

    return { sessionId, error };
  }
}
