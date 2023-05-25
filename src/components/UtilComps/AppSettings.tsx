import React from "react";
import { Box, Text, Flex, Heading, Stack } from "@chakra-ui/react";
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers/out";
import { getApi, getNetworkProvider, getNetworkProviderCodification } from "libs/MultiversX/api";
import { getSentryProfile } from "libs/utils";
import { useChainMeta } from "store/ChainMetaContext";

const dataDexVersion = process.env.REACT_APP_VERSION ? `v${process.env.REACT_APP_VERSION}` : "version number unknown";
const nonProdEnv = `${getSentryProfile()}`;

export default function () {
  const { chainMeta: _chainMeta } = useChainMeta();
  const isPublicApi = getApi(_chainMeta?.networkId).includes("api.multiversx.com");
  const isPublicNetworkProvider = getNetworkProviderCodification(_chainMeta?.networkId).includes(".multiversx.com");
  const isApiNetworkProvider = getNetworkProvider(_chainMeta?.networkId) instanceof ApiNetworkProvider;

  return (
    <Stack spacing={5}>
      <Flex align="top" gap={10}>
        <Box maxW="sm" p="10" m="auto" borderRadius="lg" w="90%" maxWidth="initial">
          <Heading size="lg" mb="10">
            App Settings
          </Heading>

          <Box>
            <Heading size="md" mb="3">
              General Settings
            </Heading>
            <Text>App Version : {dataDexVersion}</Text>
            <Text>Sentry Profile : {nonProdEnv && <>{nonProdEnv}</>}</Text>
            <Text>
              Network Provider: {isPublicNetworkProvider ? "Public" : "Private"} {isApiNetworkProvider ? "API" : "Gateway"}
            </Text>
            <Text>API Provider: {isPublicApi ? "Public" : "Private"}</Text>
          </Box>

          <Box mt="10">
            <Heading size="md" mb="3">
              Env Vars
            </Heading>
            <Box fontSize="sm">
              <Text>SENTRY_DSN : {process.env.REACT_APP_ENV_SENTRY_DSN}</Text>
              <Text>NFT_STORAGE_KEY : {process.env.REACT_APP_ENV_NFT_STORAGE_KEY}</Text>
              <Text>WALLETCONNECTV2_PROJECTID : {process.env.REACT_APP_ENV_WALLETCONNECTV2_PROJECTID}</Text>
              <Text>DATAMARSHAL_API : {process.env.REACT_APP_ENV_DATAMARSHAL_API}</Text>
              <Text>DATADEX_API : {process.env.REACT_APP_ENV_DATADEX_API}</Text>
              <Text>GATEWAY_DEVNET_KEY : {process.env.REACT_APP_ENV_GATEWAY_DEVNET_KEY}</Text>
              <Text>API_DEVNET_KEY : {process.env.REACT_APP_ENV_API_DEVNET_KEY}</Text>
              <Text>GATEWAY_MAINNET_KEY : {process.env.REACT_APP_ENV_GATEWAY_MAINNET_KEY}</Text>
              <Text>API_MAINNET_KEY : {process.env.REACT_APP_ENV_API_MAINNET_KEY}</Text>
            </Box>
          </Box>
        </Box>
      </Flex>
    </Stack>
  );
}
