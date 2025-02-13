import { DataNft } from "@itheum/sdk-mx-data-nft/out/datanft";
import BigNumber from "bignumber.js";
import { create } from "zustand";
import { UserDataType } from "libs/MultiversX/types";

type State = {
  userData: UserDataType | undefined;
  lockPeriodForBond: Array<{ lockPeriod: number; amount: BigNumber.Value }>;
  nfmeIdDataNft: DataNft | undefined | null;
};

type Action = {
  updateUserData: (userData: State["userData"]) => void;
  updateLockPeriodForBond: (userData: State["lockPeriodForBond"]) => void;
  updateNfmeIdDataNft: (nfmeIdDataNft: State["nfmeIdDataNft"]) => void;
};

export const useMintStore = create<State & Action>((set) => ({
  userData: undefined,
  lockPeriodForBond: [],
  nfmeIdDataNft: undefined,
  updateUserData: (value: UserDataType | undefined) => set(() => ({ userData: value })),
  updateLockPeriodForBond: (value: Array<{ lockPeriod: number; amount: BigNumber.Value }>) => set(() => ({ lockPeriodForBond: value })),
  updateNfmeIdDataNft: (value: DataNft | undefined | null) => set(() => ({ nfmeIdDataNft: value })),
}));
