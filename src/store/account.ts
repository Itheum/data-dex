import { create } from "zustand";

type State = {
  itheumBalance: number;
  accessToken: string;
  appVersion: string | undefined;
};

type Action = {
  updateItheumBalance: (itheumBalance: State["itheumBalance"]) => void;
  updateAccessToken: (accessToken: State["accessToken"]) => void;
  updateAppVersion: (newAppVersion: State["appVersion"]) => void;
};

export const useAccountStore = create<State & Action>((set) => ({
  itheumBalance: 0,
  updateItheumBalance: (value: number) => set(() => ({ itheumBalance: value })),
  accessToken: "",
  updateAccessToken: (value: string) => set(() => ({ accessToken: value })),
  appVersion: JSON.stringify(import.meta.env.VITE_VERSION),
  updateAppVersion: (newAppVersion) => set({ appVersion: newAppVersion }),
}));
