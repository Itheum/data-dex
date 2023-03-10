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
      goerli: {
        itheumTokenContractAddress: "0xaC9e9eA0d85641Fa176583215447C81eBB5eD7b3",
        ddexContractAddress: "0x3be0986AE40de157FAEcfcE3F65b3990b54a5ccb",
        dNFTContractAddress: "0xd742350dC29171670847Ba68858CC5865d1eC245",
        claimsContractAddress: "0x14f008d74C42055334A21BFAA7231b4f57E4EFa5",
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
  mx: {
    devnet: {
      itheumTokenContractAddress: "ITHEUM-a61317",
      dataNFTFTTicker: "DATANFTFT2-71ac28",
      claimsContractAddress: "erd1qqqqqqqqqqqqqpgqd8vswwygp8sgmm6rd2x4rfgxjvv4fa93fsxsks7y6q",
      faucetContractAddress: "erd1qqqqqqqqqqqqqpgqggj9d0fcvmuyatkgxvgd2akxsuv2h83t7yqs0n5wuf",
      dataNftMintContractAddress: "erd1qqqqqqqqqqqqqpgq6s9e6ywux0xl36mg39lk48mj7m6tzy5qfsxsfq0xne",
      dataNftMarketContractAddress: "erd1qqqqqqqqqqqqqpgqca3crd27vj8cruuxzkkma548fy8q69hxfsxsw2wxwy",
    },
    mainnet: {
      itheumTokenContractAddress: "ITHEUM-df6f26",
      claimsContractAddress: "erd1qqqqqqqqqqqqqpgqnsmrn5q08eqth3fy8el87sgdj0mkhwdwl2jqnf59cg",
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
export const tokenContractAddress_Goerli = contracts.ethereum[contractsMode].goerli.itheumTokenContractAddress;
export const ddexContractAddress_Goerli = contracts.ethereum[contractsMode].goerli.ddexContractAddress;
export const dNFTContractAddress_Goerli = contracts.ethereum[contractsMode].goerli.dNFTContractAddress;
export const claimsContractAddress_Goerli = contracts.ethereum[contractsMode].goerli.claimsContractAddress;

// BSC contracts
export const tokenContractAddress_testnetBSC = contracts.bsc[contractsMode].itheumTokenContractAddress;
export const ddexContractAddress_testnetBSC = contracts.bsc[contractsMode].ddexContractAddress;
export const dNFTContractAddress_testnetBSC = contracts.bsc[contractsMode].dNFTContractAddress;
export const claimsContractAddress_testnetBSC = contracts.bsc[contractsMode].claimsContractAddress;

// Mx contracts
export const tokenContractAddress_Mx_Devnet = contracts.mx["devnet"].itheumTokenContractAddress;
export const dataNFTFTTicker_Mx_Devnet = contracts.mx["devnet"].dataNFTFTTicker;
export const claimsContractAddress_Mx_Devnet = contracts.mx["devnet"].claimsContractAddress;
export const faucetContractAddress_Mx_Devnet = contracts.mx["devnet"].faucetContractAddress;
export const dataNftMintContractAddress_Mx_Devnet = contracts.mx["devnet"].dataNftMintContractAddress;
export const dataNftMarketContractAddress_Mx_Devnet = contracts.mx["devnet"].dataNftMarketContractAddress;
export const tokenContractAddress_Mx_Mainnet = contracts.mx["mainnet"].itheumTokenContractAddress;
export const claimsContractAddress_Mx_Mainnet = contracts.mx["mainnet"].claimsContractAddress;
export const faucetContractAddress_Mx_Mainnet = contracts.mx["mainnet"].faucetContractAddress;

// OTHER CHAIN CONTRACTS
export const tokenContractAddress_testnetHarmony = "0xcbEAF3BDe82155F56486Fb5a1072cb8baAf547cc";
export const tokenContractAddress_testnetAvalanche = "0x2982563dAf8Eeb43Cec78bf4E1A8614BD56CD1e3";

export const ddexContractAddress_testnetHarmony = "0x1429859428C0aBc9C2C47C8Ee9FBaf82cFA0F20f";
export const ddexContractAddress_testnetAvalanche = "0x56c88e7ed9Aa4792119c66D71815A6bD9DE0A5E0";

export const dNFTContractAddress_testnetHarmony = "0xB0D4afd8879eD9F52b28595d31B441D079B2Ca07";
export const dNFTContractAddress_testnetAvalanche = "0xCb0254502D84242f8ad477eb41723e99fdC6e847";

export const tokenContractAddress_Local = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
export const ddexContractAddress_Local = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
export const dNFTContractAddress_Local = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

export const claimsContractAddress_testnetAvalanche = "0xb38731CEC66340ff1c9F58B8ceCDEdb9B4Cb8f38";
