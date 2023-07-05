import React, { useEffect, useState } from "react";
import { Box, Text } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { useGetAccountInfo, useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLocalStorage } from "libs/hooks";
import { contractsForChain } from "libs/MultiversX";
import { sleep } from "libs/utils";
import { useChainMeta } from "store/ChainMetaContext";
import { StoreProvider } from "store/StoreProvider";
import AppMx from "./AppMultiversX";

function CustomLoader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        minHeight: "100vh",
      }}>
      <Box margin="auto !important">
        <Spinner size="xl" color="teal.200" margin="auto !important" />
        <Text mt="5">Loading</Text>
      </Box>
    </div>
  );
}

function AppHarnessMx({ launchEnvironment, handleLaunchMode }: { launchEnvironment: any; handleLaunchMode: any }) {
  const [searchParams] = useSearchParams();
  const { setChainMeta } = useChainMeta();
  const navigate = useNavigate();
  const { chainMeta: _chainMeta } = useChainMeta();
  const { address: mxAddress } = useGetAccountInfo();
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();
  const [walletUsedSession] = useLocalStorage("itm-wallet-used", null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let networkId = launchEnvironment === "mainnet" ? "E1" : "ED";

    if (searchParams.get("accessToken")) {
      networkId = "E1";
      if (window.location.pathname === "/") {
        navigate("/dashboard" + window.location.search);
      }
    }
    setChainMeta({
      networkId,
      contracts: contractsForChain(networkId),
      walletUsed: walletUsedSession,
    });
  }, [mxAddress]);

  useEffect(() => {
    if (_chainMeta?.networkId) {
      (async () => {
        // delay loading to prevent multiple rerenders
        await sleep(process.env.REACT_APP_LOADING_DELAY_SECONDS ? Number(process.env.REACT_APP_LOADING_DELAY_SECONDS) : 2);
        setIsLoading(false);
      })();
    }
  }, [_chainMeta]);

  // useEffect(() => {
  //   if (mxAddress && isMxLoggedIn) {
  //     setUser({
  //       ...baseUserContext,
  //       ..._user,
  //       isMxAuthenticated: true,
  //       loggedInAddress: mxAddress,
  //     });
  //   }
  // }, [mxAddress, isMxLoggedIn]);

  // const resetAppContexts = () => {
  // setUser({ ...baseUserContext });
  // setChainMeta({});
  // };

  if (isLoading) {
    return <CustomLoader />;
  }

  return (
    <StoreProvider>
      <AppMx
        onLaunchMode={handleLaunchMode}
        // resetAppContexts={resetAppContexts}
        // appConfig={{
        //   mxEnvironment: launchEnvironment,
        // }}
      />
    </StoreProvider>
  );
}

export default AppHarnessMx;
