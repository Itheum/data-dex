const contractsMode = "dev"; // will support dev | staging | prod

const contracts = {
  matic: {
    dev: {
      itheumTokenContractAddress: "0x91ff16CDfeF176b1576E640422C5BA281A242400",
      ddexContractAddress: "0xBDdb6B94d9B60Ac1D788676a287e8c474D68D44A",
      dNFTContractAddress: "0xD01A4bCeD9324034db6cb03E50b76F58496F5FB8",
      claimsContractAddress: "0x985A5c96663C9c44d46Ea061f4b7E50118180F8d",
    },
  },
  ethereum: {
    dev: {
      ropsten: {
        itheumTokenContractAddress: "0xBDdb6B94d9B60Ac1D788676a287e8c474D68D44A",
        ddexContractAddress: "0xD01A4bCeD9324034db6cb03E50b76F58496F5FB8",
        dNFTContractAddress: "0x985A5c96663C9c44d46Ea061f4b7E50118180F8d",
        claimsContractAddress: "0x159ea49EbF5DCd06efFce53b1fe851e9c2CCFd91",
      },
      rinkeby: {
        itheumTokenContractAddress: "0xb38731CEC66340ff1c9F58B8ceCDEdb9B4Cb8f38",
        ddexContractAddress: "0xaC0Dee3dd39e27470A8992aC9C94B09385C2f2A5",
        dNFTContractAddress: "0xD77E137B6483bC8d392b73D02E733e3DE13Dd72d",
        claimsContractAddress: "",
      },
    },
  },
  bsc: {
    dev: {
      itheumTokenContractAddress: "0x91ff16CDfeF176b1576E640422C5BA281A242400",
      ddexContractAddress: "0xBDdb6B94d9B60Ac1D788676a287e8c474D68D44A",
      dNFTContractAddress: "0xD01A4bCeD9324034db6cb03E50b76F58496F5FB8",
      claimsContractAddress: "0x985A5c96663C9c44d46Ea061f4b7E50118180F8d",
    },
  },
  elrond: {
    devnet: {
      itheumTokenContractAddress: "ITHEUM-a61317",
      claimsContractAddress: "erd1qqqqqqqqqqqqqpgqms979krpfug4r8p39d0j9p74g95r749afsxspcay83",
      faucetContractAddress: "erd1qqqqqqqqqqqqqpgqggj9d0fcvmuyatkgxvgd2akxsuv2h83t7yqs0n5wuf",
    },
    mainnet: {
      itheumTokenContractAddress: "ITHEUM-df6f26",
      claimsContractAddress: "",
      faucetContractAddress: "",
    },
  },
};

// Matic Polygon Contracts
export const tokenContractAddress_Matic = contracts.matic[contractsMode].itheumTokenContractAddress;
export const ddexContractAddress_Matic = contracts.matic[contractsMode].ddexContractAddress;
export const dNFTContractAddress_Matic = contracts.matic[contractsMode].dNFTContractAddress;
export const claimsContractAddress_Matic = contracts.matic[contractsMode].claimsContractAddress;

// Ethereum Contracts
export const tokenContractAddress_Rop = contracts.ethereum[contractsMode].ropsten.itheumTokenContractAddress;
export const ddexContractAddress_Rop = contracts.ethereum[contractsMode].ropsten.ddexContractAddress;
export const dNFTContractAddress_Rop = contracts.ethereum[contractsMode].ropsten.dNFTContractAddress;
export const claimsContractAddress_Rop = contracts.ethereum[contractsMode].ropsten.claimsContractAddress;

export const tokenContractAddress_Rink = contracts.ethereum[contractsMode].rinkeby.itheumTokenContractAddress;
export const ddexContractAddress_Rink = contracts.ethereum[contractsMode].rinkeby.itheumTokenContractAddress;
export const dNFTContractAddress_Rink = contracts.ethereum[contractsMode].rinkeby.itheumTokenContractAddress;

// BSC contracts
export const tokenContractAddress_testnetBSC = contracts.bsc[contractsMode].itheumTokenContractAddress;
export const ddexContractAddress_testnetBSC = contracts.bsc[contractsMode].ddexContractAddress;
export const dNFTContractAddress_testnetBSC = contracts.bsc[contractsMode].dNFTContractAddress;
export const claimsContractAddress_testnetBSC = contracts.bsc[contractsMode].claimsContractAddress;

// Elrond contracts
export const tokenContractAddress_Elrond_Devnet = contracts.elrond['devnet'].itheumTokenContractAddress;
export const claimsContractAddress_Elrond_Devnet = contracts.elrond['devnet'].claimsContractAddress;
export const faucetContractAddress_Elrond_Devnet = contracts.elrond['devnet'].faucetContractAddress;
export const tokenContractAddress_Elrond_Mainnet = contracts.elrond['mainnet'].itheumTokenContractAddress;
export const claimsContractAddress_Elrond_Mainnet = contracts.elrond['mainnet'].claimsContractAddress;
export const faucetContractAddress_Elrond_Mainnet = contracts.elrond['mainnet'].faucetContractAddress;

// OTHER CHAIN CONTRACTS
export const tokenContractAddress_testnetHarmony = "0xcbEAF3BDe82155F56486Fb5a1072cb8baAf547cc";
export const tokenContractAddress_testnetPlatON = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const tokenContractAddress_testnetParastate = "0xD77E137B6483bC8d392b73D02E733e3DE13Dd72d";
export const tokenContractAddress_testnetAvalanche = "0x2982563dAf8Eeb43Cec78bf4E1A8614BD56CD1e3";

export const ddexContractAddress_testnetHarmony = "0x1429859428C0aBc9C2C47C8Ee9FBaf82cFA0F20f";
export const ddexContractAddress_testnetPlatON = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
export const ddexContractAddress_testnetParastate = "0x1bd7fa41A509d016053eb6C67165d632321a20A9";
export const ddexContractAddress_testnetAvalanche = "0x56c88e7ed9Aa4792119c66D71815A6bD9DE0A5E0";

export const dNFTContractAddress_testnetHarmony = "0xB0D4afd8879eD9F52b28595d31B441D079B2Ca07";
export const dNFTContractAddress_testnetPlatON = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
export const dNFTContractAddress_testnetParastate = "0x360570F7D60Df8BC670C2899002C44a2C382270E";
export const dNFTContractAddress_testnetAvalanche = "0xCb0254502D84242f8ad477eb41723e99fdC6e847";

export const tokenContractAddress_Local = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
export const ddexContractAddress_Local = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
export const dNFTContractAddress_Local = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

export const claimsContractAddress_testnetAvalanche = "0xb38731CEC66340ff1c9F58B8ceCDEdb9B4Cb8f38";
