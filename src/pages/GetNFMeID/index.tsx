import React, { useEffect } from "react";
import { Flex } from "@chakra-ui/react";
import { qsParams } from "libs/utils/util";
import { LandingPage } from "./LandingPage/LandingPage";
import { LivelinessStaking } from "./LivelinessStaking/LivelinessStaking";

export const GetNFMeID = ({ onShowConnectWalletModal }: { onShowConnectWalletModal?: any }) => {
  useEffect(() => {
    async function loadViewLogic() {
      const queryParams = qsParams();
      const viewSection = queryParams?.view;

      if (viewSection && viewSection === "staking") {
        document?.getElementById("liveliness")?.scrollIntoView();
      } else {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    }

    loadViewLogic();
  }, []);

  return (
    <Flex flexDirection="column" justifyContent="space-between" minH="100vh" zIndex={2} pb="50">
      <LandingPage onShowConnectWalletModal={onShowConnectWalletModal} />
      <LivelinessStaking onShowConnectWalletModal={onShowConnectWalletModal} />
    </Flex>
  );
};
