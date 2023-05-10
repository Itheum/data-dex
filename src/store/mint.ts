import { create } from 'zustand';
import { UserDataType } from 'MultiversX/types';

type State = {
  userData: UserDataType | undefined,
}

type Action = {
  updateUserData: (userData: State['userData']) => void,
}

export const useMintStore = create<State & Action>((set) => ({
  userData: undefined,
  updateUserData: (value: UserDataType | undefined) => set(() => ({ userData: value })),
}));
