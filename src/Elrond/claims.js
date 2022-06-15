import { ProxyNetworkProvider } from "@elrondnetwork/erdjs-network-providers/out";
import { AbiRegistry, SmartContractAbi, SmartContract, Address, ResultsParser, BigUIntValue, VariadicValue, Transaction, TransactionPayload, ContractFunction } from "@elrondnetwork/erdjs/out";
import jsonData from "./ABIs/claims.abi.json";
import { mydaContractAddress_devnetElrond } from "../libs/contactAddresses";
export class ClaimsContract {
  constructor(networkId) {
    if (networkId === "E1") {
      this.networkProvider = new ProxyNetworkProvider("https://gateway.elrond.com");
    } else {
      this.networkProvider = new ProxyNetworkProvider("https://devnet-gateway.elrond.com");
    }
    const json = JSON.parse(JSON.stringify(jsonData));
    const abiRegistry = AbiRegistry.create(json);
    const abi = new SmartContractAbi(abiRegistry, ["ClaimsContract"]);
    this.contract = new SmartContract({
      address: new Address(mydaContractAddress_devnetElrond),
      abi: abi,
    });
  }

  async getClaims(address) {
    const interaction = this.contract.methods.viewClaimWithDate([new Address(address)]);
    const query = interaction.buildQuery();
    let result = [];
    const res = await this.networkProvider.queryContract(query);
    const endpointDefinition = interaction.getEndpoint();
    const { firstValue, secondValue, returnCode } = new ResultsParser().parseQueryResponse(res, endpointDefinition);
    firstValue.valueOf().forEach((item, index) => {
      result.push({
        amount: item.amount.toNumber(),
        date: item.date.toNumber() * 1000,
      });
    });
    console.log(result);
    return result;
  }
}
