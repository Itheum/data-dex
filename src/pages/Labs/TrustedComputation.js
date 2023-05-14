import React from "react";
import { Badge, Box, Button, Center, Flex, Heading, HStack, Image, Link, Stack, StackDivider } from "@chakra-ui/react";

import TrustedComputationFrameworkIcon from "assets/img/trusted-computation-icon.png";

export default function () {
  return (
    <Stack spacing={5}>
      <Flex align="top" spacing={10}>
        <Box maxW="sm" borderWidth="1px" p="10" m="auto" borderRadius="lg" w="90%" maxWidth="initial">
          <Center flexDirection="column">
            <Heading size="lg">
              Trusted Computation Framework{" "}
              <Badge variant="outline" colorScheme="teal">
                Coming Soon
              </Badge>
            </Heading>
            <Image src={TrustedComputationFrameworkIcon} boxSize="150px" m={5} borderRadius="md" />
            <HStack divider={<StackDivider borderColor="gray.200" />} spacing={4} alignItems="baseline" flexDirection={["column", "initial"]}>
              <Box fontSize="sm" align="center" flex="1">
                Large personal datasets managed on-chain by Data Coalitions will become too difficult to monitor over time - with the possibility of sensitive
                data being accidently leaked during the exchange between multiple buyers
              </Box>
              <Box fontSize="sm" align="center" flex="1">
                There will also be cases where personal data cannot be put on-chain even when encrypted due to privacy regulations and data sovereignty
                regulations
              </Box>
              <Box fontSize="sm" align="center" flex="1">
                The Trusted Computation Framework will allow for protected access to datasets within an environment that complies to various centralised
                regulations but can be verified and audited on-chain
              </Box>
            </HStack>
            <Link mt="10" href="https://dev.to/itheum/itheum-data-dex-whitepaper-ooo#trusted-1" isExternal>
              <Button size="xs" colorScheme="teal" variant="outline">
                Read about the Trusted Computation Framework in our Whitepaper
              </Button>
            </Link>
          </Center>
        </Box>
      </Flex>
    </Stack>
  );
}
