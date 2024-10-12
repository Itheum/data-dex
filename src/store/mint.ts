import BigNumber from "bignumber.js";
import { create } from "zustand";
import { UserDataType } from "libs/MultiversX/types";

type State = {
  userData: UserDataType | undefined; ///TODO ADD SOL CONFIG, BOndingConfig
  lockPeriodForBond: Array<{ lockPeriod: number; amount: BigNumber.Value }>;
};

type Action = {
  updateUserData: (userData: State["userData"]) => void;
  updateLockPeriodForBond: (userData: State["lockPeriodForBond"]) => void;
};

export const useMintStore = create<State & Action>((set) => ({
  userData: undefined,
  lockPeriodForBond: [],
  updateUserData: (value: UserDataType | undefined) => set(() => ({ userData: value })),
  updateLockPeriodForBond: (value: Array<{ lockPeriod: number; amount: BigNumber.Value }>) => set(() => ({ lockPeriodForBond: value })),
}));
