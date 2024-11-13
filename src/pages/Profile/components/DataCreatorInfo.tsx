import React, { useEffect, useState } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Heading, Link } from "@chakra-ui/react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useParams } from "react-router-dom";
import { CHAIN_TX_VIEWER } from "libs/config";
import { getAccountDetailFromApi } from "libs/MultiversX/api";

function processHerotag(value: string): string {
  return value.length > 7 ? value.slice(0, -7) : value;
}

export const DataCreatorInfo: React.FC = () => {
  const {
    network: { chainId: chainID },
  } = useGetNetworkConfig();
  const ChainExplorer = CHAIN_TX_VIEWER[chainID as keyof typeof CHAIN_TX_VIEWER];
  const { profileAddress } = useParams();
  const [herotag, setHerotag] = useState<string>("");

  useEffect(() => {
    if (!profileAddress) return;
    (async () => {
      const _accountDetail = await getAccountDetailFromApi(profileAddress, "1"); // query mainnet to get herotag
      const _herotag = _accountDetail && _accountDetail.username ? processHerotag(_accountDetail.username) : "";
      setHerotag(_herotag);
    })();
  }, [profileAddress]);

  return (
    <>
      <Heading size="xl" fontFamily="Clash-Medium" mt={10} mx={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }}>
        Data Creator Profile
      </Heading>
      <Heading
        fontSize={{ base: "0.9rem", md: "1rem" }}
        opacity=".7"
        fontFamily="Satoshi-Medium"
        fontWeight="light"
        px={{ base: 10, lg: 24 }}
        textAlign={{ base: "center", lg: "start" }}
        mt={1}>
        {profileAddress}
        <Link href={`${ChainExplorer}/accounts/${profileAddress}`} isExternal>
          <ExternalLinkIcon mx="4px" fontSize="lg" />
        </Link>
      </Heading>
      {herotag ? (
        <Heading size="1rem" opacity=".7" fontWeight="light" px={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }} mt={1}>
          @{herotag}
        </Heading>
      ) : (
        <></>
      )}
    </>
  );
};
