import { create } from "zustand";
import packageJson from "../../package.json";

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
  appVersion: JSON.stringify(packageJson.version),
  updateAppVersion: (newAppVersion) => set({ appVersion: newAppVersion }),
}));
