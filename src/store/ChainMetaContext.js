import { createContext, useState, useContext } from "react";

const chainMetaContext = createContext({});

export const ChainMetaContextProvider = ({children}) => {
  const [chainMeta, setChainMeta] = useState({});

  return (
    <chainMetaContext.Provider value={{chainMeta, setChainMeta}}>
      {children}
    </chainMetaContext.Provider>
  );
}

export const useChainMeta = () => {
  const context = useContext(chainMetaContext);
  if (context === undefined) throw Error ("useChainMeta must be wrapped inside chainMetaContextProvider");
  return context;
 }
