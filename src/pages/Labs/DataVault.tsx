import React from "react";
import { Badge, Box, Button, Center, Flex, Heading, HStack, Image, Link, Stack, StackDivider } from "@chakra-ui/react";
import dataVaultIcon from "assets/img/data-vault-icon.png";
import { CHAIN_TOKEN_SYMBOL } from "libs/config";
import { useChainMeta } from "store/ChainMetaContext";

export default function () {
  const { chainMeta: _chainMeta } = useChainMeta();

  return (
    <Stack spacing={5}>
      <Flex align="top" gap={10}>
        <Box maxW="sm" borderWidth="1px" p="10" m="auto" borderRadius="lg" w="90%" maxWidth="initial">
          <Center flexDirection="column">
            <Heading size="lg">
              Data Vault{" "}
              <Badge variant="outline" colorScheme="teal">
                Coming Soon
              </Badge>
            </Heading>
            <Image src={dataVaultIcon} boxSize="150px" m={5} borderRadius="md" />
            <HStack divider={<StackDivider borderColor="gray.200" />} spacing={4} alignItems="baseline" flexDirection={["column", "initial"]}>
              <Box fontSize="sm" textAlign="center" flex="1">
                Store highly sensitive personal data in your data vault. For example: details about your gender, race, sexual preference, prior health
                conditions, financial history etc
              </Box>
              <Box fontSize="sm" textAlign="center" flex="1">
                Data is encrypted using your own private key (no one else can unlock and view it) and stored in IPFS (no one else can destroy it)
              </Box>
              <Box fontSize="sm" textAlign="center" flex="1">
                Append data from your vault to the regular data you trade on the data dex. As this gives the &quot;dataset&quot; more context, it becomes more
                valuable to the buyer - so you will earn more {_chainMeta && CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)}
              </Box>
            </HStack>
            <Link mt="10" href="https://dev.to/itheum/itheum-data-dex-whitepaper-ooo#data-vault-1" isExternal>
              <Button size="xs" colorScheme="teal" variant="outline">
                Read about Data Vaults in our Whitepaper
              </Button>
            </Link>
          </Center>
        </Box>
      </Flex>
    </Stack>
  );
}
