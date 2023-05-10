import { create } from 'zustand';
import { MarketplaceRequirementsType } from 'MultiversX/types';

type State = {
  marketRequirements: MarketplaceRequirementsType | undefined,
  marketFreezedNonces: number[],
}

type Action = {
  updateMarketRequirements: (marketRequirements: State['marketRequirements']) => void,
  updateMarketFreezedNonces: (marketFreezedNonces: State['marketFreezedNonces']) => void,
}

export const useMarketStore = create<State & Action>((set) => ({
  marketRequirements: undefined,
  marketFreezedNonces: [],
  updateMarketRequirements: (value: MarketplaceRequirementsType | undefined) => set((state) => ({ ...state, marketRequirements: value })),
  updateMarketFreezedNonces: (value: number[]) => set((state) => ({ ...state, marketFreezedNonces: value })),
}));
