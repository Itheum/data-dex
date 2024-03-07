import React, { PropsWithChildren, useEffect } from "react";
import { BondContract, DataNftMarket, MarketplaceRequirements } from "@itheum/sdk-mx-data-nft/out";
import { Address } from "@multiversx/sdk-core/out";
import { useGetAccountInfo, useGetNetworkConfig, useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks";
import { useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useSearchParams } from "react-router-dom";
import {
  contractsForChain,
  getFavoritesFromBackendApi,
  getHealthCheckFromBackendApi,
  getMarketplaceHealthCheckFromBackendApi,
  getMarketRequirements,
} from "libs/MultiversX";
import { getAccountTokenFromApi, getItheumPriceFromApi } from "libs/MultiversX/api";
import { DataNftMintContract } from "libs/MultiversX/dataNftMint";
import { convertWeiToEsdt, tokenDecimals } from "libs/utils";
import { useAccountStore, useMarketStore, useMintStore } from "store";

export const StoreProvider = ({ children }: PropsWithChildren) => {
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { tokenLogin } = useGetLoginInfo();
  const { chainID } = useGetNetworkConfig();
  const [searchParams] = useSearchParams();

  // ACCOUNT STORE
  const favoriteNfts = useAccountStore((state) => state.favoriteNfts);
  const updateItheumBalance = useAccountStore((state) => state.updateItheumBalance);
  const updateAccessToken = useAccountStore((state) => state.updateAccessToken);
  const updateFavoriteNfts = useAccountStore((state) => state.updateFavoriteNfts);

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
  const updateLockPeriodForBond = useMintStore((state) => state.updateLockPeriodForBond);

  const bondingContract = new BondContract(chainID === "D" ? "devnet" : "mainnet");
  const marketContractSDK = new DataNftMarket(chainID === "D" ? "devnet" : "mainnet");
  const mintContract = new DataNftMintContract(chainID);

  useEffect(() => {
    (async () => {
      const bondingAmount = await bondingContract.viewLockPeriodsWithBonds();
      // console.log(bondingAmount);
      updateLockPeriodForBond(bondingAmount);
    })();
  }, []);

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    updateAccessToken(accessToken ?? "");
  }, [address]);

  useEffect(() => {
    (async () => {
      const _isApiUp = await getHealthCheckFromBackendApi(chainID);
      updateIsApiUp(_isApiUp);
    })();

    (async () => {
      const _isMarketplaceApiUp = await getMarketplaceHealthCheckFromBackendApi(chainID);
      updateIsMarketplaceApiUp(_isMarketplaceApiUp);
    })();
  }, [isApiUp]);

  useEffect(() => {
    (async () => {
      let _marketRequirements: MarketplaceRequirements | undefined;
      _marketRequirements = await getMarketRequirements(chainID);
      if (_marketRequirements) {
        updateMarketRequirements(_marketRequirements);
      } else {
        _marketRequirements = await marketContractSDK.viewRequirements();
        updateMarketRequirements(_marketRequirements);
      }

      // const _marketRequirements = await marketContract.viewRequirements();

      const _maxPaymentFeeMap: Record<string, number> = {};
      if (_marketRequirements) {
        for (let i = 0; i < _marketRequirements.acceptedPayments.length; i++) {
          _maxPaymentFeeMap[_marketRequirements.acceptedPayments[i]] = convertWeiToEsdt(
            _marketRequirements.maximumPaymentFees[i],
            tokenDecimals(_marketRequirements.acceptedPayments[i])
          ).toNumber();
        }
      }
      updateMaxPaymentFeeMap(_maxPaymentFeeMap);
    })();

    (async () => {
      const _isMarketPaused = await marketContractSDK.viewContractPauseState();
      updateIsMarketPaused(_isMarketPaused);
    })();
  }, [chainID]);

  useEffect(() => {
    if (!address) return;
    if (hasPendingTransactions) return;

    (async () => {
      const _token = await getAccountTokenFromApi(address, contractsForChain(chainID).itheumToken, chainID);
      const balance = _token ? convertWeiToEsdt(_token.balance, _token.decimals).toNumber() : 0;
      updateItheumBalance(balance);
    })();

    (async () => {
      const _userData = await mintContract.getUserDataOut(new Address(address), contractsForChain(chainID).itheumToken);
      updateUserData(_userData);
    })();
  }, [address, hasPendingTransactions]);

  const getItheumPrice = () => {
    (async () => {
      const _itheumPrice = (await getItheumPriceFromApi()) ?? 0;
      updateItheumPrice(_itheumPrice);
    })();
  };

  const getFavourite = async () => {
    if (tokenLogin?.nativeAuthToken) {
      const bearerToken = tokenLogin?.nativeAuthToken;
      const getFavourites = await getFavoritesFromBackendApi(chainID, bearerToken);
      updateFavoriteNfts(getFavourites);
    }
  };

  useEffect(() => {
    getFavourite();
  }, [favoriteNfts.length]);

  useEffect(() => {
    getItheumPrice();
    const interval = setInterval(() => {
      getItheumPrice();
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
};
