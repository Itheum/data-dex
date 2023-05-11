import { create } from 'zustand';
import { MarketplaceRequirementsType } from 'MultiversX/types';

type State = {
  itheumPrice: number,
  marketRequirements: MarketplaceRequirementsType | undefined,
  maxPaymentFeeMap: Record<string, number>,
}

type Action = {
  updateItheumPrice: (itheumPrice: State['itheumPrice']) => void,
  updateMarketRequirements: (marketRequirements: State['marketRequirements']) => void,
  updateMaxPaymentFeeMap: (maxPaymentFeeMap: State['maxPaymentFeeMap']) => void,
}

export const useMarketStore = create<State & Action>((set) => ({
  itheumPrice: 0,
  marketRequirements: undefined,
  maxPaymentFeeMap: {},
  updateItheumPrice: (value: number) => set((state) => ({ ...state, itheumPrice: value })),
  updateMarketRequirements: (value: MarketplaceRequirementsType | undefined) => set((state) => ({ ...state, marketRequirements: value })),
  updateMaxPaymentFeeMap: (value: Record<string, number>) => set((state) => ({ ...state, maxPaymentFeeMap: value })),
}));
