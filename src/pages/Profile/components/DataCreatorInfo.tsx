import React from "react";
import { Heading, Link } from "@chakra-ui/react";
import { useGetAccount, useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useChainMeta } from "../../../store/ChainMetaContext";
import { CHAIN_TX_VIEWER } from "../../../libs/config";

export const DataCreatorInfo: React.FC = () => {
  // MX Api
  const { address: mxAddress } = useGetAccountInfo();
  const { chainMeta: _chainMeta } = useChainMeta() as any;
  const ChainExplorer = CHAIN_TX_VIEWER[_chainMeta.networkId as keyof typeof CHAIN_TX_VIEWER];
  const account = useGetAccount();
  // console.log(account);

  return (
    <>
      <Heading size="xl" fontWeight="medium" mt={10} mx={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }}>
        Data Creator Profile
      </Heading>
      <Heading size="1rem" opacity=".7" fontWeight="light" px={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }} mt={1}>
        {mxAddress}
        <Link href={`${ChainExplorer}/accounts/${mxAddress}`} isExternal>
          <ExternalLinkIcon mx="4px" fontSize="lg" />
        </Link>
      </Heading>
      <Heading size="1rem" opacity=".7" fontWeight="light" px={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }} mt={1}>
        @{account.username}
      </Heading>
    </>
  );
};
