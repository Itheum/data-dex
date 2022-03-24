import React, { useState, useEffect } from 'react';
import { Box, Stack } from '@chakra-ui/layout';
import {
  Button, Link, Badge, Flex, Image, StackDivider, Text,
  HStack, Heading, Center,
} from '@chakra-ui/react';

import TrustedComputationFrameworkIcon from './img/trusted-computation-icon.png';
import chainlinkLogoIcon from './img/chainlink-logo.png';

export default function() {
  return (
    <Stack spacing={5}>      
      <Flex align="top" spacing={10}>
        <Box maxW="sm" borderWidth="1px" p="10" m="auto" borderRadius="lg" w="90%" maxWidth="initial">
          <Center flexDirection="column">
            <Heading size="lg">Trusted Computation Framework <Badge variant="outline" colorScheme="teal">Coming Soon</Badge></Heading>
            <Image src={TrustedComputationFrameworkIcon} boxSize="150px" m={5} borderRadius="md" />
            <HStack divider={<StackDivider borderColor="gray.200" />} spacing={4} alignItems="baseline">
              <Box align="center" flex="1">Large personal datasets managed on-chain by Data Coalitions will become too difficult to monitor over time - with the possibility of sensitive data being accidently leaked during the exchange between multiple buyers</Box>
              <Box align="center" flex="1">There will also be cases where personal data cannot be put on-chain even when encrypted due to privacy regulations and data sovereignty regulations</Box>
              <Box align="center" flex="1">The Trusted Computation Framework will allow for protected access to datasets within an environment that complies to various centralised regulations but can be verified and audited on-chain
                <HStack>
                  <Image src={chainlinkLogoIcon} boxSize="75px" objectFit="contain"></Image>
                  <Text fontSize="sm" opacity=".7">Powered by <Link href="https://blog.chain.link/driving-demand-for-enterprise-smart-contracts-using-the-trusted-computation-framework-and-attested-oracles-via-chainlink/" isExternal>Chainlink</Link></Text>
                </HStack>
              </Box>
            </HStack>
            <Link mt="10" href="https://dev.to/itheum/itheum-data-dex-whitepaper-ooo#trusted-1" isExternal>
              <Button size="xs" colorScheme="teal" variant="outline">Read about the Trusted Computation Framework in our Whitepaper</Button>
            </Link>
          </Center>
        </Box>        
      </Flex>
    </Stack>
  );
};
