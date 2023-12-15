import { ContractsType } from "libs/types";
import {
  tokenContractAddress_Mx_Devnet,
  dataNFTFTTicker_Mx_Devnet,
  claimsContractAddress_Mx_Devnet,
  faucetContractAddress_Mx_Devnet,
  dataNftMintContractAddress_Mx_Devnet,
  dataNftMarketContractAddress_Mx_Devnet,
  tokenContractAddress_Mx_Mainnet,
  claimsContractAddress_Mx_Mainnet,
  faucetContractAddress_Mx_Mainnet,
  dataNftMarketContractAddress_Mx_Mainnet,
  dataNftMintContractAddress_Mx_Mainnet,
  dataNFTFTTicker_Mx_Mainnet,
} from "./contractAddresses";

export function contractsForChain(chainID: string): ContractsType {
  switch (chainID) {
    case "D": {
      return {
        itheumToken: tokenContractAddress_Mx_Devnet,
        claims: claimsContractAddress_Mx_Devnet,
        faucet: faucetContractAddress_Mx_Devnet,
        market: dataNftMarketContractAddress_Mx_Devnet,
        dataNftTokens: [
          {
            id: dataNFTFTTicker_Mx_Devnet,
            contract: dataNftMintContractAddress_Mx_Devnet,
          },
          {
            id: "BIGBANG-6b34db",
            contract: "erd1qqqqqqqqqqqqqpgqdsf80w35nqlxfd34z0cd9n60vwlkdj9a8yps3t6x4m",
          },
          {
            id: "BETATOK-5b7317",
            contract: "erd1qqqqqqqqqqqqqpgqjk0cxzm79qzced5sevmnn6swgp3jjch88ypsfd068q",
          },
        ],
      };
    }
    case "1": {
      return {
        itheumToken: tokenContractAddress_Mx_Mainnet,
        claims: claimsContractAddress_Mx_Mainnet,
        faucet: faucetContractAddress_Mx_Mainnet,
        market: dataNftMarketContractAddress_Mx_Mainnet,
        dataNftTokens: [
          {
            id: dataNFTFTTicker_Mx_Mainnet,
            contract: dataNftMintContractAddress_Mx_Mainnet,
          },
        ],
      };
    }
  }

  throw Error("Undefined chainID");
}

export const uxConfig = {
  txConfirmationsNeededSml: 1,
  txConfirmationsNeededLrg: 2,
  dateStr: "DD/MM/YYYY",
  dateStrTm: "DD/MM/YYYY LT",
  mxAPITimeoutMs: 10000,
};

export const CLAIM_TYPES = {
  REWARDS: 1,
  AIRDROPS: 2,
  ALLOCATIONS: 3,
  ROYALTIES: 4,
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
  TRUSTEDCOMP: 14,
  FAUCET: 14,
  CLAIMS: 15,
  LANDING: 16,
  NFTDETAILS: 17,
  GETWHITELISTED: 18,
  DATACAT: 19,
  PROFILE: 20,
  GUARDRAILS: 21,
};

export const BUTTONS = {
  JOIN_NOW: 0,
};

export const PATHS = {
  home: [0, [-1]],
  buydata: [1, [0]],
  tradedata: [2, [-1]],
  purchaseddata: [3, [0]],
  chaintransactions: [4, [3]],
  datanfts: [6, [1]],
  viewcoalitions: [7, [2]],
  advertiseddata: [9, [0]],
  wallet: [10, [1]],
  marketplace: [11, [1]],
  datacoalitions: [12, [2]],
  personaldataproof: [13, [0]],
  nftdetails: [17, [4]],
  offer: [17, [4]],
  getwhitelisted: [18, [-1]],
};

export const CHAINS = {
  31337: "Localhost",
  "_1": "Eth - Mainnet",
  5: "Eth - Görli",
  137: "Matic - Mainnet",
  80001: "Matic - Mumbai",
  97: "BSC - Chapel",
  56: "BSC - Mainnet",
  1666700000: "Harmony - Testnet",
  43113: "Avalanche - Testnet",
  "1": "MultiversX - Mainnet",
  "D": "MultiversX - Devnet",
};

// these are used by moralis SDK to identify the chain (e.g. Web3Api.account.getNFTs)
export const CHAIN_NAMES = {
  31337: "localhost",
  1: "eth",
  5: "goerli",
  137: "matic",
  80001: "mumbai",
  97: "bsc testnet",
  56: "bsc",
  1666700000: "harmony testnet",
  43113: "avalanche testnet",
};

export const OPENSEA_CHAIN_NAMES: Record<string, string> = {
  1: "eth",
  5: "goerli",
  137: "matic",
  80001: "mumbai",
};

export const SUPPORTED_CHAINS = ["1", "D", 5, 80001, 97, 1666700000, 43113];

export const WALLETS = {
  METAMASK: "evm_metamask",
  WC: "evm_wc",
  MX_XPORTALAPP: "el_maiar",
  MX_DEFI: "el_defi",
  MX_WEBWALLET: "el_webwallet",
  MX_LEDGER: "el_ledger",
  MX_CUSTOM_WEBWALLET: "el_custom_webwallet",
};

export const consoleNotice = `DATA DEX NOTES --------------------------\n
1) Nothing to report for now...\n
-----------------------------------------`;

export function notSupportedOnChain(menuItem: any, chainID: string) {
  const UNSUPPORTED_CHAIN_FEATURES: Record<string, number[]> = {
    5: [MENU.TX],
    31337: [MENU.CLAIMS, MENU.NFTALL, MENU.NFTMINE, MENU.TX],
    97: [MENU.TX, MENU.COALITION],
    1666700000: [MENU.CLAIMS, MENU.NFTALL, MENU.NFTMINE, MENU.TX],
    43113: [MENU.CLAIMS, MENU.TX],
    "D": [MENU.TX, MENU.COALITION, MENU.BUY, MENU.PURCHASED, MENU.ADVERTISED, MENU.DATAPROOFS],
    "1": [MENU.FAUCET, MENU.TX, MENU.COALITION, MENU.BUY, MENU.PURCHASED, MENU.ADVERTISED, MENU.DATAPROOFS, MENU.DATACAT, BUTTONS.JOIN_NOW],
  };

  if (UNSUPPORTED_CHAIN_FEATURES[chainID]) {
    return UNSUPPORTED_CHAIN_FEATURES[chainID].includes(menuItem);
  } else {
    return false;
  }
}

export const CHAIN_TX_VIEWER = {
  5: "https://goerli.etherscan.io/tx/",
  80001: "https://explorer-mumbai.maticvigil.com/tx/",
  97: "https://testnet.bscscan.com/tx/",
  1666700000: "https://explorer.pops.one/#/",
  43113: "https://testnet.snowtrace.io/tx/",
  "1": "https://explorer.multiversx.com",
  "D": "https://devnet-explorer.multiversx.com",
};

export const CHAIN_TX_LIST = {
  80001: {
    advertiseEvents: "AdvertiseEventsPA",
    purchaseEvents: "PurchaseEventsPA",
  },
};

export const CHAIN_TOKEN_SYMBOL = (chainID: string) => {
  const mapping: Record<string, any[]> = {
    ITHEUM: ["1", "D"],
    eITHEUM: [5, 1],
    mITHEUM: [80001, 137],
    bITHEUM: [97, 56],
    hITHEUM: [1666700000],
    aITHEUM: [43113],
  };

  let sym = null;

  Object.keys(mapping).some((i) => {
    if (mapping[i].includes(chainID)) {
      sym = i;
    }

    return mapping[i].includes(chainID);
  });

  return sym;
};

export const TERMS = [
  { id: "1", val: "Research Purposes Only", coin: 2 },
  { id: "2", val: "Research or Commercial Purposes Only", coin: 2 },
  { id: "3", val: "Fully License (any use case)", coin: 2 },
];

export const progInfoMeta = {
  rhc: {
    name: "Red Heart Challenge",
    desc: "Take this 3-week program and get unique insights into the health of your heart. This app uses a first of its kind technology to coach you through every step and to puts you in the center of the entire process.",
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
    name: "PlayStation Gamer Passport",
    desc: "Calling all PlayStation gamers! The Gamer Passport app will empower you to claim some of your PlayStation Network (PSN) gaming data and mint Data NFTs that can unlock the data with your consent. You can use your Data NFTs as a 'Data Vault', which Web3 Apps can then unlock, or you can trade these Data NFTs in the Data NFT Marketplace.",
    medium: null,
    outcome:
      'Data produced from this app can be used to power "proof-of-play", allow 3rd party Web3 platforms to unlock your data with your consent to personalize user experience, and group together bulk datasets from all PlayStation gamers to power a unified analytics toolkit for Game Studios.',
    targetBuyer: "Game Studios, Game Platforms, Games, Guilds, GameFi Platforms",
    data: "All data is de-identified and updated in real-time: PlayStation gaming titles, trophies and achievements per game, gaming time per game title,  total gaming time, and platform/hardware details.",
    url: "https://itheum.medium.com/do-you-want-to-be-part-of-the-gamer-passport-alpha-release-4ae98b93e7ae",
    dc: "Gamer Passport Data",
    id: "foo",
    canJoin: 0,
  },
  gpes: {
    name: "Gamer Passport - ESSports",
    desc: "The Gamer Passport app will empower you to claim and control your web2 and web3 gaming data. You can then attach it to your NFMe ID Avatar, serving as your ESports 'resume.'",
    medium: "Data Adaptors",
    outcome: 'Data produced from this app can be used to power "proof-of-play" and "proof-of-skill"',
    targetBuyer: "Games, Game Platforms, ESSport Scouts",
    data: "web2 and web3 on-chain gaming performance",
    url: "https://itheum.com/program",
    dc: "Gamer Passport Data",
    id: "foo",
    canJoin: 0,
  },
  wfa: {
    name: "Strava Fitness",
    desc: "This ongoing program will automatically connect to your Strava account and download your latest activity from wearables like FitBit, Garmin, etc. Strava has an extensive global user base (76 million), so the dataset will be significant, uniform, and highly valued.",
    medium: "Telegram App + Strava API",
    outcome: "Data produced from this program is fully normalised and will be very valuable",
    targetBuyer: "Researchers",
    data: "Activity, Workouts",
    url: "https://itheum.com/program",
    dc: "Strava Fitness Data",
    id: "foo",
    canJoin: 0,
  },
};

export const tmpProgIdMapping = {
  "70dc6bd0-59b0-11e8-8d54-2d562f6cba54": "Red Heart Challenge",
  "bc9ce3e0-8f00-11e7-b1ff-9fef83fc8a42": "Hypertension Insights Intense",
  "476ab840-1cb7-11e9-84fe-e935b365220a": "Blood Pressure OnDemand",
  "183f0290-f726-11e7-9186-3bcb5c5d22db": "Chronic Wounds Healing Progress Tracker",
  "ef62c220-50e1-11e7-9bd2-2f33680a66b6": "Blood Pressure Tracker",
  "48d7b020-eab0-11ea-a466-0334ff0e8bf2": "OkPulse",
  "custom-gamer-activity": "Gamer Passport Activity",
  "playstation-gamer-passport": "Sony Playstation Gamer Passport",
};

export const isValidNumericDecimalCharacter = (char: any) => {
  return char.match(/[0-9.]/);
};

export const dataCATDemoUserData = {
  "lastName": "User",
  "firstName": "DexDemo",
  "programsAllocation": [
    {
      "program": "playstation-gamer-passport",
      "group": "custom",
      "userId": "custom-x",
      "status": "stop",
      "shortId": "1",
      "type": "1",
      "fromTs": 1528448026784,
      "toTs": 1535951753305,
      additionalInformation: {
        "programName": "Sony Playstation Data Passport",
        "dataStreamURL": "https://api.itheumcloud-stg.com/hosteddataassets/playstation_gamer_1_data_passport.json",
        "dataPreviewURL": "https://api.itheumcloud-stg.com/hosteddataassets/playstation_gamer_1_data_passport_preview.json",
        "img": "sony-playstation-data-passport",
        "description":
          "Unlock a live dataset of a Sony Playstation gamer's platform, preferences, active titles played, trophies, playtime, and achievements. All sourced direct from the gamer!",
      },
    },
  ],
};

export const styleStrings = {
  gradientBorderMulticolor: "linear-gradient(black, black) padding-box, linear-gradient(to left top, #00C797, #FF439D) border-box",
  gradientBorderMulticolorLight: "linear-gradient(white, white) padding-box, linear-gradient(to left top, #00C797, #FF439D) border-box",
  gradientBorderPassive: "linear-gradient(#0F0F0F, #0F0F0F) padding-box, linear-gradient(to right, rgb(79 209 197 / 20%), rgb(79 209 197 / 60%)) border-box",
  gradientBorderPassiveLight: "linear-gradient(white, white) padding-box, linear-gradient(to right, rgb(79 209 197 / 20%), rgb(79 209 197 / 60%)) border-box",
  gradientBorderMulticolorToBottomRight: "linear-gradient(#0F0F0F, #0F0F0F) padding-box, linear-gradient(to left top, #00C797, #FF439D) border-box",
  gradientBorderMulticolorToBottomRightLight: "linear-gradient(white, white) padding-box, linear-gradient(to left top, #00C797, #FF439D) border-box",
};

export interface GuardRailsInfo {
  accepted_tokens: string;
  accepted_payments: string;
  maximum_payment_fees: number;
  discount_fee_percentage_buyer: number;
  discount_fee_percentage_seller: number;
  percentage_cut_from_buyer: number;
  percentage_cut_from_seller: number;
  buyer_fee: Array<number>;
  seller_fee: number;
}

export const historicGuardrails = [
  {
    id: 0,
    buyer_fee_oldPrice: null,
    buyer_fee_newPrice: null,
    date: "20 Jul 23 10:00:00",
    seller_fee_oldPrice: null,
    seller_fee_newPrice: null,
    maximum_payment_fees: "1000",
    minimum_royalties_oldPrice: null,
    minimum_royalties_newPrice: null,
    maximum_royalties_oldPrice: null,
    maximum_royalties_newPrice: null,
    time_between_mints_oldPrice: null,
    time_between_mints_newPrice: null,
    transaction_limitation_old: null,
    transaction_limitation_new: null,
    max_data_nft_supply: null,
    antiSpam_tax_oldPrice: null,
    antiSpam_tax_newPrice: null,
    accepted_payments: null,
    accepted_tokens: null,
  },
  {
    id: 1,
    buyer_fee_oldPrice: null,
    buyer_fee_newPrice: null,
    date: "27 Jul 23 10:00:00",
    seller_fee_oldPrice: null,
    seller_fee_newPrice: null,
    maximum_payment_fees: "10000",
    minimum_royalties_oldPrice: null,
    minimum_royalties_newPrice: null,
    maximum_royalties_oldPrice: null,
    maximum_royalties_newPrice: null,
    time_between_mints_oldPrice: null,
    time_between_mints_newPrice: null,
    transaction_limitation_old: null,
    transaction_limitation_new: null,
    max_data_nft_supply: null,
    antiSpam_tax_oldPrice: null,
    antiSpam_tax_newPrice: null,
    accepted_payments: null,
    accepted_tokens: null,
  },
  // {
  //   id: "2",
  //   buyer_fee_oldPrice: "80",
  //   buyer_fee_newPrice: "80",
  //   date: "10/04/2024 14:00:50",
  //   seller_fee_oldPrice: "80",
  //   seller_fee_newPrice: "100",
  //   maximum_payment_fees: "800",
  //   minimum_royalties_oldPrice: "0",
  //   minimum_royalties_newPrice: "0",
  //   maximum_royalties_oldPrice: "90",
  //   maximum_royalties_newPrice: "90",
  //   time_between_mints_oldPrice: "20",
  //   time_between_mints_newPrice: "20",
  //   transaction_limitation_old: 2,
  //   transaction_limitation_new: 2,
  //   max_data_nft_supply: "3000",
  //   antiSpam_tax_oldPrice: "10",
  //   antiSpam_tax_newPrice: "10",
  //   accepted_payments: "ITHEUM",
  //   accepted_tokens: "ITHEUM",
  // },
];

export const upcomingGuardRails = {
  buyer_fee: null,
  seller_fee: null,
  maximum_payment_fees: null,
  minimum_royalties: null,
  maximum_royalties: null,
  time_between_mints: null,
  transaction_limitation: null,
  max_data_nft_supply: null,
  antiSpam_tax: null,
  accepted_payments: null,
  accepted_tokens: null,
};

export const whitelistWallets: Array<string> = [];

export const PREVIEW_DATA_ON_DEVNET_SESSION_KEY = "itm-preview-data-on-devnet";

export const EXPLORER_APP_SUPPORTED_NONCES: Record<string, Record<string, Array<number>>> = {
  "D": {
    "trailblazer": [1],
    "multiversxbubbles": [],
    "multiversxinfographics": [3],
    "nftunes": [2],
  },
  "1": {
    "trailblazer": [1],
    "multiversxbubbles": [2],
    "multiversxinfographics": [3],
    "nftunes": [4],
  },
};

export const EXPLORER_APP_FOR_NONCE: Record<string, Record<string, string>> = {
  "D": {
    "trailblazer": "https://test.explorer.itheum.io/project-trailblazer",
    "multiversxbubbles": "https://test.explorer.itheum.io/multiversx-bubbles",
    "multiversxinfographics": "https://test.explorer.itheum.io/multiversx-infographics",
    "nftunes": "https://test.explorer.itheum.io/nftunes",
  },
  "1": {
    "trailblazer": "https://explorer.itheum.io/project-trailblazer",
    "multiversxbubbles": "https://explorer.itheum.io/multiversx-bubbles",
    "multiversxinfographics": "https://explorer.itheum.io/multiversx-infographics",
    "nftunes": "https://explorer.itheum.io/nftunes",
  },
};
