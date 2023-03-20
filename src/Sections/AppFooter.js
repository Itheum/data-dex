import React from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Box, Text, Flex, HStack, Link, useColorMode
} from "@chakra-ui/react";

const dataDexVersion = process.env.REACT_APP_VERSION ? `v${process.env.REACT_APP_VERSION}` : "version number unknown";
const nonProdEnv = `env:${process.env.REACT_APP_ENV_SENTRY_PROFILE}`;

export default function () {
  const { colorMode } = useColorMode();

  return (
    <Box backgroundColor={colorMode === "light" ? "white" : "black"} height="5rem" borderTop="solid .1rem" borderColor="teal.300">
      <Flex flexDirection="column" alignItems="center" justifyContent="center" height="100%">
        <Text fontSize="xx-small">
          {dataDexVersion} {nonProdEnv && <>{nonProdEnv}</>}
        </Text>
        <HStack>
          <Link fontSize="xs" href="https://itheum.com/termsofuse" isExternal>
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
