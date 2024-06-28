import { create } from "zustand";

type State = {
  itheumBalance: number;
  accessToken: string;
  favoriteNfts: Array<string>;
  bitzBalance: number;
  givenBitzSum: number;
  bonusBitzSum: number;
  cooldown: number;
};

type Action = {
  updateItheumBalance: (itheumBalance: State["itheumBalance"]) => void;
  updateAccessToken: (accessToken: State["accessToken"]) => void;
  updateFavoriteNfts: (favoriteNfts: State["favoriteNfts"]) => void;
  updateBitzBalance: (bitzBalance: State["bitzBalance"]) => void;
  updateGivenBitzSum: (givenBitzSum: State["givenBitzSum"]) => void;
  updateBonusBitzSum: (bonusBitzSum: State["bonusBitzSum"]) => void;
  updateCooldown: (cooldown: State["cooldown"]) => void;
};

export const useAccountStore = create<State & Action>((set) => ({
  itheumBalance: 0,
  updateItheumBalance: (value: number) => set(() => ({ itheumBalance: value })),
  accessToken: "",
  updateAccessToken: (value: string) => set(() => ({ accessToken: value })),
  favoriteNfts: [],
  updateFavoriteNfts: (value: Array<string>) => set(() => ({ favoriteNfts: value })),
  bitzBalance: -2,
  updateBitzBalance: (value: number) => set(() => ({ bitzBalance: value })),
  cooldown: -2,
  updateCooldown: (value: number) => set(() => ({ cooldown: value })),
  givenBitzSum: -2,
  updateGivenBitzSum: (value: number) => set(() => ({ givenBitzSum: value })),
  bonusBitzSum: -2,
  updateBonusBitzSum: (value: number) => set(() => ({ bonusBitzSum: value })),
}));
