import { create } from "zustand";
import { UserDataType } from "libs/MultiversX/types";

type State = {
  userData: UserDataType | undefined;
  lockPeriodForBond: Array<{ lockPeriod: string; amount: string }>;
};

type Action = {
  updateUserData: (userData: State["userData"]) => void;
  updateLockPeriodForBond: (userData: State["lockPeriodForBond"]) => void;
};

export const useMintStore = create<State & Action>((set) => ({
  userData: undefined,
  lockPeriodForBond: [],
  updateUserData: (value: UserDataType | undefined) => set(() => ({ userData: value })),
  updateLockPeriodForBond: (value: Array<{ lockPeriod: string; amount: string }>) => set(() => ({ lockPeriodForBond: value })),
}));
