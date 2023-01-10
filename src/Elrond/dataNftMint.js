import { ProxyNetworkProvider } from '@elrondnetwork/erdjs-network-providers/out';
import { AbiRegistry, SmartContractAbi, SmartContract, Address, ResultsParser, Transaction, TransactionPayload, ContractFunction, BigUIntValue, BytesValue, StringValue, TokenPayment, ArgSerializer, TokenIdentifierValue, U64Value, AddressValue } from '@elrondnetwork/erdjs/out';
import { refreshAccount } from '@elrondnetwork/dapp-core/utils/account';
import { sendTransactions } from '@elrondnetwork/dapp-core/services';
import jsonData from './ABIs/datanftmint.abi.json';
import { contractsForChain, convertEsdtToWei } from 'libs/util';

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

  async sendMintTransaction({
    name,
    media,
    data_marchal,
    data_stream,
    data_preview,
    royalties,
    amount,
    title,
    description,
    sender,
    itheumToken,
    antiSpamTax,
  }) {
    const data = antiSpamTax > 0 ? TransactionPayload.contractCall()
      .setFunction(new ContractFunction('ESDTTransfer'))
      .addArg(new StringValue(itheumToken))
      .addArg(new BigUIntValue(convertEsdtToWei(antiSpamTax)))
      .addArg(new StringValue('mint'))
      .addArg(new StringValue(name))
      .addArg(new StringValue(media))
      .addArg(new StringValue(data_marchal))
      .addArg(new StringValue(data_stream))
      .addArg(new StringValue(data_preview))
      .addArg(new BigUIntValue(royalties))
      .addArg(new BigUIntValue(amount))
      .addArg(new StringValue(title))
      .addArg(new StringValue(description))
      .build()
      // no fee
      : TransactionPayload.contractCall()
      .setFunction(new ContractFunction('mint'))
      .addArg(new StringValue(name))
      .addArg(new StringValue(media))
      .addArg(new StringValue(data_marchal))
      .addArg(new StringValue(data_stream))
      .addArg(new StringValue(data_preview))
      .addArg(new BigUIntValue(royalties))
      .addArg(new BigUIntValue(amount))
      .addArg(new StringValue(title))
      .addArg(new StringValue(description))
      .build();

    const mintTransaction = new Transaction({
      data,
      sender: new Address(sender),
      receiver: new Address(this.dataNftMintContractAddress),
      gasLimit: 60000000,
      chainID: this.chainID,
    });

    await refreshAccount();

    const { sessionId, error } = await sendTransactions({
      transactions: mintTransaction,
      transactionsDisplayInfo: {
        processingMessage: 'Minting Data NFT',
        errorMessage: 'Data NFT minting error',
        successMessage: 'Data NFT minted successfully',
      },
      redirectAfterSign: false,
    });

    return { sessionId, error };
  }

  async burnDataNft(sender, collection, nonce, quantity) {
    const tx = new Transaction({
      value: 0,
      data: TransactionPayload.contractCall()
        .setFunction(new ContractFunction('ESDTNFTTransfer')) //method
        .addArg(new TokenIdentifierValue(collection)) //what token id to send
        .addArg(new U64Value(nonce)) //what token nonce to send
        .addArg(new BigUIntValue(quantity)) //how many tokens to send
        .addArg(new AddressValue(new Address(this.dataNftMintContractAddress))) //address to send to
        .addArg(new StringValue('burn')) //what method to call on the contract
        .build(),
      receiver: new Address(sender),
      sender: new Address(sender),
      gasLimit: 12_000_000,
      chainID: 'D'
    });
    await refreshAccount();
    await sendTransactions({
      transactions: tx,
      transactionsDisplayInfo: {
        processingMessage: 'Burning Data NFT',
        errorMessage: 'Error occured',
        successMessage: 'Data NFT burnt'
      },
      redirectAfterSign: false
    });
  }

  async getUserDataOut(address, spamTaxTokenId) {
    const interaction = this.contract.methods.getUserDataOut([new Address(address), spamTaxTokenId]);
    const query = interaction.buildQuery();
    const result = [];

    try {
      const res = await this.networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();

      const { firstValue, secondValue, returnCode } = new ResultsParser().parseQueryResponse(res, endpointDefinition);

      if (returnCode && returnCode.isSuccess()) {
        const userData = firstValue.valueOf();
        const returnData = {
          'anitSpamTaxValue': userData.anti_spam_tax_value.toNumber(),
          'addressFrozen': userData.frozen,
          'frozenNonces': userData.frozen_nonces,
          'contractPaused': userData.is_paused,
          'userWhitelistedForMint': userData.is_whitelisted,
          'lastUserMintTime': userData.last_mint_time*1000,
          'maxRoyalties': userData.max_royalties.toNumber(),
          'maxSupply': userData.max_supply.toNumber(),
          'minRoyalties': userData.min_royalties.toNumber(),
          'mintTimeLimit': userData.mint_time_limit*1000,
          'numberOfMintsForUser': userData.minted_per_user.toNumber(),
          'totalNumberOfMints': userData.total_minted.toNumber(),
          'contractWhitelistEnabled': userData.whitelist_enabled,
        }

        return returnData;
      } else {
        const nonOKErr = new Error('getUserDataOut returnCode returned a non OK value');
        console.error(nonOKErr);
        
        return { error: nonOKErr };
      }
    } catch (error) {
      console.error(error);

      return { error };
    }
  }

}
