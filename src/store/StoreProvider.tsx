import React, { PropsWithChildren, useEffect } from "react";
import { useGetAccountInfo, useGetNetworkConfig, useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks";
import { getAccountTokenFromApi, getApi, getItheumPriceFromApi } from "libs/MultiversX/api";
import { DataNftMarketContract } from "libs/MultiversX/dataNftMarket";
import { DataNftMintContract } from "libs/MultiversX/dataNftMint";
import { backendApi, convertWeiToEsdt, tokenDecimals } from "libs/utils";
import { networkIdBasedOnLoggedInStatus } from "libs/utils/util";
import { useAccountStore, useMarketStore, useMintStore } from "store";
import { useChainMeta } from "store/ChainMetaContext";
import { NativeAuthClient } from "@multiversx/sdk-native-auth-client";
import { useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import axios from "axios";

export const StoreProvider = ({ children }: PropsWithChildren) => {
  const { chainID } = useGetNetworkConfig();
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { chainMeta } = useChainMeta();
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();

  const chainIDToNetworkId = chainID === "1" ? "E1" : "ED"; // convert the mx chainID to our local networkId format
  const networkId = networkIdBasedOnLoggedInStatus(isMxLoggedIn, chainIDToNetworkId);
  const client = new NativeAuthClient({ origin: "datadex.itheum.io", apiUrl: `https://${getApi(networkId)}` });

  // ACCOUNT STORE
  const itheumBalance = useAccountStore((state) => state.itheumBalance);
  const updateItheumBalance = useAccountStore((state) => state.updateItheumBalance);
  const accessToken = useAccountStore((state) => state.accessToken);
  const updateAccessToken = useAccountStore((state) => state.updateAccessToken);

  // MARKET STORE
  const marketRequirements = useMarketStore((state) => state.marketRequirements);
  const updateMarketRequirements = useMarketStore((state) => state.updateMarketRequirements);
  const maxPaymentFeeMap = useMarketStore((state) => state.maxPaymentFeeMap);
  const updateMaxPaymentFeeMap = useMarketStore((state) => state.updateMaxPaymentFeeMap);
  const itheumPrice = useMarketStore((state) => state.itheumPrice);
  const updateItheumPrice = useMarketStore((state) => state.updateItheumPrice);
  const isMarketPaused = useMarketStore((state) => state.isMarketPaused);
  const updateIsMarketPaused = useMarketStore((state) => state.updateIsMarketPaused);
  const isApiUp = useMarketStore((state) => state.isApiUp);
  const updateIsApiUp = useMarketStore((state) => state.updateIsApiUp);

  // MINT STORE
  const userData = useMintStore((state) => state.userData);
  const updateUserData = useMintStore((state) => state.updateUserData);

  // console.log("itheumBalance", itheumBalance);
  // console.log("marketRequirements", marketRequirements);
  // console.log("userData", userData);
  // console.log("maxPaymentFeeMap", maxPaymentFeeMap);
  // console.log("itheumPrice", itheumPrice);
  // console.log("isMarketPaused", isMarketPaused);
  // console.log("Access token", accessToken);

  const marketContract = new DataNftMarketContract(networkId);
  const mintContract = new DataNftMintContract(networkId);
  const backendApiRoute = backendApi(networkId);

  useEffect(() => {
    (async () => {
      const initToken = await client.initialize();
      const parts = initToken.split(".");
      if (parts) {
        const formatToken = address + parts.slice(1).join(".");
        const finalAccessToken = client.getToken(address, initToken, formatToken);
        updateAccessToken(finalAccessToken);
      }
    })();
  }, [address, isMxLoggedIn]);

  useEffect(() => {
    axios
      .get(`${backendApiRoute}`)
      .then((res) => {
        if (res.status === 200) {
          updateIsApiUp(true);
        }
      })
      .catch((err) => {
        if (err) {
          updateIsApiUp(false);
        }
      });
  }, [isApiUp]);

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
      const _token = await getAccountTokenFromApi(address, chainMeta.contracts.itheumToken, networkId);
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
