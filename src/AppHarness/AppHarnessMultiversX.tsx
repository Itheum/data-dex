import React from "react";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import AppMx from "App/AppMultiversX";

function AppHarnessMx({ launchEnvironment }: { launchEnvironment: any }) {
  const { address: mxAddress } = useGetAccountInfo();

  return (
    <>
      {mxAddress && (
        <AppMx
          appConfig={{
            mxEnvironment: launchEnvironment,
          }}
        />
      )}
    </>
  );
}

export default AppHarnessMx;
