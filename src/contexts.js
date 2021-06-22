import { createContext } from 'react';

export const chainMeta = {
  networkId: null,
  contract: null
};

export const ChainMetaContext = createContext(chainMeta);