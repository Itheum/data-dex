import { create } from "zustand";

type State = {
  itheumBalance: number;
};

type Action = {
  updateItheumBalance: (itheumBalance: State["itheumBalance"]) => void;
};

export const useAccountStore = create<State & Action>((set) => ({
  itheumBalance: 0,
  updateItheumBalance: (value: number) => set(() => ({ itheumBalance: value })),
}));
