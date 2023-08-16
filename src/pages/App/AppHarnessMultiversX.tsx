import React, { useEffect, useState } from "react";
import { Box, Text } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { useGetAccountInfo, useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { RouteType } from "@multiversx/sdk-dapp/types";
import { AuthenticatedRoutesWrapper } from "@multiversx/sdk-dapp/wrappers";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLocalStorage } from "libs/hooks";
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
        <Text mt="5" ml="-5px">
          Loading
        </Text>
      </Box>
    </div>
  );
}

export const routes: RouteType[] = [
  {
    path: "dashboard",
    component: <></>,
    authenticatedRoute: true,
  },
  {
    path: "tradedata",
    component: <></>,
    authenticatedRoute: true,
  },
  {
    path: "datanfts/wallet",
    component: <></>,
    authenticatedRoute: true,
  },
];

function AppHarnessMx({ launchEnvironment, handleLaunchMode }: { launchEnvironment: any; handleLaunchMode: any }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { address: mxAddress } = useGetAccountInfo();
  const { isLoggedIn: isMxLoggedIn, tokenLogin } = useGetLoginInfo();
  const [walletUsedSession] = useLocalStorage("itm-wallet-used", null);
  const [, setHubAccessToken] = useLocalStorage("itm-hub-access-token", null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  useEffect(() => {
    if (searchParams.get("accessToken") || tokenLogin) {
      setHubAccessToken(searchParams.get("accessToken"));
      if (window.location.pathname === "/") {
        navigate("/dashboard" + window.location.search);
      }
    }
  }, [mxAddress]);

  if (isLoading) {
    return <CustomLoader />;
  }

  return (
    <StoreProvider>
      <AuthenticatedRoutesWrapper routes={routes} unlockRoute={"/"}>
        <AppMx onLaunchMode={handleLaunchMode} />
      </AuthenticatedRoutesWrapper>
    </StoreProvider>
  );
}

export default AppHarnessMx;
