import React, { useEffect, useState } from "react";
import { Box, Text, Flex, Heading, Stack, FormControl, FormLabel, Switch, SimpleGrid } from "@chakra-ui/react";
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers/out";
import { PREVIEW_DATA_ON_DEVNET_SESSION_KEY } from "libs/config";
import { useLocalStorage } from "libs/hooks";
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
  const [previewDataOnDevnetSession, setPreviewDataOnDevnetSession] = useLocalStorage(PREVIEW_DATA_ON_DEVNET_SESSION_KEY, null);
  const [previewDataFlag, setPreviewDataFlag] = useState<boolean>(previewDataOnDevnetSession == "true");

  useEffect(() => {
    if (_chainMeta?.networkId) {
      setIsLoading(false);
    }
  }, [_chainMeta]);

  useEffect(() => {
    if ((previewDataFlag && !previewDataOnDevnetSession) || (!previewDataFlag && !!previewDataOnDevnetSession)) {
      setPreviewDataOnDevnetSession(previewDataFlag ? "true" : null);
    }
  }, [previewDataFlag]);

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
                <Text>REACT_APP_ENV_SENTRY_DSN : {maskOutputString(process.env.REACT_APP_ENV_SENTRY_DSN, 10, 5)}</Text>
                <Text>REACT_APP_ENV_NFT_STORAGE_KEY : {maskOutputString(process.env.REACT_APP_ENV_NFT_STORAGE_KEY, 10, 10)}</Text>
                <Text>REACT_APP_ENV_WALLETCONNECTV2_PROJECTID : {maskOutputString(process.env.REACT_APP_ENV_WALLETCONNECTV2_PROJECTID, 5, 5)}</Text>
                <br />
                <Text>REACT_APP_ENV_GATEWAY_DEVNET_KEY : {maskOutputString(process.env.REACT_APP_ENV_GATEWAY_DEVNET_KEY, 15, 10)}</Text>
                <Text>REACT_APP_ENV_API_DEVNET_KEY : {maskOutputString(process.env.REACT_APP_ENV_API_DEVNET_KEY, 5, 5)}</Text>
                <Text>REACT_APP_ENV_DATADEX_DEVNET_API : {maskOutputString(process.env.REACT_APP_ENV_DATADEX_DEVNET_API, 26, 5)}</Text>
                <Text>REACT_APP_ENV_DATAMARSHAL_DEVNET_API : {maskOutputString(process.env.REACT_APP_ENV_DATAMARSHAL_DEVNET_API, 26, 5)}</Text>
                <br />
                <Text>REACT_APP_ENV_GATEWAY_MAINNET_KEY : {maskOutputString(process.env.REACT_APP_ENV_GATEWAY_MAINNET_KEY, 10, 10)}</Text>
                <Text>REACT_APP_ENV_API_MAINNET_KEY : {maskOutputString(process.env.REACT_APP_ENV_API_MAINNET_KEY, 5, 5)}</Text>
                <Text>REACT_APP_ENV_DATADEX_MAINNET_API : {maskOutputString(process.env.REACT_APP_ENV_DATADEX_MAINNET_API, 26, 5)}</Text>
                <Text>REACT_APP_ENV_DATAMARSHAL_MAINNET_API : {maskOutputString(process.env.REACT_APP_ENV_DATAMARSHAL_MAINNET_API, 26, 5)}</Text>
                <br />
                <Text>REACT_APP_MAX_BUY_LIMIT_PER_SFT : {process.env.REACT_APP_MAX_BUY_LIMIT_PER_SFT}</Text>
                <Text>REACT_APP_MAX_LIST_LIMIT_PER_SFT : {process.env.REACT_APP_MAX_LIST_LIMIT_PER_SFT}</Text>
                <Text>REACT_APP_ENV_BACKEND_API : {maskOutputString(process.env.REACT_APP_ENV_BACKEND_API, 10, 10)}</Text>
                <Text>REACT_APP_ENV_BACKEND_DEVNET_API : {maskOutputString(process.env.REACT_APP_ENV_BACKEND_DEVNET_API, 26, 5)}</Text>
                <Text>REACT_APP_ENV_BACKEND_MAINNET_API : {maskOutputString(process.env.REACT_APP_ENV_BACKEND_MAINNET_API, 26, 5)}</Text>
                <Text>REACT_APP_LOADING_DELAY_SECONDS : {process.env.REACT_APP_LOADING_DELAY_SECONDS}</Text>
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

            <Box border="1px solid transparent" borderColor="#00C79750" borderRadius="15px" mt={10} mb={10} w="full">
              <Flex flexWrap="wrap" justifyContent={{ base: "center", lg: "normal" }} mx={{ base: 5, lg: 10 }} my="5">
                <FormControl as={SimpleGrid} columns={{ base: 2, lg: 4 }}>
                  <FormLabel htmlFor="isChecked" fontSize="lg">
                    Preview Data on devnet:
                  </FormLabel>
                  <Switch id="isChecked" colorScheme="teal" size="lg" isChecked={previewDataFlag} onChange={(e) => setPreviewDataFlag(e.target.checked)} />
                </FormControl>
              </Flex>
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
