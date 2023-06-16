import React, { useEffect, useState } from "react";
import { Box, Text, Flex, Heading, Stack } from "@chakra-ui/react";
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers/out";
import { getApi, getNetworkProvider, getNetworkProviderCodification } from "libs/MultiversX/api";
import { getApiDataDex, getApiDataMarshal, getSentryProfile } from "libs/utils";
import { useChainMeta } from "store/ChainMetaContext";

const dataDexVersion = process.env.REACT_APP_VERSION ? `v${process.env.REACT_APP_VERSION}` : "version number unknown";
const nonProdEnv = `${getSentryProfile()}`;

export default function () {
  const { chainMeta: _chainMeta } = useChainMeta();
  const isPublicApi = getApi(_chainMeta?.networkId).includes("api.multiversx.com");
  const isPublicNetworkProvider = getNetworkProviderCodification(_chainMeta?.networkId).includes(".multiversx.com");
  const isApiNetworkProvider = getNetworkProvider(_chainMeta?.networkId) instanceof ApiNetworkProvider;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (_chainMeta?.networkId) {
      setIsLoading(false);
    }
  }, [_chainMeta]);

  return (
    <Stack spacing={5}>
      <Flex align="top" gap={10}>
        {(isLoading && <Text>Loading...</Text>) || (
          <Box maxW="sm" p="10" m="auto" borderRadius="lg" w="90%" maxWidth="initial">
            <Heading size="lg" mb="10">
              App Settings
            </Heading>

            <Box>
              <Heading size="md" mb="3">
                General Settings
              </Heading>
              <Box fontSize="sm">
                <Text>App Version : {dataDexVersion}</Text>
                <Text>Sentry Profile : {nonProdEnv && <>{nonProdEnv}</>}</Text>
                <Text>
                  Network Provider: {isPublicNetworkProvider ? "Public" : "Private"} {isApiNetworkProvider ? "API" : "Gateway"}
                </Text>
                <Text>API Provider: {isPublicApi ? "Public" : "Private"}</Text>
              </Box>
            </Box>

            <Box mt="10">
              <Heading size="md" mb="3">
                Env Vars
              </Heading>
              <Box fontSize="sm">
                <Text>SENTRY_DSN : {maskOutputString(process.env.REACT_APP_ENV_SENTRY_DSN, 10, 5)}</Text>
                <Text>NFT_STORAGE_KEY : {maskOutputString(process.env.REACT_APP_ENV_NFT_STORAGE_KEY, 10, 10)}</Text>
                <Text>WALLETCONNECTV2_PROJECTID : {maskOutputString(process.env.REACT_APP_ENV_WALLETCONNECTV2_PROJECTID, 5, 5)}</Text>
                <br />
                <Text>GATEWAY_DEVNET_KEY : {maskOutputString(process.env.REACT_APP_ENV_GATEWAY_DEVNET_KEY, 15, 10)}</Text>
                <Text>API_DEVNET_KEY : {maskOutputString(process.env.REACT_APP_ENV_API_DEVNET_KEY, 5, 5)}</Text>
                <Text>DATADEX_DEVNET_API : {maskOutputString(process.env.REACT_APP_ENV_DATADEX_DEVNET_API, 26, 5)}</Text>
                <Text>DATAMARSHAL_DEVNET_API : {maskOutputString(process.env.REACT_APP_ENV_DATAMARSHAL_DEVNET_API, 26, 5)}</Text>
                <br />
                <Text>GATEWAY_MAINNET_KEY : {maskOutputString(process.env.REACT_APP_ENV_GATEWAY_MAINNET_KEY, 10, 10)}</Text>
                <Text>API_MAINNET_KEY : {maskOutputString(process.env.REACT_APP_ENV_API_MAINNET_KEY, 5, 5)}</Text>
                <Text>DATADEX_MAINNET_API : {maskOutputString(process.env.REACT_APP_ENV_DATADEX_MAINNET_API, 26, 5)}</Text>
                <Text>DATAMARSHAL_MAINNET_API : {maskOutputString(process.env.REACT_APP_ENV_DATAMARSHAL_MAINNET_API, 26, 5)}</Text>
              </Box>
            </Box>

            <Box mt="10">
              <Heading size="md" mb="3">
                Dynamic Settings
              </Heading>
              <Box fontSize="sm">
                <Text>MultiversX API being used : {getApi(_chainMeta?.networkId)}</Text>
                <Text>MultiversX Gateway being used : {getNetworkProviderCodification(_chainMeta?.networkId)}</Text>
                <Text>Web2 Data DEX API : {getApiDataDex(_chainMeta?.networkId)}</Text>
                <Text>Web2 Data Marshal API : {getApiDataMarshal(_chainMeta?.networkId)}</Text>
                <Text>Chain Meta Dump : {JSON.stringify(_chainMeta)}</Text>
              </Box>
            </Box>
          </Box>
        )}
      </Flex>
    </Stack>
  );
}

function maskOutputString(val: string | undefined, charsAtStart: number, charsAtEnd: number) {
  if (!val) {
    return "n/a";
  } else {
    return `${val?.substring(0, charsAtStart)} ********** ${val?.slice(-1 * charsAtEnd)}`;
  }
}
