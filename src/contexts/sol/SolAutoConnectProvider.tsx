import React, { useState } from "react";

import { createContext, FC, ReactNode, useContext } from "react";
import { useLocalStorage } from "@solana/wallet-adapter-react";

export interface AutoConnectContextState {
  autoConnect: boolean;
  setAutoConnect(autoConnect: boolean): void;
}

export const AutoConnectContext = createContext<AutoConnectContextState>({} as AutoConnectContextState);

export function useSolAutoConnect(): AutoConnectContextState {
  return useContext(AutoConnectContext);
}

export const SolAutoConnectProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // TODO: fix auto connect to actual reconnect on refresh/other.
  // TODO: make switch/slider settings
  // const [autoConnect, setAutoConnect] = useLocalStorage('autoConnect', false);
  const [autoConnect, setAutoConnect] = useLocalStorage("autoConnect", true);

  return <AutoConnectContext.Provider value={{ autoConnect, setAutoConnect }}>{children}</AutoConnectContext.Provider>;
};
