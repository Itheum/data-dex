import { DataNft } from "@itheum/sdk-mx-data-nft/out";
import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import { create } from "zustand";

type State = {
  mvxNfts: DataNft[];
  isLoadingMvx: boolean;
  solNfts: DasApiAsset[];
  isLoadingSol: boolean;
};

type Action = {
  updateMvxNfts: (mvxNfts: State["mvxNfts"]) => void;
  updateIsLoadingMvx: (isLoading: boolean) => void;
  updateSolNfts: (solNfts: State["solNfts"]) => void;
  updateIsLoadingSol: (isLoading: boolean) => void;
};

export const useNftsStore = create<State & Action>((set) => ({
  mvxNfts: [],
  updateMvxNfts: (value: DataNft[]) => set(() => ({ mvxNfts: value })),
  isLoadingMvx: false,
  updateIsLoadingMvx: (value: boolean) => set(() => ({ isLoadingMvx: value })),
  solNfts: [],
  updateSolNfts: (value: DasApiAsset[]) => set(() => ({ solNfts: value })),
  isLoadingSol: false,
  updateIsLoadingSol: (value: boolean) => set(() => ({ isLoadingSol: value })),
}));
