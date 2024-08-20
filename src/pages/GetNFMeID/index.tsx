import React from "react";
import { Flex } from "@chakra-ui/react";
import { LandingPage } from "./LandingPage/LandingPage";
import { LivelinessStaking } from "./LivelinessStaking/LivelinessStaking";

export const GetNFMeID: React.FC = () => {
  return (
    <Flex w="full" h="full" flexDirection="column">
      <LandingPage />
      <LivelinessStaking />
    </Flex>
  );
};
