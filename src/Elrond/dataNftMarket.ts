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
import { refreshAccount } from '@elrondnetwork/dapp-core/utils/account';
import { sendTransactions } from '@elrondnetwork/dapp-core/services';
import jsonData from './ABIs/data_market.abi.json';
import { contractsForChain } from '../libs/util';

export class DataNftMarketContract {
  timeout: number;
  dataNftMarketContractAddress: any;
  chainID: string;
  networkProvider: ProxyNetworkProvider;
  contract: SmartContract;
    constructor(networkId: string) {
      this.timeout = 5000;
      this.dataNftMarketContractAddress = contractsForChain(networkId).market;
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
        address: new Address(this.dataNftMarketContractAddress),
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
  
    async sendAcceptOfferEsdtTransaction(index:number,price:number,tokenId:string,amount:number, sender: string) {
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
            receiver: new Address(this.dataNftMarketContractAddress),
            sender: new Address(sender),
            gasLimit: 12000000,
            chainID: 'D'
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
              .addArg(new AddressValue(new Address(this.dataNftMarketContractAddress)))
              .addArg(new StringValue('acceptOffer'))
              .addArg(new U64Value(index))
              .addArg(new BigUIntValue(amount))
              .build(),
            receiver: new Address(senderAddress),
            sender: new Address(senderAddress),
            gasLimit: 12000000,
            chainID: 'D'
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

      async sendAcceptOfferEgldTransaction(index:number,price:number,amount:number,senderAddress:string) {
        const offerEgldTx = new Transaction({
            value: TokenPayment.egldFromBigInteger(price * amount),
            data: TransactionPayload.contractCall()
              .setFunction(new ContractFunction('acceptOffer'))
              .addArg(new U64Value(index))
              .addArg(new BigUIntValue(amount))
              .build(),
            receiver: new Address(this.dataNftMarketContractAddress),
            gasLimit: 12000000,
            sender: new Address(senderAddress),
            chainID: 'D'
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

      async sendCancelOfferTransaction(index:number,senderAddress:string) {
        const cancelTx = new Transaction({
            value: 0,
            data: TransactionPayload.contractCall()
              .setFunction(new ContractFunction('cancelOffer'))
              .addArg(new U64Value(index))
              .build(),
            receiver: new Address(this.dataNftMarketContractAddress),
            gasLimit: 12000000,
            sender: new Address(senderAddress),
            chainID: 'D'
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

      async addToMarket(addTokenCollection: string, addTokenNonce: number,addTokenQuantity: number, price: number, addressOfSender: string) {
            const askDenominator = 10 ** 18;
            const addERewTx = new Transaction({
              value: 0,
              data: TransactionPayload.contractCall()
                .setFunction(new ContractFunction('ESDTNFTTransfer')) //method
                .addArg(new TokenIdentifierValue(addTokenCollection)) //what token id to send
                .addArg(new U64Value(addTokenNonce)) //what token nonce to send
                .addArg(new BigUIntValue(addTokenQuantity)) //how many tokens to send
                .addArg(new AddressValue(new Address(this.dataNftMarketContractAddress))) //address to send to
                .addArg(new StringValue('addOffer')) //what method to call on the contract
                .addArg(new TokenIdentifierValue('ITHEUM-a61317')) //what token id to ask for
                .addArg(new U64Value(0)) //what nonce to ask for
                .addArg(new BigUIntValue(price*10**18)) //how much to ask for
                .addArg(new BigUIntValue(addTokenQuantity)) //how many times to divide the amount of tokens sent into
                .build(),
              receiver: new Address(addressOfSender),
              sender: new Address(addressOfSender),
              gasLimit: 12000000,
              chainID: 'D'
            });
            await refreshAccount();
            await sendTransactions({
              transactions: addERewTx,
              transactionsDisplayInfo: {
                processingMessage: 'Adding Data NFT to marketplace',
                errorMessage: 'Error occured',
                successMessage: 'Data NFT added to marketplace'
              },
              redirectAfterSign: false
            });
          }
}