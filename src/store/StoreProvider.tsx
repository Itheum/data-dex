import React, { PropsWithChildren, useEffect } from "react";
import { useGetAccountInfo, useGetNetworkConfig, useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks";
import { useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { NativeAuthClient } from "@multiversx/sdk-native-auth-client";
import { useSearchParams } from "react-router-dom";
import { contractsForChain, getHealthCheckFromBackendApi, getMarketplaceHealthCheckFromBackendApi } from "libs/MultiversX";
import { getAccountTokenFromApi, getItheumPriceFromApi } from "libs/MultiversX/api";
import { DataNftMarketContract } from "libs/MultiversX/dataNftMarket";
import { DataNftMintContract } from "libs/MultiversX/dataNftMint";
import { convertWeiToEsdt, tokenDecimals } from "libs/utils";
import { routeChainIDBasedOnLoggedInStatus } from "libs/utils/util";
import { useAccountStore, useMarketStore, useMintStore } from "store";

export const StoreProvider = ({ children }: PropsWithChildren) => {
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { chainID } = useGetNetworkConfig();
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();
  const [ searchParams ] = useSearchParams();

  const routedChainID = routeChainIDBasedOnLoggedInStatus(isMxLoggedIn, chainID);

  // ACCOUNT STORE
  const updateItheumBalance = useAccountStore((state) => state.updateItheumBalance);
  const updateAccessToken = useAccountStore((state) => state.updateAccessToken);

  // MARKET STORE
  const updateMarketRequirements = useMarketStore((state) => state.updateMarketRequirements);
  const updateMaxPaymentFeeMap = useMarketStore((state) => state.updateMaxPaymentFeeMap);
  const updateItheumPrice = useMarketStore((state) => state.updateItheumPrice);
  const updateIsMarketPaused = useMarketStore((state) => state.updateIsMarketPaused);
  const isApiUp = useMarketStore((state) => state.isApiUp);
  const updateIsApiUp = useMarketStore((state) => state.updateIsApiUp);
  const updateIsMarketplaceApiUp = useMarketStore((state) => state.updateIsMarketplaceApiUp);

  // MINT STORE
  const updateUserData = useMintStore((state) => state.updateUserData);

  const marketContract = new DataNftMarketContract(routedChainID);
  const mintContract = new DataNftMintContract(routedChainID);

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    updateAccessToken(accessToken ?? "");
  }, [address]);

  useEffect(() => {
    (async () => {
      const _isApiUp = await getHealthCheckFromBackendApi(routedChainID);
      updateIsApiUp(_isApiUp);
    })();

    (async () => {
      const _isMarketplaceApiUp = await getMarketplaceHealthCheckFromBackendApi(routedChainID);
      updateIsMarketplaceApiUp(_isMarketplaceApiUp);
    })();
  }, [isApiUp]);

  useEffect(() => {
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
  }, [routedChainID]);

  useEffect(() => {
    if (!address) return;
    if (hasPendingTransactions) return;

    (async () => {
      const _token = await getAccountTokenFromApi(address, contractsForChain(routedChainID).itheumToken, routedChainID);
      const balance = _token ? convertWeiToEsdt(_token.balance, _token.decimals).toNumber() : 0;
      updateItheumBalance(balance);
    })();

    (async () => {
      const _userData = await mintContract.getUserDataOut(address, contractsForChain(routedChainID).itheumToken);
      updateUserData(_userData);
    })();
  }, [address, hasPendingTransactions, routedChainID]);

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
