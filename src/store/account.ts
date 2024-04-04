import { create } from "zustand";

type State = {
  itheumBalance: number;
  accessToken: string;
  favoriteNfts: Array<string>;
  bitzBalance: number;
};

type Action = {
  updateItheumBalance: (itheumBalance: State["itheumBalance"]) => void;
  updateAccessToken: (accessToken: State["accessToken"]) => void;
  updateFavoriteNfts: (favoriteNfts: State["favoriteNfts"]) => void;
  updateBitzBalance: (bitzBalance: State["bitzBalance"]) => void;
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
}));
