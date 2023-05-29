import React from "react";
import { Badge, Box, Button, Center, Flex, Heading, HStack, Image, Link, Stack, StackDivider } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import dataCoalitionsIcon from "img/data-coalitions-icon.png";
import { CHAIN_TOKEN_SYMBOL, MENU } from "libs/util";
import { useChainMeta } from "store/ChainMetaContext";

export default function ({ setMenuItem }: { setMenuItem: any }) {
  const { chainMeta: _chainMeta } = useChainMeta();
  const navigate = useNavigate();

  return (
    <Stack spacing={5}>
      <Flex align="top" gap={10}>
        <Box maxW="sm" borderWidth="1px" p="10" m="auto" borderRadius="lg" w="90%" maxWidth="initial">
          <Center flexDirection="column">
            <Heading size="lg">
              Data Coalitions{" "}
              <Badge colorScheme="teal" fontSize="0.5em">
                Preview
              </Badge>
            </Heading>
            <Image src={dataCoalitionsIcon} boxSize="150px" m={5} borderRadius="md" />
            <Heading size="mb" mb="5">
              A glimpse into the future of how data will be sourced on the blockchain for AI
            </Heading>
            <HStack divider={<StackDivider borderColor="gray.200" />} spacing={4} alignItems="baseline" flexDirection={["column", "initial"]}>
              <Box fontSize="sm" textAlign="center" flex="1">
                Independently &quot;cherry-picking&quot; and selling personal data is inefficient and time consuming. Curating data and monitoring the terms and
                conditions for each sale will quickly become overwhelming
              </Box>
              <Box fontSize="sm" textAlign="center" flex="1">
                Your individual data is also not very valuable &quot;when viewed in isolation&quot;- but when your data is &quot;grouped&quot; into clusters of
                similar people, it grows significantly in value
              </Box>
              <Box fontSize="sm" textAlign="center" flex="1">
                Coalitions are DAOs. Stake your {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)} and align to the Coalition who best suits your interests. Delegate
                the ownership of your personal data and have the Coalition trade your data on your behalf
              </Box>
            </HStack>

            <HStack spacing="5" mt="10">
              <Button
                colorScheme="teal"
                onClick={() => {
                  setMenuItem(MENU.COALITIONALL);
                  navigate("viewcoalitions");
                }}>
                Enter - Data Coalitions
              </Button>
            </HStack>

            <Link mt="10" href="https://dev.to/itheum/itheum-data-dex-whitepaper-ooo#data-coalitions-1" isExternal>
              <Button size="xs" colorScheme="teal" variant="outline">
                Read about Data Coalitions in our Whitepaper
              </Button>
            </Link>
          </Center>
        </Box>
      </Flex>
    </Stack>
  );
}
