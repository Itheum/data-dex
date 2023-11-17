import { create } from "zustand";
import { UserDataType } from "libs/MultiversX/types";

type State = {
  userData: UserDataType | undefined;
  tokenDecimals: number;
};

type Action = {
  updateUserData: (userData: State["userData"]) => void;
  updateTokenDecimals: (tokenDecimals: State["tokenDecimals"]) => void;
};

export const useMintStore = create<State & Action>((set) => ({
  userData: undefined,
  tokenDecimals: 0,
  updateUserData: (value: UserDataType | undefined) => set(() => ({ userData: value })),
  updateTokenDecimals: (value: number | undefined) => set(() => ({ tokenDecimals: value })),
}));
