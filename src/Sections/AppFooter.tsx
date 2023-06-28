import React from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Box, Text, Flex, HStack, Link, useColorMode } from "@chakra-ui/react";
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers/out";
import { getApi, getNetworkProvider, getNetworkProviderCodification } from "MultiversX/api";
import { useChainMeta } from "store/ChainMetaContext";
import { getSentryProfile } from "../libs/util2";

const dataDexVersion = process.env.REACT_APP_VERSION ? `v${process.env.REACT_APP_VERSION}` : "version number unknown";
const nonProdEnv = `env:${getSentryProfile()}`;

export default function () {
  const { colorMode } = useColorMode();
  const { chainMeta: _chainMeta } = useChainMeta();
  const isPublicApi = getApi(_chainMeta?.networkId).includes("api.multiversx.com");
  const isPublicNetworkProvider = getNetworkProviderCodification(_chainMeta?.networkId).includes(".multiversx.com");
  const isApiNetworkProvider = getNetworkProvider(_chainMeta?.networkId) instanceof ApiNetworkProvider;

  return (
    <Box backgroundColor={colorMode === "light" ? "white" : "bgDark"} height="5rem" borderTop="solid .1rem" borderColor="teal.200">
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
          <Link fontSize="xs" href="https://itheum.com/privacypolicy" isExternal>
            Privacy Policy <ExternalLinkIcon mx={1} />
          </Link>
        </HStack>
      </Flex>
    </Box>
  );
}
