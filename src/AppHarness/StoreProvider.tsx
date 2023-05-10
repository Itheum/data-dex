import React, { PropsWithChildren, useEffect, useState } from "react";
import {
  useGetAccountInfo,
  useGetLoginInfo,
  useGetNetworkConfig,
  useGetPendingTransactions,
} from "@multiversx/sdk-dapp/hooks";
import { contractsForChain, convertWeiToEsdt } from "libs/util";
import { getAccountTokenFromApi } from "MultiversX/api";
import { DataNftMarketContract } from "MultiversX/dataNftMarket";
import { useAccountStore, useMarketStore } from "store";
import { useChainMeta } from "store/ChainMetaContext";
import { useUser } from "store/UserContext";

export const StoreProvider = ({ children }: PropsWithChildren) => {
  const { chainID } = useGetNetworkConfig();
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { chainMeta } = useChainMeta();

  const networkId = chainID === "1" ? "E1" : "ED";

  //
  const itheumBalance = useAccountStore((state) => state.itheumBalance);
  const updateItheumBalance = useAccountStore((state) => state.updateItheumBalance);
  const marketRequirements = useMarketStore((state) => state.marketRequirements);
  const updateMarketRequirements = useMarketStore((state) => state.updateMarketRequirements);
  console.log('itheumBalance', itheumBalance);
  console.log('marketRequirements', marketRequirements);

  const marketContract = new DataNftMarketContract(networkId);
  
  useEffect(() => {
    if (!chainMeta) return;

    (async () => {
      const _marketRequirements = await marketContract.viewRequirements();
      updateMarketRequirements(_marketRequirements);
    })();
  }, [chainMeta]);

  useEffect(() => {
    if (!chainMeta || !address) return;
    if (hasPendingTransactions) return;

    (async () => {
      const _token = await getAccountTokenFromApi(address, chainMeta.contracts.itheumToken, chainMeta.networkId);
      const balance = _token ? convertWeiToEsdt(_token.balance, _token.decimals).toNumber() : 0;
      updateItheumBalance(balance);
    })();
  }, [chainMeta, address, hasPendingTransactions]);

  return <>{children}</>;
};
