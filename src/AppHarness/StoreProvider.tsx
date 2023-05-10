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
import { useAccountStore, useMarketStore, useMintStore } from "store";
import { useChainMeta } from "store/ChainMetaContext";
import { useUser } from "store/UserContext";
import { DataNftMintContract } from "MultiversX/dataNftMint";

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
  const marketFreezedNonces = useMarketStore((state) => state.marketFreezedNonces);
  const updateMarketFreezedNonces = useMarketStore((state) => state.updateMarketFreezedNonces);
  const userDataOut = useMintStore((state) => state.userData);
  const updateUserData = useMintStore((state) => state.updateUserData);

  console.log('itheumBalance', itheumBalance);
  console.log('marketRequirements', marketRequirements);
  console.log('marketFreezedNonces', marketFreezedNonces);
  console.log('userDataOut', userDataOut);

  const marketContract = new DataNftMarketContract(networkId);
  const mintContract = new DataNftMintContract(networkId);
  
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

    (async () => {
      const _userDataOut = await mintContract.getUserDataOut(address, chainMeta.contracts.itheumToken);
      updateUserData(_userDataOut);
    })();

    (async () => {
      const _marketFreezedNonces = await mintContract.getSftsFrozenForAddress(address);
      updateMarketFreezedNonces(_marketFreezedNonces);
    })();
  }, [chainMeta, address, hasPendingTransactions]);

  return <>{children}</>;
};
