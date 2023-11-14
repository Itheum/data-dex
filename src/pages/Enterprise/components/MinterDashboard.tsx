import React, { useEffect, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ContractConfiguration, NftMinter } from "@itheum/sdk-mx-data-nft/out";
import { Address } from "@multiversx/sdk-core/out";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { useParams } from "react-router-dom";
import { DataNftCollection } from "./DataNftCollection/DataNftCollection";
import { LaunchNftMinter } from "./LaunchNftMinter";

export const MinterDashboard: React.FC = () => {
  const [viewContractConfig, setViewContractConfig] = useState<ContractConfiguration>();

  const { hasPendingTransactions } = useGetPendingTransactions();
  const { minterAddress } = useParams();

  const nftMinter = new NftMinter("devnet", new Address(minterAddress));

  useEffect(() => {
    (async () => {
      try {
        const getContractConfig = await nftMinter.viewContractConfiguration();
        setViewContractConfig(getContractConfig);
        // console.log(getContractConfig);
      } catch (error) {
        setViewContractConfig({
          tokenIdentifier: "",
          mintedTokens: 0,
          isTaxRequired: false,
          isContractPaused: false,
          maxRoyalties: 0,
          minRoyalties: 0,
          mintTimeLimit: 0,
          isWhitelistEnabled: false,
          rolesAreSet: false,
          claimsAddress: "",
          administratorAddress: "",
        });
      }
    })();
  }, [hasPendingTransactions]);

  return (
    <Flex as="div" flexDirection="column" mx={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }} gap={8}>
      <Box>
        <Text fontSize="36px" fontFamily="Clash-Medium" mt="10">
          Itheum Enterprise - Minter Dashboard
        </Text>
        <Text size="1rem" opacity=".7" fontFamily="Satoshi-Medium" fontWeight="light">
          Minter address: {minterAddress}
        </Text>
      </Box>
      {viewContractConfig?.tokenIdentifier ? (
        <>
          <DataNftCollection nftMinter={nftMinter} viewContractConfig={viewContractConfig} />
        </>
      ) : (
        <LaunchNftMinter nftMinter={nftMinter} />
      )}
    </Flex>
  );
};
