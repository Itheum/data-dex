import React, { useEffect, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ContractConfiguration, NftMinter } from "@itheum/sdk-mx-data-nft/out";
import { Address } from "@multiversx/sdk-core/out";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { useParams } from "react-router-dom";
import { IS_DEVNET } from "libs/config";
import { DataNftCollection } from "./DataNftCollection/DataNftCollection";
import { LaunchNftMinter } from "./LaunchNftMinter";
import ShortAddress from "../../../components/UtilComps/ShortAddress";

export const MinterDashboard: React.FC = () => {
  const [viewContractConfig, setViewContractConfig] = useState<ContractConfiguration>();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { minterAddress } = useParams();

  const nftMinter = new NftMinter(IS_DEVNET ? "devnet" : "mainnet", new Address(minterAddress ?? ""));
  useEffect(() => {
    (async () => {
      try {
        const getContractConfig = await nftMinter.viewContractConfiguration();
        setViewContractConfig(getContractConfig);
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
          taxToken: "",
        });
      }
    })();
  }, [hasPendingTransactions]);

  return (
    <Flex as="div" flexDirection="column" mx={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }} gap={8}>
      <Box border="1px solid" borderColor="#00C79740" rounded="3xl" px={10} py={20} mt={5} bg="#1b1b1b50">
        <Flex justifyContent="space-between" alignItems="center" px={10} h="full">
          <Flex flexDirection="column" justifyContent="center">
            <Text fontSize="3.1rem" fontFamily="Clash-Medium">
              Itheum Enterprise
            </Text>
            <Text fontSize="1.75rem" opacity=".7" fontFamily="Satoshi-Medium" fontWeight="light" mt="-3">
              Minter Dashboard
            </Text>
          </Flex>
          <Text opacity=".7" fontFamily="Satoshi-Regular" fontWeight="light" fontSize="2xl">
            Minter address: <ShortAddress address={minterAddress} fontSize="2xl" />
          </Text>
        </Flex>
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
