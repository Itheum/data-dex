import React, { PropsWithChildren, useEffect } from "react";
import { BondContract, DataNft, DataNftMarket, MarketplaceRequirements } from "@itheum/sdk-mx-data-nft/out";
import { Address } from "@multiversx/sdk-core/out";
import { useGetAccountInfo, useGetNetworkConfig, useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks";
import { useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useSearchParams } from "react-router-dom";
import { GET_BITZ_TOKEN, IS_DEVNET, viewDataJSONCore } from "libs/config";
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
import { computeRemainingCooldown, convertWeiToEsdt, decodeNativeAuthToken, tokenDecimals } from "libs/utils";
import { useAccountStore, useMarketStore, useMintStore } from "store";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { itheumTokenContractAddress_Solana } from "libs/contractAddresses";

export const StoreProvider = ({ children }: PropsWithChildren) => {
  const { address } = useGetAccountInfo();
  const { publicKey } = useWallet();
  const solAddress = publicKey ? publicKey.toBase58() : "";
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { tokenLogin } = useGetLoginInfo();
  const { chainID } = useGetNetworkConfig();
  const [searchParams] = useSearchParams();

  // ACCOUNT STORE
  const favoriteNfts = useAccountStore((state) => state.favoriteNfts);
  const updateItheumBalance = useAccountStore((state) => state.updateItheumBalance);
  const updateItheumSolBalance = useAccountStore((state) => state.updateItheumSolBalance);
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

  useEffect(() => {
    (async () => {
      if (bondingContract) {
        const bondingAmount = await bondingContract.viewLockPeriodsWithBonds();
        updateLockPeriodForBond(bondingAmount);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!address || !(tokenLogin && tokenLogin.nativeAuthToken)) {
        return;
      }

      if (hasPendingTransactions) return;

      const nativeAuthTokenData = decodeNativeAuthToken(tokenLogin.nativeAuthToken);
      if (nativeAuthTokenData.extraInfo.timestamp) {
        const currentTime = new Date().getTime();
        console.log(currentTime, (nativeAuthTokenData.extraInfo.timestamp + nativeAuthTokenData.ttl) * 1000);
        if (currentTime > (nativeAuthTokenData.extraInfo.timestamp + nativeAuthTokenData.ttl) * 1000) {
          return;
        }
      }

      // get the bitz game data nft details
      const bitzGameDataNFT = await DataNft.createFromApi(GET_BITZ_TOKEN);

      // does the logged in user actually OWN the bitz game data nft
      const _myDataNfts = await DataNft.ownedByAddress(address);
      const hasRequiredDataNFT = _myDataNfts.find((dNft) => bitzGameDataNFT.nonce === dNft.nonce);
      const hasGameDataNFT = hasRequiredDataNFT ? true : false;

      // only get the bitz balance if the user owns the token
      if (hasGameDataNFT) {
        console.log("info: user OWNs the bitz score data nft, so get balance");

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
        console.log("info: user does NOT OWN the bitz score data nft");
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

  useEffect(() => {
    if (!solAddress) return;
    if (hasPendingTransactions) return;

    (async () => {
      console.log("SOL TOKEN", contractsForChain("SD").itheumToken);
      const itheumTokens = (await getItheumBalance()) || 0;
      updateItheumSolBalance(itheumTokens);
    })();
  }, [solAddress, hasPendingTransactions]);

  const getItheumBalance = async () => {
    try {
      const connection = new Connection("https://api.testnet.solana.com"); // Replace with your desired cluster's RPC endpoint

      const itheumTokenMint = new PublicKey(itheumTokenContractAddress_Solana); // Replace with actual mint address
      const publicKey = new PublicKey(solAddress);

      // Derive the associated token account address
      const addressAta = getAssociatedTokenAddressSync(itheumTokenMint, publicKey, false);

      // Check if the ATA exists
      const accountInfo = await connection.getAccountInfo(addressAta);
      console.log("acc info ata", accountInfo);
      if (!accountInfo) {
        console.warn(`Associated Token Account for ${solAddress} does not exist.`);
        return 0; // Return 0 if the account doesn't exist
      }

      // Fetch the balance if the account exists
      const balance = await connection.getTokenAccountBalance(addressAta);
      console.log("BALANCE ITH", balance.value.uiAmount);
      return balance.value.uiAmount; // Return the balance in the token's smallest unit
    } catch (error) {
      console.error("Error fetching Itheum balance:", error);
      throw error;
    }
  };
  // async function getAccountBalance() {
  //   try {
  //     if (!publicKey) {
  //       console.error("Wallet not connected.");
  //       return;
  //     }
  //     const accountInfo = await connection.getAccountInfo(publicKey);
  //     console.log("acc info", accountInfo);
  //     if (accountInfo) {
  //       const balanceInLamports = accountInfo.lamports;
  //       const balanceInSOL = balanceInLamports / 1000000000;
  //       console.log(`Balance: ${balanceInSOL} SOL`);
  //       const address_ata = await getAssociatedTokenAddressSync(new PublicKey(itheumTokenContractAddress_Solana), publicKey, false);
  //       console.log("ATA", address_ata);
  //       const balance = await connection.getTokenAccountBalance(address_ata);

  //       console.log("BALANCE ITH:", balance);
  //       console.log(`Balance sol: ${balance.value.amount}`);
  //     } else {
  //       console.error("Account not found.");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching account balance:", error);
  //   }
  // }

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
