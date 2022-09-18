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
  tokenContractAddress_testnetAvalanche,
  ddexContractAddress_testnetAvalanche,
  dNFTContractAddress_testnetAvalanche,
  tokenContractAddress_Local,
  ddexContractAddress_Local,
  dNFTContractAddress_Local,
  claimsContractAddress_Matic,
  claimsContractAddress_testnetBSC,

  tokenContractAddress_Elrond_Devnet,
  claimsContractAddress_Elrond_Devnet,
  faucetContractAddress_Elrond_Devnet,
  tokenContractAddress_Elrond_Mainnet,
  claimsContractAddress_Elrond_Mainnet,
  faucetContractAddress_Elrond_Mainnet,
} from "./contactAddresses";

export const contractsForChain = (networkId) => {
  const contracts = {
    itheumToken: null,
    ddex: null,
    dnft: null,
    faucet: null,
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
      contracts.claims = claimsContractAddress_Rop;
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
      break;
    case 43113:
      contracts.itheumToken = tokenContractAddress_testnetAvalanche;
      contracts.ddex = ddexContractAddress_testnetAvalanche;
      contracts.dnft = dNFTContractAddress_testnetAvalanche;
      break;
    case "ED":
      contracts.itheumToken = tokenContractAddress_Elrond_Devnet;
      contracts.claims = claimsContractAddress_Elrond_Devnet;
      contracts.faucet = faucetContractAddress_Elrond_Devnet;
      break;
    case "E1":
      contracts.itheumToken = tokenContractAddress_Elrond_Mainnet;
      contracts.claims = claimsContractAddress_Elrond_Mainnet;
      contracts.faucet = faucetContractAddress_Elrond_Mainnet;
      break;
  }

  return contracts;
};

export const uxConfig = {
  txConfirmationsNeededSml: 1,
  txConfirmationsNeededLrg: 2,
  dateStr: "MMM Do YYYY",
  dateStrTm: "MMM Do YYYY LT",
  elrondAPITimeoutMs: 10000
};

export const progInfoMeta = {
  rhc: {
    name: "Red Heart Challenge",
    desc: "Take this 3 week program and get unique insights into the health of your heart. This app uses a first of it’s kind technology to coach you through every step and to puts you in the center of the entire process.",
    medium: "Telegram App",
    outcome: "Data produced from this program can be used to assess the impact blood pressure, stress, diet and activity has on overall cardiovascular health.",
    targetBuyer: 'Research Institutes, Drug Manufacturers, Health "Care Teams", Private Health Insurance',
    data: "Blood Pressure (single arm and both arms), Stress Levels, Activity Levels, Diet Assessment",
    url: "https://itheum.com/redheartchallenge",
    dc: "Cardiovascular Health Data",
    id: "70dc6bd0-59b0-11e8-8d54-2d562f6cba54",
    canJoin: 1,
  },
  gdc: {
    name: "Gamer Passport",
    desc: "Calling all web3 gamers! The Gamer Passport app will empower you to claim and own your web3 gaming data as you move between games and guilds. You will then be able to attach it to your NFMe ID Avatar and trade your data with participants in the gaming industry.",
    medium: "Data Adaptors",
    outcome: "Data produced from this app can be used to power 'proof-of-play' and 'proof-of-community-reputation'",
    targetBuyer: "Games, Game Platforms, Guilds, Guild Hubs, GameFi Platforms",
    data: "Discord community score, on-chain gaming performance, on-chain game earnings, game earnings and spending patterns, HOLDing ability, game assets composition to earning patterns",
    url: "https://itheum.medium.com/do-you-want-to-be-part-of-the-gamer-passport-alpha-release-4ae98b93e7ae",
    dc: "Gamer Passport Data",
    id: "foo",
    canJoin: 1,
  },
  wfa: {
    name: "Wearables Fitness and Activity",
    desc: "This ongoing program will automatically connect to your Strava account and will download your latest activity from wearables like FitBit, Garmin, TomTom. Strava has a large global user base (76 million users) so dataset will be large and uniform and be worth a lot.",
    medium: "Telegram App + Strava API",
    outcome: 'Data produced from this program is fully "normalised" and will be very valuable',
    targetBuyer: "Researchers",
    data: "Activity, Workouts",
    url: "https://itheum.com/program",
    dc: "Wearables Fitness and Activity Data",
    id: "foo",
    canJoin: 0,
  },
};

export const tmpProgIdMapping = {
  "70dc6bd0-59b0-11e8-8d54-2d562f6cba54": "Red Heart Challenge",
  "bc9ce3e0-8f00-11e7-b1ff-9fef83fc8a42": "Hypertension Insights Intense",
  "476ab840-1cb7-11e9-84fe-e935b365220a": "Blood Pressure OnDemand",
  "2553c3b0-51b0-11e7-9bd2-2f33680a66b6": "Pregnancy Condition Monitoring",
  "70dc6bd0-59b0-11e8-8d54-2d562f6cba54": "Red Heart Challenge",
  "183f0290-f726-11e7-9186-3bcb5c5d22db": "Chronic Wounds Healing Progress Tracker",
  "ef62c220-50e1-11e7-9bd2-2f33680a66b6": "Blood Pressure Tracker",
  "48d7b020-eab0-11ea-a466-0334ff0e8bf2": "OkPulse",
};

export const dataTemplates = {
  dataPack: {
    sellerEthAddress: null,
    dataPreview: null,
    dataHash: null,
    dataFile: null,
    termsOfUseId: null,
    txHash: null,
    txNetworkId: null,
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
    txNetworkId: null,
  },
  dataOrder: {
    dataPackId: null,
    buyerEthAddress: null,
    pricePaid: null,
    dataFileUrl: null,
    dataHash: null,
    txHash: null,
    txNetworkId: null,
  },
  dataNFTMetaDataFile: {
    name: "",
    description: "",
    image: "",
    external_url: "",
    properties: {
      data_dex_nft_id: "",
    },
  },
};

export const qsParams = () => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());

  return params;
};

export const itheumTokenRoundUtil = (balance, decimals, BigNumber) => {
  const balanceWeiString = balance.toString();
  const balanceWeiBN = BigNumber.from(balanceWeiString);
  const decimalsBN = BigNumber.from(decimals);
  const divisor = BigNumber.from(10).pow(decimalsBN);
  const beforeDecimal = balanceWeiBN.div(divisor);

  return beforeDecimal.toString();
};

export const CLAIM_TYPES = {
  REWARDS: 1,
  AIRDROPS: 2,
  ALLOCATIONS: 3,
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
  FAUCET: 14,
  CLAIMS: 15,
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
  1: "Eth - Mainnet",
  3: "Eth - Ropsten",
  4: "Eth - Rinkeby",
  42: "Eth - Kovan",
  420: "Eth - Goerli",
  137: "Matic - Mainnet",
  80001: "Matic - Mumbai",
  97: "BSC - Chapel",
  56: "BSC - Mainnet",
  1666700000: "Harmony - Testnet",
  43113: "Avalanche - Testnet",
  E1: "Elrond - Mainnet",
  ED: "Elrond - Devnet",
};

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
  43113: "avalanche testnet",
};

export const OPENSEA_CHAIN_NAMES = {
  1: "eth",
  4: "rinkeby",
  137: "matic",
  80001: "mumbai",
};

export const SUPPORTED_CHAINS = ['E1', 'ED', 3, 4, 80001, 97, 1666700000, 43113];

export const WALLETS = {
  METAMASK: 'evm_metamask',
  WC: 'evm_wc',
  ELROND_MAIARAPP: 'el_maiar',
  ELROND_DEFI: 'el_defi',
  ELROND_WEBWALLET: 'el_webwallet',
  ELROND_LEDGER: 'el_ledger',
};

export const consoleNotice = `DATA DEX NOTES --------------------------\n
1) Nothing to report for now...\n
-----------------------------------------`;

export function noChainSupport(menuItem, networkId) {
  const UNSUPPORTED_CHAIN_FEATURES = {
    31337: [MENU.CLAIMS, MENU.NFTALL, MENU.NFTMINE, MENU.TX],
    97: [MENU.TX, MENU.COALITION],
    1666700000: [MENU.CLAIMS, MENU.NFTALL, MENU.NFTMINE, MENU.TX],
    43113: [MENU.CLAIMS, MENU.TX],
    'ED': [MENU.TX, MENU.COALITION, MENU.NFTALL, MENU.NFTMINE, MENU.BUY, MENU.PURCHASED, MENU.ADVERTISED, MENU.DATAPROOFS, MENU.SELL],
    'E1': [MENU.FAUCET, MENU.TX, MENU.COALITION, MENU.NFTALL, MENU.NFTMINE, MENU.BUY, MENU.PURCHASED, MENU.ADVERTISED, MENU.DATAPROOFS, MENU.SELL],
  };

  if (UNSUPPORTED_CHAIN_FEATURES[networkId]) {
    return UNSUPPORTED_CHAIN_FEATURES[networkId].includes(menuItem);
  } else {
    return false;
  }
}

export const CHAIN_TX_VIEWER = {
  3: "https://ropsten.etherscan.io/tx/",
  4: "https://rinkeby.etherscan.io/tx/",
  80001: "https://explorer-mumbai.maticvigil.com/tx/",
  97: "https://testnet.bscscan.com/tx/",
  1666700000: "https://explorer.pops.one/#/",
  43113: "https://testnet.snowtrace.io/tx/",
};

export const CHAIN_TX_LIST = {
  3: {
    advertiseEvents: "AdvertiseEventsA",
    purchaseEvents: "PurchaseEvents",
  },
  4: {
    advertiseEvents: "AdvertiseEventsA",
    purchaseEvents: "PurchaseEvents",
  },
  80001: {
    advertiseEvents: "AdvertiseEventsPA",
    purchaseEvents: "PurchaseEventsPA",
  },
};

export const CHAIN_TOKEN_SYMBOL = (networkId) => {
  const mapping = {
    ITHEUM: ['E1', 'ED'],
    eITHEUM: [3, 4, 1],
    mITHEUM: [80001, 137],
    bITHEUM: [97, 56],
    hITHEUM: [1666700000],
    aITHEUM: [43113],
  };

  let sym = null;

  Object.keys(mapping).some((i) => {
    if (mapping[i].includes(networkId)) {
      sym = i;
    }

    return mapping[i].includes(networkId);
  });

  return sym;
};

export const TERMS = [
  { id: "1", val: "Research Purposes Only", coin: 2 },
  { id: "2", val: "Research or Commercial Purposes Only", coin: 2 },
  { id: "3", val: "Fully License (any use case)", coin: 2 },
];

export const sleep = (sec) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, sec * 1000);
  });
};

export const buyOnOpenSea = (txNFTId, dnftContract, txNetworkId) => {
  window.open(`https://testnets.opensea.io/assets/${OPENSEA_CHAIN_NAMES[txNetworkId]}/${dnftContract}/${txNFTId}`);
};

export const gtagGo = (category, action, label, value) => {
  /*
  e.g.
  Category: "Videos", Action: "Play", Label: "Gone With the Wind"
  Category: "Videos"; Action: "Play - Mac Chrome"
  Category: "Videos", Action: "Video Load Time", Label: "Gone With the Wind", Value: downloadTime

  Category: "Auth", Action: "Login", Label: "Metamask"
  Category: "Auth", Action: "Login - Success", Label: "Metamask"
  Category: "Auth", Action: "Login", Label: "DeFi"
  Category: "Auth", Action: "Login", Label: "Ledger"
  Category: "Auth", Action: "Login", Label: "MaiarApp"
  Category: "Auth", Action: "Login", Label: "WebWallet"

  Category: "Auth", Action: "Logout", Label: "WebWallet"
  */
 
  if (!action || !category) {
    console.error('gtag tracking needs both action and category');
    return;
  }

  const eventObj =  {
    'event_category' : category
  }

  if (label) {
    eventObj['event_label'] = label;
  }

  if (value) {
    eventObj['event_value'] = value;
  }

  if (window.location.hostname !== 'localhost') {
    window.gtag('event', action, eventObj);
  }
};

export const debugui = (text) => {
  if (sessionStorage && sessionStorage.getItem('itm-debugui')) {
    const div = document.getElementById('debugui');
    div.innerHTML = text + '<br/>' + div.innerHTML;
    div.style.display = 'block';
  }
};

export const clearAppSessions = () => {
  // WEIRD, for some reason setWalletUsedSession(null) does not trigger the hook ONLY for metamask (works fine in elrond)
    // ... so we explictely remove 'itm-wallet-used' here
    sessionStorage.removeItem('itm-wallet-used');
    
    sessionStorage.removeItem('itm-launch-mode');
    sessionStorage.removeItem('itm-launch-env');
}
