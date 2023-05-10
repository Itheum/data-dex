import { create } from 'zustand';
import { MarketplaceRequirementsType } from 'MultiversX/types';

type State = {
  marketRequirements: MarketplaceRequirementsType | undefined,
}

type Action = {
  updateMarketRequirements: (marketRequirements: State['marketRequirements']) => void,
}

export const useMarketStore = create<State & Action>((set) => ({
  marketRequirements: undefined,
  updateMarketRequirements: (value: MarketplaceRequirementsType | undefined) => set(() => ({ marketRequirements: value })),
}));
