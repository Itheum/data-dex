import { create } from "zustand";
import { MarketplaceRequirementsType, OfferType } from "libs/MultiversX/types";

type State = {
  itheumPrice: number;
  marketRequirements: MarketplaceRequirementsType | undefined;
  maxPaymentFeeMap: Record<string, number>;
  isMarketPaused: boolean;

  isApiUp: boolean;
  isMarketplaceApiUp: boolean;
  offers: Array<OfferType>;
  loadingOffers: boolean;
  pageCount: number;
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
};

export const useMarketStore = create<State & Action>((set) => ({
  itheumPrice: 0,
  marketRequirements: undefined,
  maxPaymentFeeMap: {},
  isMarketPaused: false,
  updateItheumPrice: (value: number) => set((state) => ({ ...state, itheumPrice: value })),
  updateMarketRequirements: (value: MarketplaceRequirementsType | undefined) => set((state) => ({ ...state, marketRequirements: value })),
  updateMaxPaymentFeeMap: (value: Record<string, number>) => set((state) => ({ ...state, maxPaymentFeeMap: value })),
  updateIsMarketPaused: (value: boolean) => set((state) => ({ ...state, isMarketPaused: value })),

  isApiUp: true,
  isMarketplaceApiUp: true,
  offers: [],
  loadingOffers: true,
  pageCount: 1,
  updateIsApiUp: (value: boolean) => set((state) => ({ ...state, isApiUp: value })),
  updateIsMarketplaceApiUp: (value: boolean) => set((state) => ({ ...state, isMarketplaceApiUp: value })),
  updateOffers: (value: Array<OfferType>) => set((state) => ({ ...state, offers: value })),
  updateLoadingOffers: (value: boolean) => set((state) => ({ ...state, loadingOffers: value })),
  updatePageCount: (value: number) => set((state) => ({ ...state, pageCount: value })),
}));
