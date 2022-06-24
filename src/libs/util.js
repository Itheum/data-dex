import {
  tokenContractAddress_Rop,
  tokenContractAddress_Matic,
  ddexContractAddress_Rop,
  ddexContractAddress_Matic,
  dNFTContractAddress_Rop,
  claimsContractAddress_Rop,
  dNFTContractAddress_Matic,
  tokenContractAddress_Rink,
  ddexContractAddress_Rink,
  dNFTContractAddress_Rink,
  tokenContractAddress_testnetBSC,
  ddexContractAddress_testnetBSC,
  dNFTContractAddress_testnetBSC,
  tokenContractAddress_testnetHarmony,
  ddexContractAddress_testnetHarmony,
  dNFTContractAddress_testnetHarmony,
  tokenContractAddress_testnetPlatON,
  ddexContractAddress_testnetPlatON,
  dNFTContractAddress_testnetPlatON,
  tokenContractAddress_testnetParastate,
  ddexContractAddress_testnetParastate,
  dNFTContractAddress_testnetParastate,
  tokenContractAddress_testnetAvalanche,
  ddexContractAddress_testnetAvalanche,
  dNFTContractAddress_testnetAvalanche,
  tokenContractAddress_Local,
  ddexContractAddress_Local,
  dNFTContractAddress_Local,
  claimsContractAddress_Matic,
  claimsContractAddress_testnetBSC
} from "./contactAddresses.js";

export const contractsForChain = networkId => {
  const contracts = {
    itheumToken: null,
    ddex: null,
    dnft: null,
    claims: null,
  };

  switch (networkId) {
    case 31337:
      contracts.itheumToken = tokenContractAddress_Local;
      contracts.ddex = ddexContractAddress_Local;
      contracts.dnft = dNFTContractAddress_Local;
      break;
    case 3:
      contracts.itheumToken = tokenContractAddress_Rop;
      contracts.ddex = ddexContractAddress_Rop;
      contracts.dnft = dNFTContractAddress_Rop;
      contracts.claims = claimsContractAddress_Rop
      break;
    case 4:
      contracts.itheumToken = tokenContractAddress_Rink;
      contracts.ddex = ddexContractAddress_Rink;
      contracts.dnft = dNFTContractAddress_Rink;
      break;
    case 80001:
      contracts.itheumToken = tokenContractAddress_Matic;
      contracts.ddex = ddexContractAddress_Matic;
      contracts.dnft = dNFTContractAddress_Matic;
      contracts.claims = claimsContractAddress_Matic;
      break;
    case 97:
      contracts.itheumToken = tokenContractAddress_testnetBSC;
      contracts.ddex = ddexContractAddress_testnetBSC;
      contracts.dnft = dNFTContractAddress_testnetBSC;
      contracts.claims = claimsContractAddress_testnetBSC;
      break;
    case 1666700000:
      contracts.itheumToken = tokenContractAddress_testnetHarmony;
      contracts.ddex = ddexContractAddress_testnetHarmony;
      contracts.dnft = dNFTContractAddress_testnetHarmony;
      break;
    case 210309:
      contracts.itheumToken = tokenContractAddress_testnetPlatON;
      contracts.ddex = ddexContractAddress_testnetPlatON;
      contracts.dnft = dNFTContractAddress_testnetPlatON;
      break;
    case 123:
      contracts.itheumToken = tokenContractAddress_testnetParastate;
      contracts.ddex = ddexContractAddress_testnetParastate;
      contracts.dnft = dNFTContractAddress_testnetParastate;
      break;
    case 43113:
      contracts.itheumToken = tokenContractAddress_testnetAvalanche;
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
    name: 'Gamer Passport',
    desc: 'Calling all web3 gamers! The Gamer Passport app will empower you to claim and own your web3 gaming data as you move between games and guilds. You will then be able to attach it to your NFMe ID Avatar and trade your data with participants in the gaming industry.',
    medium: 'Telegram App',
    outcome: 'Data produced from this app can be used to unlock valuable data; direct-from-gamers.',
    targetBuyer: 'Games, Game Platforms, Guilds, Guild Hubs, GameFi Platforms',
    data: 'Discord community score, on-chain gaming performance, on-chain game earnings, game earnings and spending patterns, HOLDing ability, game assets composition to earning patterns',
    url: 'https://itheum.com/program',
    dc: 'Gamer Passport Data',
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

export const itheumTokenRoundUtil = (balance, decimals, BigNumber) => {
  const balanceWeiString = balance.toString();
  const balanceWeiBN = BigNumber.from(balanceWeiString);
  const decimalsBN = BigNumber.from(decimals);
  const divisor = BigNumber.from(10).pow(decimalsBN);
  const beforeDecimal = balanceWeiBN.div(divisor);

  return beforeDecimal.toString();
}

export const CLAIM_TYPES = {
  REWARDS: 1,
  AIRDROPS: 2,
  ALLOCATIONS: 3
};

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
  TRUSTEDCOMP:14,
};

export const PATHS = {
  home: [0,[-1]],
  buydata: [1,[0]],
  selldata: [2,[-1]],
  purchaseddata: [3,[0]],
  chaintransactions: [4,[3]],
  datavault: [5,[4]],
  datanfts: [6,[1]],
  viewcoalitions: [7,[2]],
  datastreams: [8,[4]],
  advertiseddata: [9,[0]],
  wallet: [10,[1]],
  marketplace: [11,[1]],
  datacoalitions: [12,[2]],
  personaldataproof: [13,[0]],
  trustedcomputation:[14,[4]]

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
    97: [MENU.TX, MENU.COALITION],
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
  97: 'https://testnet.bscscan.com/tx/',
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
    'ITHEUM' : [3, 4, 1],
    'mITHEUM': [80001, 137],
    'bITHEUM': [97, 56],
    'hITHEUM': [1666700000],
    'pITHEUM': [210309],
    'psITHEUM': [123],
    'aITHEUM': [43113],
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
  ],
  claims: [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "_address",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint8",
          "name": "_type",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "DepositClaimed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "_address",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint8",
          "name": "_type",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "DepositDecreased",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "_address",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint8",
          "name": "_type",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "DepositIncreased",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "version",
          "type": "uint8"
        }
      ],
      "name": "Initialized",
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
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Paused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Unpaused",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "_type",
          "type": "uint8"
        }
      ],
      "name": "claimDeposit",
      "outputs": [
        {
          "internalType": "bool",
          "name": "success",
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
          "name": "_address",
          "type": "address"
        },
        {
          "internalType": "uint8",
          "name": "_type",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "decreaseDeposit",
      "outputs": [
        {
          "internalType": "bool",
          "name": "success",
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
        },
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "name": "deposits",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "lastDeposited",
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
          "name": "_address",
          "type": "address"
        },
        {
          "internalType": "uint8",
          "name": "_type",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "increaseDeposit",
      "outputs": [
        {
          "internalType": "bool",
          "name": "success",
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
          "name": "_itheumTokenAddress",
          "type": "address"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "itheumTokenAddress",
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
      "name": "pause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "paused",
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
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalDeposits",
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
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "unpause",
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
  window.open(`https://testnets.opensea.io/assets/${OPENSEA_CHAIN_NAMES[txNetworkId]}/${dnftContract}/${txNFTId}`);
}