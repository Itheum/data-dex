import React, { useEffect } from "react";
import { Flex } from "@chakra-ui/react";
import { LandingPage } from "./LandingPage/LandingPage";
import { LivelinessStaking } from "./LivelinessStaking/LivelinessStaking";

export const GetNFMeID = ({ onShowConnectWalletModal }: { onShowConnectWalletModal?: any }) => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <Flex flexDirection="column" justifyContent="space-between" minH="100vh" zIndex={2} mx={{ base: 10, lg: 24 }} pb="50">
      <LandingPage onShowConnectWalletModal={onShowConnectWalletModal} />
      <LivelinessStaking onShowConnectWalletModal={onShowConnectWalletModal} />
    </Flex>
  );
};
