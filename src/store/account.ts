import { create } from "zustand";

type State = {
  itheumBalance: number;
  accessToken: string;
  favoriteNfts: Array<string>;

  bitzBalance: number;
  givenBitzSum: number;
  bonusBitzSum: number;
  cooldown: number;
  collectedBitzSum: number;
  bonusTries: number;

  solPreaccessNonce: string;
  solPreaccessSignature: string;
  solPreaccessTimestamp: number;
};

type Action = {
  updateItheumBalance: (itheumBalance: State["itheumBalance"]) => void;
  updateAccessToken: (accessToken: State["accessToken"]) => void;
  updateFavoriteNfts: (favoriteNfts: State["favoriteNfts"]) => void;

  updateBitzBalance: (bitzBalance: State["bitzBalance"]) => void;
  updateCooldown: (cooldown: State["cooldown"]) => void;
  updateGivenBitzSum: (givenBitzSum: State["givenBitzSum"]) => void;
  updateCollectedBitzSum: (collectedBitzSum: State["collectedBitzSum"]) => void;
  updateBonusBitzSum: (bonusBitzSum: State["bonusBitzSum"]) => void;
  updateBonusTries: (bonusTries: State["bonusTries"]) => void;

  updateSolPreaccessNonce: (solPreaccessNonce: State["solPreaccessNonce"]) => void;
  updateSolSignedPreaccess: (solSignedPreaccess: State["solPreaccessSignature"]) => void;
  updateSolPreaccessTimestamp: (solPreaccessTimestamp: State["solPreaccessTimestamp"]) => void;
};

export const useAccountStore = create<State & Action>((set) => ({
  itheumBalance: 0,
  updateItheumBalance: (value: number) => set(() => ({ itheumBalance: value })),
  accessToken: "",
  updateAccessToken: (value: string) => set(() => ({ accessToken: value })),
  favoriteNfts: [],
  updateFavoriteNfts: (value: Array<string>) => set(() => ({ favoriteNfts: value })),

  bitzBalance: -2,
  cooldown: -2,
  givenBitzSum: -2,
  collectedBitzSum: -2,
  bonusBitzSum: -2,
  bonusTries: -2,
  solPreaccessNonce: "",
  solPreaccessSignature: "",
  solPreaccessTimestamp: -2,
  updateBitzBalance: (value: number) => set(() => ({ bitzBalance: value })),
  updateCooldown: (value: number) => set(() => ({ cooldown: value })),
  updateGivenBitzSum: (value: number) => set(() => ({ givenBitzSum: value })),
  updateCollectedBitzSum: (value: number) => set(() => ({ collectedBitzSum: value })),
  updateBonusBitzSum: (value: number) => set(() => ({ bonusBitzSum: value })),
  updateBonusTries: (value: number) => set(() => ({ bonusTries: value })),
  updateSolPreaccessNonce: (value: string) => set(() => ({ solPreaccessNonce: value })),
  updateSolSignedPreaccess: (value: string) => set(() => ({ solPreaccessSignature: value })),
  updateSolPreaccessTimestamp: (value: number) => set(() => ({ solPreaccessTimestamp: value })),
}));
