import React, { FC, ReactNode } from "react";
import { NotificationModal } from "@multiversx/sdk-dapp/UI/NotificationModal/NotificationModal";
import { SignTransactionsModals } from "@multiversx/sdk-dapp/UI/SignTransactionsModals/SignTransactionsModals";
import { TransactionsToastList } from "@multiversx/sdk-dapp/UI/TransactionsToastList/TransactionsToastList";
import { DappProvider } from "@multiversx/sdk-dapp/wrappers/DappProvider/DappProvider";
import { uxConfig } from "libs/config";
import { MX_TOAST_LIFETIME_IN_MS, walletConnectV2ProjectId } from "libs/mxConstants";
import ModalAuthPickerMx from "pages/App/ModalAuthPickerMultiversX";

export const MvxContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <DappProvider
        environment={import.meta.env.VITE_ENV_NETWORK}
        customNetworkConfig={{
          name: "itheum-data-dex",
          apiTimeout: uxConfig.mxAPITimeoutMs,
          walletConnectV2ProjectId,
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
