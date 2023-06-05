import React, { ReactElement, createContext, useState, useContext } from "react";
import { ChainMetaType } from "libs/types";

export interface ChainMetaContextType {
  chainMeta: ChainMetaType;
  setChainMeta: (e: ChainMetaType) => void;
}

const defaultContext: ChainMetaContextType = {
  chainMeta: {
    networkId: "ED",
    contracts: {
      itheumToken: "",
      claims: "",
      faucet: "",
    },
    walletUsed: "",
  },
  setChainMeta: (e: ChainMetaType) => {
    console.log("Empty setChainMeta", e);
  },
};

const ChainMetaContext = createContext<ChainMetaContextType>(defaultContext);

export const ChainMetaContextProvider = ({ children }: { children: ReactElement }) => {
  const [chainMeta, setChainMeta] = useState<ChainMetaType>(defaultContext.chainMeta);

  return <ChainMetaContext.Provider value={{ chainMeta, setChainMeta }}>{children}</ChainMetaContext.Provider>;
};

export const useChainMeta = (): ChainMetaContextType => {
  const context: ChainMetaContextType = useContext(ChainMetaContext);
  if (context === undefined) throw Error("useChainMeta must be wrapped inside chainMetaContextProvider");
  return context;
};
