import React, { ReactElement } from "react";
import { createContext, useState, useContext } from "react";

export interface ChainMetaType {
  chainMeta: any;
  setChainMeta: any;
}

const chainMetaContext = createContext<ChainMetaType>({
  chainMeta: undefined,
  setChainMeta: undefined,
});

export const ChainMetaContextProvider = ({ children }: { children: ReactElement }) => {
  const [chainMeta, setChainMeta] = useState({
    chainMeta: undefined,
    setChainMeta: undefined,
  });

  return <chainMetaContext.Provider value={{ chainMeta, setChainMeta }}>{children}</chainMetaContext.Provider>;
};

export const useChainMeta = (): ChainMetaType => {
  const context: ChainMetaType = useContext(chainMetaContext);
  if (context === undefined) throw Error("useChainMeta must be wrapped inside chainMetaContextProvider");
  return context;
};
