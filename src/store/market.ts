import { MarketplaceRequirements } from "@itheum/sdk-mx-data-nft/out";
import { create } from "zustand";
import { AddressBoughtOffer, ExtendedOffer } from "libs/types";

type State = {
  itheumPrice: number;
  marketRequirements: MarketplaceRequirements;
  maxPaymentFeeMap: Record<string, number>;
  isMarketPaused: boolean;
  isApiUp: boolean;
  isMarketplaceApiUp: boolean;
  offers: Array<ExtendedOffer>;
  loadingOffers: boolean;
  pageCount: number;
  addressBoughtOffers: Array<AddressBoughtOffer>;
};

type Action = {
  updateItheumPrice: (itheumPrice: State["itheumPrice"]) => void;
  updateMarketRequirements: (marketRequirements: State["marketRequirements"]) => void;
  updateMaxPaymentFeeMap: (maxPaymentFeeMap: State["maxPaymentFeeMap"]) => void;
  updateIsMarketPaused: (isMarketPaused: State["isMarketPaused"]) => void;

  updateIsApiUp: (isApiUp: State["isApiUp"]) => void;
  updateIsMarketplaceApiUp: (isApiUp: State["isMarketplaceApiUp"]) => void;
  updateOffers: (offers: State["offers"]) => void;
  updateLoadingOffers: (loadingOffers: State["loadingOffers"]) => void;
  updatePageCount: (pageCount: State["pageCount"]) => void;
  updateAddressBoughtOffers: (addressBoughtOffers: State["addressBoughtOffers"]) => void;
};

export const useMarketStore = create<State & Action>((set) => ({
  itheumPrice: 0,
  marketRequirements: {
    "acceptedTokens": ["DATANFTFT4-3ba099", "INSP-a65b3b", "DATALT1-4e6fb5"],
    "acceptedPayments": ["ITHEUM-a61317"],
    "maximumPaymentFees": ["10000000000000000000000"],
    "buyerTaxPercentage": 200,
    "sellerTaxPercentage": 200,
    "buyerTaxPercentageDiscount": 0,
    "sellerTaxPercentageDiscount": 0,
    "maxDefaultQuantity": 0,
  },
  maxPaymentFeeMap: {},
  isMarketPaused: false,
  updateItheumPrice: (value: number) => set((state) => ({ ...state, itheumPrice: value })),
  updateMarketRequirements: (value: MarketplaceRequirements | undefined) => set((state) => ({ ...state, marketRequirements: value })),
  updateMaxPaymentFeeMap: (value: Record<string, number>) => set((state) => ({ ...state, maxPaymentFeeMap: value })),
  updateIsMarketPaused: (value: boolean) => set((state) => ({ ...state, isMarketPaused: value })),

  isApiUp: true,
  isMarketplaceApiUp: true,
  offers: [],
  loadingOffers: true,
  pageCount: 1,
  updateIsApiUp: (value: boolean) => set((state) => ({ ...state, isApiUp: value })),
  updateIsMarketplaceApiUp: (value: boolean) => set((state) => ({ ...state, isMarketplaceApiUp: value })),
  updateOffers: (value: Array<ExtendedOffer>) => set((state) => ({ ...state, offers: value })),
  updateLoadingOffers: (value: boolean) => set((state) => ({ ...state, loadingOffers: value })),
  updatePageCount: (value: number) => set((state) => ({ ...state, pageCount: value })),

  addressBoughtOffers: [],
  updateAddressBoughtOffers: (value: any) => set((state) => ({ ...state, addressBoughtOffers: value })),
}));
