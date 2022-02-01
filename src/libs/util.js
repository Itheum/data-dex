import {mydaContractAddress, mydaContractAddress_Matic, ddexContractAddress,
  ddexContractAddress_Matic, dNFTContractAddress, dNFTContractAddress_Matic,
  mydaContractAddress_Rink, ddexContractAddress_Rink, dNFTContractAddress_Rink,
  mydaContractAddress_testnetBSC, ddexContractAddress_testnetBSC, dNFTContractAddress_testnetBSC,
  mydaContractAddress_testnetHarmony, ddexContractAddress_testnetHarmony, dNFTContractAddress_testnetHarmony,
  mydaContractAddress_testnetPlatON, ddexContractAddress_testnetPlatON, dNFTContractAddress_testnetPlatON,
  mydaContractAddress_testnetParastate, ddexContractAddress_testnetParastate, dNFTContractAddress_testnetParastate,
  mydaContractAddress_testnetAvalanche, ddexContractAddress_testnetAvalanche, dNFTContractAddress_testnetAvalanche,
  mydaContractAddress_Local, ddexContractAddress_Local, dNFTContractAddress_Local} from './contactAddresses.js';

export const contractsForChain = networkId => {
  const contracts = {
    myda: null,
    ddex: null,
    dnft: null
  };

  switch (networkId) {
    case 31337:
      contracts.myda = mydaContractAddress_Local;
      contracts.ddex = ddexContractAddress_Local;
      contracts.dnft = dNFTContractAddress_Local;
      break;
    case 3:
      contracts.myda = mydaContractAddress;
      contracts.ddex = ddexContractAddress;
      contracts.dnft = dNFTContractAddress;
      break;
    case 4:
      contracts.myda = mydaContractAddress_Rink;
      contracts.ddex = ddexContractAddress_Rink;
      contracts.dnft = dNFTContractAddress_Rink;
      break;
    case 80001:
      contracts.myda = mydaContractAddress_Matic;
      contracts.ddex = ddexContractAddress_Matic;
      contracts.dnft = dNFTContractAddress_Matic;
      break;
    case 97:
      contracts.myda = mydaContractAddress_testnetBSC;
      contracts.ddex = ddexContractAddress_testnetBSC;
      contracts.dnft = dNFTContractAddress_testnetBSC;
      break;
    case 1666700000:
      contracts.myda = mydaContractAddress_testnetHarmony;
      contracts.ddex = ddexContractAddress_testnetHarmony;
      contracts.dnft = dNFTContractAddress_testnetHarmony;
      break;
    case 210309:
      contracts.myda = mydaContractAddress_testnetPlatON;
      contracts.ddex = ddexContractAddress_testnetPlatON;
      contracts.dnft = dNFTContractAddress_testnetPlatON;
      break;
    case 123:
      contracts.myda = mydaContractAddress_testnetParastate;
      contracts.ddex = ddexContractAddress_testnetParastate;
      contracts.dnft = dNFTContractAddress_testnetParastate;
      break;
    case 43113:
      contracts.myda = mydaContractAddress_testnetAvalanche;
      contracts.ddex = ddexContractAddress_testnetAvalanche;
      contracts.dnft = dNFTContractAddress_testnetAvalanche;
      break;
  }

  return contracts;
}

export const config = {
  txConfirmationsNeededSml: 1,
  txConfirmationsNeededLrg: 2,
  dateStr: 'MMM Do YYYY',
  dateStrTm: 'MMM Do YYYY LT'
}

export const progInfoMeta = {
  rhc: {
    name: 'Red Heart Challenge',
    desc: 'Take this 3 week program and get unique insights into the health of your heart. This app uses a first of it’s kind technology to coach you through every step and to puts you in the center of the entire process.',
    medium: 'Telegram App',
    outcome: 'Data produced from this program can be used to assess the impact blood pressure, stress, diet and activity has on overall cardiovascular health.',
    targetBuyer: 'Research Institutes, Drug Manufacturers, Health "Care Teams", Private Health Insurance',
    data: 'Blood Pressure (single arm and both arms), Stress Levels, Activity Levels, Diet Assessment',
    url: 'https://itheum.com/redheartchallenge',
    dc: 'Cardiovascular Health Data',
    id: '70dc6bd0-59b0-11e8-8d54-2d562f6cba54',
    canJoin: 1
  },
  gdc: {
    name: 'Global DeFI Census',
    desc: 'This 2 week program collects insights about your exposure to the blockchain DeFI ecosystem. People globally and from all ages, skills levels and experience use DeFI tools today and we need to understand current usage trends to design better for mass adoption.',
    medium: 'Telegram App',
    outcome: 'Data produced from this program can be used to better design DeFI user experiences, DApps and tooling.',
    targetBuyer: 'Blockchain Research Institutes, DApp developers, Blockchain Protocol Developers, CeFI/DeFI Organisations',
    data: 'DeFI Apps Exposure, DeFI Pain Points, Investment Preferences, Barriers to Entry, DeFI DApp Sentiment',
    url: 'https://itheum.com/program',
    dc: 'Blockchain Research Data',
    id: 'foo',
    canJoin: 0
  },
  wfa: {
    name: 'Wearables Fitness and Activity',
    desc: 'This ongoing program will automatically connect to your Strava account and will download your latest activity from wearables like FitBit, Garmin, TomTom. Strava has a large global user base (76 million users) so dataset will be large and uniform and be worth a lot.',
    medium: 'Telegram App + Strava API',
    outcome: 'Data produced from this program is fully "normalised" and will be very valuable',
    targetBuyer: 'Researchers',
    data: 'Activity, Workouts',
    url: 'https://itheum.com/program',
    dc: 'Wearables Fitness and Activity Data',
    id: 'foo',
    canJoin: 1
  }
};

export const tmpProgIdMapping = {
  '70dc6bd0-59b0-11e8-8d54-2d562f6cba54': 'Red Heart Challenge',
  'bc9ce3e0-8f00-11e7-b1ff-9fef83fc8a42': 'Hypertension Insights Intense',
  '476ab840-1cb7-11e9-84fe-e935b365220a': 'Blood Pressure OnDemand',
  '2553c3b0-51b0-11e7-9bd2-2f33680a66b6': 'Pregnancy Condition Monitoring',
  '70dc6bd0-59b0-11e8-8d54-2d562f6cba54': 'Red Heart Challenge',
  '183f0290-f726-11e7-9186-3bcb5c5d22db': 'Chronic Wounds Healing Progress Tracker',
  'ef62c220-50e1-11e7-9bd2-2f33680a66b6': 'Blood Pressure Tracker',
  '48d7b020-eab0-11ea-a466-0334ff0e8bf2': 'OkPulse',
};

export const dataTemplates = {
  dataPack: {
    sellerEthAddress: null,
    dataPreview: null,
    dataHash: null,
    dataFile: null,
    termsOfUseId: null,
    txHash: null,
    txNetworkId: null
  },
  dataNFT: {
    sellerEthAddress: null,
    dataPreview: null,
    dataHash: null,
    dataFile: null,
    priceInMyda: null,
    termsOfUseId: null,
    metaDataFile: null,
    nftName: null,
    txNFTContract: null,
    txNFTId: null,
    txHash: null,
    txNetworkId: null
  },
  dataOrder: {
    dataPackId: null,
    buyerEthAddress: null,
    pricePaid: null,
    dataFileUrl: null,
    dataHash: null,
    txHash: null,
    txNetworkId: null
  },
  dataNFTMetaDataFile: {
    name: '',
    description: '',
    image: '',
    external_url: '',
    properties: {
      data_dex_nft_id: ''
    }
  }
};

export const qsParams = () => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());

  return params;
}

export const mydaRoundUtil = (balance, decimals, BN) => {
  const balanceWeiString = balance.toString();
  const balanceWeiBN = new BN(balanceWeiString);

  const decimalsBN = new BN(decimals);
  const divisor = new BN(10).pow(decimalsBN);

  const beforeDecimal = balanceWeiBN.div(divisor);

  return beforeDecimal.toString();
}

export const MENU = {
  HOME: 0,
  BUY: 1,
  SELL: 2,
  PURCHASED: 3,
  TX: 4,
  VAULT: 5,
  NFT: 6,
  COALITION: 7,
  STREAM: 8,
  ADVERTISED: 9,
  NFTMINE: 10,
  NFTALL: 11,
  COALITIONALL: 12,
  DATAPROOFS: 13,
};

export const CHAINS = {
  31337: "Localhost",
  1: "Mainnet",
  3: "Ropsten",
  4: "Rinkeby",
  42: "Kovan",
  420: "Goerli",
  137: "Matic - Mainnet",
  80001: "Matic - Mumbai",
  97: "BSC - Chapel",
  56: "BSC - Mainnet",
  1666700000: "Harmony - Testnet",
  210309: "PlatON - Testnet",
  123: "Parastate - Testnet",
  43113: "Avalanche - Testnet",
}

// these are used by moralis SDK to identify the chain (e.g. Web3Api.account.getNFTs)
export const CHAIN_NAMES = {
  31337: "localhost",
  1: "eth",
  3: "ropsten",
  4: "rinkeby",
  42: "kovan",
  420: "goerli",
  137: "matic",
  80001: "mumbai",
  97: "bsc testnet",
  56: "bsc",
  1666700000: "harmony testnet",
  210309: "platON testnet",
  123: "Parastate - Testnet",
  43113: "avalanche testnet"
}

export const OPENSEA_CHAIN_NAMES = {
  1: "eth",
  4: "rinkeby",
  137: "matic",
  80001: "mumbai"
}

export const SUPPORTED_CHAINS = [31337, 3, 4, 80001, 97, 1666700000, 210309, 123, 43113];

export const consoleNotice = `DATA DEX NOTES --------------------------\n
1) Nothing to report for now...\n
-----------------------------------------`;

export function noChainSupport(menuItem, networkId) {
  const UNSUPPORTED_CHAIN_FEATURES = {
    31337: [MENU.NFTALL, MENU.NFTMINE, MENU.TX],
    97: [MENU.TX],
    1666700000: [MENU.NFTALL, MENU.NFTMINE, MENU.TX],
    210309: [MENU.NFTALL, MENU.NFTMINE, MENU.TX],
    123: [MENU.NFTALL, MENU.NFTMINE, MENU.TX],
    43113: [MENU.TX],
  };

  if (SUPPORTED_CHAINS.includes(networkId) && UNSUPPORTED_CHAIN_FEATURES[networkId]) {
    return UNSUPPORTED_CHAIN_FEATURES[networkId].includes(menuItem);
  }
  else {
    return false;
  }
}

export const CHAIN_TX_VIEWER = {
  3: 'https://ropsten.etherscan.io/tx/',
  4: 'https://rinkeby.etherscan.io/tx/',
  80001: 'https://explorer-mumbai.maticvigil.com/tx/',
  97: 'https://testnet.bscscan.com/',
  1666700000: 'https://explorer.pops.one/#/',
  210309: 'https://devnetscan.platon.network/trade-detail?txHash=',
  43113: 'https://testnet.snowtrace.io/tx/',
}

export const CHAIN_TX_LIST = {
  3: {
    advertiseEvents: 'AdvertiseEventsA',
    purchaseEvents: 'PurchaseEvents'
  },
  4: {
    advertiseEvents: 'AdvertiseEventsA',
    purchaseEvents: 'PurchaseEvents'
  },
  80001: {
    advertiseEvents: 'AdvertiseEventsPA',
    purchaseEvents: 'PurchaseEventsPA'
  }
}

export const CHAIN_TOKEN_SYMBOL = networkId => {
  const mapping = {
    'MYDA' : [3, 4, 1],
    'mMYDA': [80001, 137],
    'bMYDA': [97, 56],
    'hMYDA': [1666700000],
    'pMYDA': [210309],
    'psMYDA': [123],
    'aMYDA': [43113],
  };

  let sym = null;
        
  Object.keys(mapping).some(i => {
    if (mapping[i].includes(networkId)) {
      sym = i;
    }

    return mapping[i].includes(networkId);
  });

  return sym;
}

export const TERMS = [
  {id: '1', val: "Research Purposes Only", coin: 2},
  {id: '2', val: "Research or Commercial Purposes Only", coin: 2},
  {id: '3', val: "Fully License (any use case)", coin: 2}
];

export const ABIS = {
  ddex: [
    {
      "inputs": [
        {
          "internalType": "contract ERC20",
          "name": "_mydaToken",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "dataPackId",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "seller",
          "type": "address"
        }
      ],
      "name": "AdvertiseEvent",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "dataPackId",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "dataHashStr",
          "type": "string"
        }
      ],
      "name": "advertiseForSale",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "dataPackId",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "feeInMyda",
          "type": "uint256"
        }
      ],
      "name": "buyDataPack",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "dataPackId",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "seller",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "feeInMyda",
          "type": "uint256"
        }
      ],
      "name": "PurchaseEvent",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "dataPackId",
          "type": "string"
        }
      ],
      "name": "checkAccess",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "name": "dataPacks",
      "outputs": [
        {
          "internalType": "address",
          "name": "seller",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "dataHash",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "mydaToken",
      "outputs": [
        {
          "internalType": "contract ERC20",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "dataPackId",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "dataHashStr",
          "type": "string"
        }
      ],
      "name": "verifyData",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ],
  token: [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "burn",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "burnFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "subtractedValue",
          "type": "uint256"
        }
      ],
      "name": "decreaseAllowance",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "faucet",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "faucetLastUsed",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "addedValue",
          "type": "uint256"
        }
      ],
      "name": "increaseAllowance",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "mint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  dNFT: [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "approved",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "ApprovalForAll",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "uri",
          "type": "string"
        }
      ],
      "name": "createDataNFT",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "dataNFTs",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "creator",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "uri",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "getApproved",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        }
      ],
      "name": "isApprovedForAll",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "ownerOf",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "_data",
          "type": "bytes"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "setApprovalForAll",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes4",
          "name": "interfaceId",
          "type": "bytes4"
        }
      ],
      "name": "supportsInterface",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "tokenURI",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
}

export const sleep = (sec) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, sec * 1000);
  });
}

export const buyOnOpenSea = (txNFTId, dnftContract, txNetworkId) => { 
  console.log('txNetworkId');
  console.log(txNetworkId);
  window.open(`https://testnets.opensea.io/assets/${OPENSEA_CHAIN_NAMES[txNetworkId]}/${dnftContract}/${txNFTId}`);
}