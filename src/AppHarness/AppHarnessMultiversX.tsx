import React from "react";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import AppMx from "App/AppMultiversX";
import LandingPage from "Launch/LandingPage";

function AppHarnessMx({ launchEnvironment, handleLaunchMode }: { launchEnvironment: any, handleLaunchMode: any }) {
  const { address: mxAddress } = useGetAccountInfo();

  return (
    <>
      {mxAddress && (
        <AppMx
          appConfig={{
            mxEnvironment: launchEnvironment,
          }}
        />
      ) || <LandingPage onLaunchMode={handleLaunchMode} />}
    </>
  );
}

export default AppHarnessMx;
