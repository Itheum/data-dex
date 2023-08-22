import React from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Heading, Link } from "@chakra-ui/react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetAccount, useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useParams } from "react-router-dom";
import { routeChainIDBasedOnLoggedInStatus } from "libs/utils";
import { CHAIN_TX_VIEWER } from "../../../libs/config";

export const DataCreatorInfo: React.FC = () => {
  const { chainID } = useGetNetworkConfig();
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();
  const routedChainID = routeChainIDBasedOnLoggedInStatus(isMxLoggedIn, chainID);
  const ChainExplorer = CHAIN_TX_VIEWER[routedChainID as keyof typeof CHAIN_TX_VIEWER];
  const account = useGetAccount();
  const { profileAddress } = useParams();

  return (
    <>
      <Heading size="xl" fontFamily="Clash-Medium" mt={10} mx={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }}>
        Data Creator Profile
      </Heading>
      <Heading size="1rem" opacity=".7" fontFamily="Satoshi-Medium" fontWeight="light"
               px={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }} mt={1}>
        {profileAddress}
        <Link href={`${ChainExplorer}/accounts/${profileAddress}`} isExternal>
          <ExternalLinkIcon mx="4px" fontSize="lg" />
        </Link>
      </Heading>
      <Heading size="1rem" opacity=".7" fontWeight="light" px={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }} mt={1}>
        @{account.username}
      </Heading>
    </>
  );
};
