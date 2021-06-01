export const dataTemplates = {
  dataPack: {
    sellerEthAddress: null,
    dataPreview: null,
    dataHash: null,
    dataFile: null,
    termsOfUseId: null,
    txHash: null
  },
  dataOrder: {
    state: null,
    reasonToBuy: null,
    dataPackId: null,
    sellerEthAddress: null,
    buyerEthAddress: null,
  },
}

export const MENU = {
  HOME: 0,
  BUY: 1,
  SELL: 2,
  PENDING: 3,
  PURCHASED: 4,
};

export const TERMS = [
  {id: '1', val: "Research Purposes Only", coin: 1},
  {id: '2', val: "Research or Commercial Purposes Only", coin: 1},
  {id: '3', val: "Fully License (any use case)", coin: 3}
];
