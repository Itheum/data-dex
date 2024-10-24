import React, { PropsWithChildren, useEffect, useState } from "react";
import { Program } from "@coral-xyz/anchor";
import { BondContract, DataNft, DataNftMarket, MarketplaceRequirements } from "@itheum/sdk-mx-data-nft/out";
import { Address } from "@multiversx/sdk-core/out";
import { useGetAccountInfo, useGetNetworkConfig, useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks";
import { useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { useSearchParams } from "react-router-dom";
import { GET_BITZ_TOKEN, IS_DEVNET, SUPPORTED_MVX_COLLECTIONS, viewDataJSONCore } from "libs/config";
import {
  contractsForChain,
  getAddressBoughtOffersFromBackendApi,
  getFavoritesFromBackendApi,
  getHealthCheckFromBackendApi,
  getMarketplaceHealthCheckFromBackendApi,
  getMarketRequirements,
} from "libs/MultiversX";
import { getAccountTokenFromApi, getItheumPriceFromApi } from "libs/MultiversX/api";
import { DataNftMintContract } from "libs/MultiversX/dataNftMint";
import { BONDING_PROGRAM_ID, SolEnvEnum } from "libs/Solana/config";
import { CoreSolBondStakeSc, IDL } from "libs/Solana/CoreSolBondStakeSc";
import { fetchBondingConfig, fetchSolNfts, ITHEUM_TOKEN_ADDRESS } from "libs/Solana/utils";
import { computeRemainingCooldown, convertWeiToEsdt, decodeNativeAuthToken, tokenDecimals } from "libs/utils";
import { useAccountStore, useMarketStore, useMintStore } from "store";
import { useNftsStore } from "./nfts";

export const StoreProvider = ({ children }: PropsWithChildren) => {
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { tokenLogin } = useGetLoginInfo();
  const { chainID } = useGetNetworkConfig();
  const [searchParams] = useSearchParams();

  // SOLANA
  const { publicKey: solPubKey } = useWallet();
  const { connection } = useConnection();

  // ACCOUNT STORE
  const favoriteNfts = useAccountStore((state) => state.favoriteNfts);
  const updateItheumBalance = useAccountStore((state) => state.updateItheumBalance);
  const updateAccessToken = useAccountStore((state) => state.updateAccessToken);
  const updateFavoriteNfts = useAccountStore((state) => state.updateFavoriteNfts);
  const updateBitzBalance = useAccountStore((state) => state.updateBitzBalance);
  const updateBonusBitzSum = useAccountStore((state) => state.updateBonusBitzSum);
  const updateGivenBitzSum = useAccountStore((state) => state.updateGivenBitzSum);
  const updateCooldown = useAccountStore((state) => state.updateCooldown);

  // MARKET STORE
  const updateMarketRequirements = useMarketStore((state) => state.updateMarketRequirements);
  const updateMaxPaymentFeeMap = useMarketStore((state) => state.updateMaxPaymentFeeMap);
  const updateItheumPrice = useMarketStore((state) => state.updateItheumPrice);
  const updateIsMarketPaused = useMarketStore((state) => state.updateIsMarketPaused);
  const isApiUp = useMarketStore((state) => state.isApiUp);
  const updateIsApiUp = useMarketStore((state) => state.updateIsApiUp);
  const updateIsMarketplaceApiUp = useMarketStore((state) => state.updateIsMarketplaceApiUp);
  const updateAddressBoughtOffers = useMarketStore((state) => state.updateAddressBoughtOffers);

  // MINT STORE
  const updateUserData = useMintStore((state) => state.updateUserData);
  const updateLockPeriodForBond = useMintStore((state) => state.updateLockPeriodForBond);
  const bondingContract = new BondContract(import.meta.env.VITE_ENV_NETWORK);
  const marketContractSDK = new DataNftMarket(import.meta.env.VITE_ENV_NETWORK);
  const mintContract = new DataNftMintContract(chainID);
  DataNft.setNetworkConfig(IS_DEVNET ? "devnet" : "mainnet");

  // NFT Store
  const { updateMvxNfts, updateIsLoadingMvx, updateSolNfts, updateIsLoadingSol } = useNftsStore();
  // flag to check locally if we got the MVX NFTs
  const [mvxNFTsFetched, setMvxNFTsFetched] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      if (!solPubKey && bondingContract) {
        const bondingAmount = await bondingContract.viewLockPeriodsWithBonds();
        updateLockPeriodForBond(bondingAmount);
      }
    })();
  }, []);

  useEffect(() => {
    async function fetchMvxNfts() {
      updateIsLoadingMvx(true);
      if (!address || !(tokenLogin && tokenLogin.nativeAuthToken)) {
        updateMvxNfts([]);
      } else {
        const collections = SUPPORTED_MVX_COLLECTIONS;
        const nftsT = await DataNft.ownedByAddress(address, collections);
        updateMvxNfts(nftsT);
      }
      updateIsLoadingMvx(false);
      setMvxNFTsFetched(true);
    }
    fetchMvxNfts();
  }, [address, tokenLogin]);

  useEffect(() => {
    if (!solPubKey) {
      return;
    }

    updateIsLoadingSol(true);

    (async () => {
      const itheumTokens = await getItheumBalanceOnSolana();
      if (itheumTokens != undefined) updateItheumBalance(itheumTokens);
      else updateItheumBalance(-1);
    })();

    fetchSolNfts(solPubKey?.toBase58()).then((nfts) => {
      updateSolNfts(nfts);
    });

    const programId = new PublicKey(BONDING_PROGRAM_ID);
    const program = new Program<CoreSolBondStakeSc>(IDL, programId, {
      connection,
    });
    fetchBondingConfig(program).then((periodsT: any) => {
      const lockPeriod: number = periodsT.lockPeriod;
      const amount: BigNumber.Value = periodsT.bondAmount;
      updateLockPeriodForBond([{ lockPeriod, amount }]);
    });

    updateIsLoadingSol(false);
  }, [solPubKey]);

  // fetch the Mx Bitz balance and cooldown
  useEffect(() => {
    (async () => {
      if (!address || !(tokenLogin && tokenLogin.nativeAuthToken)) {
        return;
      }

      if (hasPendingTransactions) return;

      const nativeAuthTokenData = decodeNativeAuthToken(tokenLogin.nativeAuthToken);
      if (nativeAuthTokenData.extraInfo.timestamp) {
        const currentTime = new Date().getTime();
        if (currentTime > (nativeAuthTokenData.extraInfo.timestamp + nativeAuthTokenData.ttl) * 1000) {
          return;
        }
      }

      // get the bitz game data nft details
      const bitzGameDataNFT = await DataNft.createFromApi(GET_BITZ_TOKEN);

      // does the logged in user actually OWN the bitz game data nft
      const _myDataNfts = await DataNft.ownedByAddress(address);
      updateMvxNfts(_myDataNfts);
      const hasRequiredDataNFT = _myDataNfts.find((dNft) => bitzGameDataNFT.nonce === dNft.nonce);
      const hasGameDataNFT = hasRequiredDataNFT ? true : false;

      // only get the bitz balance if the user owns the token
      if (hasGameDataNFT) {
        const viewDataArgs = {
          mvxNativeAuthOrigins: [nativeAuthTokenData.origin],
          mvxNativeAuthMaxExpirySeconds: 3600,
          fwdHeaderMapLookup: {
            "authorization": `Bearer ${tokenLogin.nativeAuthToken}`,
            "dmf-custom-only-state": "1",
          },
          fwdHeaderKeys: "authorization, dmf-custom-only-state",
        };

        const getBitzGameResult = await viewDataJSONCore(viewDataArgs, bitzGameDataNFT);
        if (getBitzGameResult) {
          let sumScoreBitzBefore = getBitzGameResult.data.gamePlayResult.bitsScoreBeforePlay || 0;
          sumScoreBitzBefore = sumScoreBitzBefore < 0 ? 0 : sumScoreBitzBefore;
          let sumGivenBitz = getBitzGameResult.data?.bitsMain?.bitsGivenSum || 0;
          sumGivenBitz = sumGivenBitz < 0 ? 0 : sumGivenBitz;
          let sumBonusBitz = getBitzGameResult.data?.bitsMain?.bitsBonusSum || 0;
          sumBonusBitz = sumBonusBitz < 0 ? 0 : sumBonusBitz;
          updateBitzBalance(sumScoreBitzBefore + sumBonusBitz - sumGivenBitz);
          updateCooldown(
            computeRemainingCooldown(
              Math.max(getBitzGameResult.data.gamePlayResult.lastPlayedAndCommitted, getBitzGameResult.data.gamePlayResult.lastPlayedBeforeThisPlay),
              getBitzGameResult.data.gamePlayResult.configCanPlayEveryMSecs
            )
          );
          updateGivenBitzSum(sumGivenBitz);
          updateBonusBitzSum(sumBonusBitz);
        }
      } else {
        updateBitzBalance(-1);
        updateCooldown(-1);
      }
    })();
  }, [address, tokenLogin, hasPendingTransactions]);

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
      _marketRequirements = await getMarketRequirements();
      if (_marketRequirements) {
        updateMarketRequirements(_marketRequirements);
      } else {
        _marketRequirements = await marketContractSDK.viewRequirements();
        updateMarketRequirements(_marketRequirements);
      }

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

  const getItheumBalanceOnSolana = async () => {
    try {
      const itheumTokenMint = new PublicKey(ITHEUM_TOKEN_ADDRESS);
      const addressAta = getAssociatedTokenAddressSync(itheumTokenMint, solPubKey!, false);
      const balance = await connection.getTokenAccountBalance(addressAta);
      return balance.value.uiAmount;
    } catch (error) {
      console.error("Error fetching Itheum" + ITHEUM_TOKEN_ADDRESS + "  balance on Solana " + import.meta.env.VITE_ENV_NETWORK + " blockchain:", error);
      throw error;
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

  useEffect(() => {
    if (address) {
      getAddressBoughtOffersFromBackendApi(chainID, tokenLogin?.nativeAuthToken ?? "");
    } else {
      updateAddressBoughtOffers([]);
    }
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

  return <>{children}</>;
};
