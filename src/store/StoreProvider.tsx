import React, { PropsWithChildren, useEffect } from "react";
import { useGetAccountInfo, useGetNetworkConfig, useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks";
import { getAccountTokenFromApi, getItheumPriceFromApi } from "libs/MultiversX/api";
import { DataNftMarketContract } from "libs/MultiversX/dataNftMarket";
import { DataNftMintContract } from "libs/MultiversX/dataNftMint";
import { convertWeiToEsdt, tokenDecimals } from "libs/utils";
import { useAccountStore, useMarketStore, useMintStore } from "store";
import { useChainMeta } from "store/ChainMetaContext";

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
  const userData = useMintStore((state) => state.userData);
  const updateUserData = useMintStore((state) => state.updateUserData);
  const maxPaymentFeeMap = useMarketStore((state) => state.maxPaymentFeeMap);
  const updateMaxPaymentFeeMap = useMarketStore((state) => state.updateMaxPaymentFeeMap);
  const itheumPrice = useMarketStore((state) => state.itheumPrice);
  const updateItheumPrice = useMarketStore((state) => state.updateItheumPrice);
  const isMarketPaused = useMarketStore((state) => state.isMarketPaused);
  const updateIsMarketPaused = useMarketStore((state) => state.updateIsMarketPaused);

  // console.log("itheumBalance", itheumBalance);
  // console.log("marketRequirements", marketRequirements);
  // console.log("userData", userData);
  // console.log("maxPaymentFeeMap", maxPaymentFeeMap);
  // console.log("itheumPrice", itheumPrice);
  // console.log("isMarketPaused", isMarketPaused);

  const marketContract = new DataNftMarketContract(networkId);
  const mintContract = new DataNftMintContract(networkId);

  useEffect(() => {
    if (!chainMeta) return;

    (async () => {
      const _marketRequirements = await marketContract.viewRequirements();
      updateMarketRequirements(_marketRequirements);

      const _maxPaymentFeeMap: Record<string, number> = {};
      if (_marketRequirements) {
        for (let i = 0; i < _marketRequirements.accepted_payments.length; i++) {
          _maxPaymentFeeMap[_marketRequirements.accepted_payments[i]] = convertWeiToEsdt(
            _marketRequirements.maximum_payment_fees[i],
            tokenDecimals(_marketRequirements.accepted_payments[i])
          ).toNumber();
        }
      }
      updateMaxPaymentFeeMap(_maxPaymentFeeMap);
    })();

    (async () => {
      const _isMarketPaused = await marketContract.getIsPaused();
      updateIsMarketPaused(_isMarketPaused);
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
      const _userData = await mintContract.getUserDataOut(address, chainMeta.contracts.itheumToken);
      updateUserData(_userData);
    })();
  }, [chainMeta, address, hasPendingTransactions]);

  const getItheumPrice = () => {
    (async () => {
      const _itheumPrice = (await getItheumPriceFromApi()) ?? 0;
      updateItheumPrice(_itheumPrice);
    })();
  };
  useEffect(() => {
    getItheumPrice();
    const interval = setInterval(() => {
      getItheumPrice();
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
};
