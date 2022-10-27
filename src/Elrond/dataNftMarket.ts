import { ProxyNetworkProvider } from '@elrondnetwork/erdjs-network-providers/out';
import {
    AbiRegistry,
    SmartContractAbi,
    SmartContract,
    Address,
    ResultsParser,
    BigUIntValue,
    VariadicValue,
    Transaction,
    TransactionPayload,
    ContractFunction,
    List,
    U64Value,
    TokenPayment,
    TokenIdentifierValue,
    AddressValue,
    StringValue,
    TypedValue,
    U32Value
  } from '@elrondnetwork/erdjs/out';
import { refreshAccount, sendTransactions } from '@elrondnetwork/dapp-core';
import jsonData from './ABIs/data_market.abi.json';
import { contractsForChain } from '../libs/util';

export class DataNftMarketContract {
  timeout: number;
  dataNftMintContractAddress: any;
  chainID: string;
  networkProvider: ProxyNetworkProvider;
  contract: SmartContract;
    constructor(networkId: string) {
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

    async getNumberOfOffers() {
        const interaction = this.contract.methods.numberOfOffers([]);
        const query = interaction.buildQuery();
    
        try {
          const res = await this.networkProvider.queryContract(query);
          const endpointDefinition = interaction.getEndpoint();
    
          const { firstValue, secondValue, returnCode } = new ResultsParser().parseQueryResponse(res, endpointDefinition);
    
          if (returnCode && returnCode.isSuccess()) {
            const firstValueAsStruct = firstValue as U32Value;
            return firstValueAsStruct.valueOf().toNumber()
          } else {
            const nonOKErr = new Error('getNumberOfOffers returnCode returned a non OK value');
            console.error(nonOKErr);
            
            return { error: nonOKErr };
          }
        } catch (error) {
          console.error(error);
    
          return { error };
        }
      }

    async getOffers(startIndex:number,stopIndex:number) {
        const interaction = this.contract.methods.viewOffers([startIndex,stopIndex]);
        const query = interaction.buildQuery();
    
        try {
          const res = await this.networkProvider.queryContract(query);
          const endpointDefinition = interaction.getEndpoint();
    
          const { firstValue, secondValue, returnCode } = new ResultsParser().parseQueryResponse(res, endpointDefinition);
    
          if (returnCode && returnCode.isSuccess()) {
            const firstValueAsStruct = firstValue as List;
            const tempTokens: {
            index: number;
            owner: Address;
            quantity: number;
            have: { identifier: string; nonce: number; amount: number };
            want: { identifier: string; nonce: number; amount: number };
        }[] = [];
        firstValueAsStruct.valueOf().forEach((token: any) => {
          const parsedToken = {
            index: token['index'].toNumber(),
            owner: token['owner'],
            have: {
              identifier: token['offered_token_identifier'],
              nonce: token['offered_token_nonce'].toNumber(),
              amount: token['offered_token_amount'].toNumber()
            },
            want: {
              identifier: token['wanted_token_identifier'],
              nonce: token['wanted_token_nonce'].toNumber(),
              amount: token['wanted_token_amount'].toNumber()
            },
            quantity: token['quantity'].toNumber()
          };
          tempTokens.push(parsedToken);
        });
        return tempTokens;
          } else {
            const nonOKErr = new Error('getOffers returnCode returned a non OK value');
            console.error(nonOKErr);
            
            return { error: nonOKErr };
          }
        } catch (error) {
          console.error(error);
    
          return { error };
        }
      }
  
    async sendAcceptOfferEsdtTransaction(index:number,price:number,tokenId:string,amount:number) {
        const offerEsdtTx = new Transaction({
            value: 0,
            data: TransactionPayload.contractCall()
              .setFunction(new ContractFunction('ESDTTransfer'))
              .addArg(new TokenIdentifierValue(tokenId))
              .addArg(new BigUIntValue(price * amount))
              .addArg(new StringValue('acceptOffer'))
              .addArg(new U64Value(index))
              .addArg(new BigUIntValue(amount))
              .build(),
            receiver: new Address(this.dataNftMintContractAddress),
            gasLimit: 12000000,
            chainID: '1'
          });
    
        await refreshAccount();
    
        const { sessionId, error } = await sendTransactions({
            transactions: offerEsdtTx,
            transactionsDisplayInfo: {
              processingMessage: 'Accepting offer',
              errorMessage: 'Error occured during accepting offer',
              successMessage: 'Offer accepted successfuly'
            },
            redirectAfterSign: false
          });
    
        return { sessionId, error };
      }

      async sendAcceptOfferNftEsdtTransaction(index:number,price:number,tokenId:string,nonce:number,amount:number,senderAddress:string) {
        const offerEsdtTx = new Transaction({
            value: 0,
            data: TransactionPayload.contractCall()
              .setFunction(new ContractFunction('ESDTNFTTransfer'))
              .addArg(new TokenIdentifierValue(tokenId))
              .addArg(new U64Value(nonce))
              .addArg(new BigUIntValue(price * amount))
              .addArg(new AddressValue(new Address(this.dataNftMintContractAddress)))
              .addArg(new StringValue('acceptOffer'))
              .addArg(new U64Value(index))
              .addArg(new BigUIntValue(amount))
              .build(),
            receiver: new Address(senderAddress),
            gasLimit: 12000000,
            chainID: '1'
          });
    
        await refreshAccount();
    
        const { sessionId, error } = await sendTransactions({
            transactions: offerEsdtTx,
            transactionsDisplayInfo: {
              processingMessage: 'Accepting offer',
              errorMessage: 'Error occured during accepting offer',
              successMessage: 'Offer accepted successfuly'
            },
            redirectAfterSign: false
          });
    
        return { sessionId, error };
      }

      async sendAcceptOfferEgldTransaction(index:number,price:number,amount:number) {
        const offerEgldTx = new Transaction({
            value: TokenPayment.egldFromBigInteger(price * amount),
            data: TransactionPayload.contractCall()
              .setFunction(new ContractFunction('acceptOffer'))
              .addArg(new U64Value(index))
              .addArg(new BigUIntValue(amount))
              .build(),
            receiver: new Address(this.dataNftMintContractAddress),
            gasLimit: 12000000,
            chainID: '1'
          });
    
        await refreshAccount();
    
        const { sessionId, error } = await sendTransactions({
            transactions: offerEgldTx,
            transactionsDisplayInfo: {
              processingMessage: 'Accepting offer',
              errorMessage: 'Error occured during accepting offer',
              successMessage: 'Offer accepted successfuly'
            },
            redirectAfterSign: false
          });
    
        return { sessionId, error };
      }

      async sendCancelOfferTransaction(index:number) {
        const cancelTx = new Transaction({
            value: 0,
            data: TransactionPayload.contractCall()
              .setFunction(new ContractFunction('cancelOffer'))
              .addArg(new U64Value(index))
              .build(),
            receiver: new Address(this.dataNftMintContractAddress),
            gasLimit: 12000000,
            chainID: '1'
          });
    
        await refreshAccount();
    
        const { sessionId, error } = await sendTransactions({
            transactions: cancelTx,
            transactionsDisplayInfo: {
              processingMessage: 'Cancelling offer',
              errorMessage: 'Error occured during offer cancellation',
              successMessage: 'Offer cancelled successfuly'
            },
            redirectAfterSign: false
          });
    
        return { sessionId, error };
      }
  }