import React from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Box, Text, Flex, HStack, Link, useColorMode } from "@chakra-ui/react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers/out";
import { getApi, getNetworkProvider, getNetworkProviderCodification } from "libs/MultiversX/api";
import { getSentryProfile } from "libs/utils";

const dataDexVersion = import.meta.env.VITE_APP_VERSION ?? "version number unknown";
const nonProdEnv = `env:${getSentryProfile()}`;

export default function () {
  const { colorMode } = useColorMode();
  const { chainID } = useGetNetworkConfig();
  const isPublicApi = getApi(chainID).includes("api.multiversx.com");
  const isPublicNetworkProvider = getNetworkProviderCodification(chainID).includes(".multiversx.com");
  const isApiNetworkProvider = getNetworkProvider(chainID) instanceof ApiNetworkProvider;

  return (
    <Box
      backgroundColor={colorMode === "light" ? "bgWhite" : "bgDark"}
      height="5rem"
      borderTop="solid .1rem"
      borderColor="teal.200"
      flexGrow={{ base: 0, lg: 0 }}>
      <Flex flexDirection="column" alignItems="center" justifyContent="center" height="100%">
        <Text fontSize="xx-small">
          {dataDexVersion} {nonProdEnv && <>{nonProdEnv}</>}
        </Text>
        <Text fontSize="xx-small">
          Network Provider: {isPublicNetworkProvider ? "Public" : "Private"} {isApiNetworkProvider ? "API" : "Gateway"}
        </Text>
        <Text fontSize="xx-small">API Provider: {isPublicApi ? "Public" : "Private"}</Text>
        <HStack>
          <Link fontSize="xs" href="https://itheum.com/legal/datadex/termsofuse" isExternal>
            Terms of Use <ExternalLinkIcon mx={1} />
          </Link>
          <Link fontSize="xs" href="https://itheum.com/legal/datadex/privacypolicy" isExternal>
            Privacy Policy <ExternalLinkIcon mx={1} />
          </Link>
        </HStack>
      </Flex>
    </Box>
  );
}
