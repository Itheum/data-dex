import React, { FC, ReactNode } from "react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { NotificationModal } from "@multiversx/sdk-dapp/UI/NotificationModal/NotificationModal";
import { SignTransactionsModals } from "@multiversx/sdk-dapp/UI/SignTransactionsModals/SignTransactionsModals";
import { TransactionsToastList } from "@multiversx/sdk-dapp/UI/TransactionsToastList/TransactionsToastList";
import { DappProvider } from "@multiversx/sdk-dapp/wrappers/DappProvider/DappProvider";
import { uxConfig } from "libs/config";
import { IS_DEVNET } from "libs/config";
import { getMvxRpcApi } from "libs/MultiversX/api";
import { MX_TOAST_LIFETIME_IN_MS, walletConnectV2ProjectId } from "libs/mxConstants";

export const MvxContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { chainID } = useGetNetworkConfig();

  return (
    <>
      <DappProvider
        environment={import.meta.env.VITE_ENV_NETWORK}
        customNetworkConfig={{
          name: "itheumDataDEX",
          walletConnectV2ProjectId,
          apiTimeout: uxConfig.mxAPITimeoutMs,
          apiAddress: IS_DEVNET ? `https://${getMvxRpcApi("D")}` : `https://${getMvxRpcApi(chainID)}`, // we have to do the IS_DEVNET check as if not, chainID is being cached to 1 always and we always go to Mainnet
        }}
        dappConfig={{
          shouldUseWebViewProvider: true,
        }}>
        <TransactionsToastList successfulToastLifetime={MX_TOAST_LIFETIME_IN_MS} />
        <NotificationModal />
        <SignTransactionsModals className="itheum-data-dex-elrond-modals" />

        {children}
      </DappProvider>
    </>
  );
};
