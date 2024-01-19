import { create } from "zustand";

type State = {
  itheumBalance: number;
  accessToken: string;
  favoriteNfts: Array<string>;
};

type Action = {
  updateItheumBalance: (itheumBalance: State["itheumBalance"]) => void;
  updateAccessToken: (accessToken: State["accessToken"]) => void;
  updateFavoriteNfts: (favoriteNfts: State["favoriteNfts"]) => void;
};

export const useAccountStore = create<State & Action>((set) => ({
  itheumBalance: 0,
  updateItheumBalance: (value: number) => set(() => ({ itheumBalance: value })),
  accessToken: "",
  updateAccessToken: (value: string) => set(() => ({ accessToken: value })),
  favoriteNfts: [],
  updateFavoriteNfts: (value: Array<string>) => set(() => ({ favoriteNfts: value })),
}));
