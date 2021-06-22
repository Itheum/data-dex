import React, { useContext } from 'react';
import { Box, Stack } from '@chakra-ui/layout';
import {
  Button, Link, Badge, Flex, Image, StackDivider,  
  HStack, Heading, Center,
} from '@chakra-ui/react';
import { CHAIN_TOKEN_SYMBOL } from './util';
import { ChainMetaContext } from './contexts';
import dataCoalitionsIcon from './img/data-coalitions-icon.png';

export default function() {
  const chainMeta = useContext(ChainMetaContext);

  return (
    <Stack spacing={5}>      
      <Flex align="top" spacing={10}>
        <Box maxW="sm" borderWidth="1px" p="10" m="auto" borderRadius="lg" w="80%" maxWidth="initial">
          <Center flexDirection="column">
            <Heading size="lg">Data Coalitions <Badge variant="outline" colorScheme="green">Coming Soon</Badge></Heading>
            <Image src={dataCoalitionsIcon} boxSize="150px" />
            <Heading size="mb" mb="5">A glimpse into the future of how data will be sourced on the blockchain for AI</Heading>
            <HStack divider={<StackDivider borderColor="gray.200" />} spacing={4} alignItems="baseline">
              <Box align="center" flex="1">Independently "cherry-picking" and selling personal data is inefficient and time consuming. Curating data and monitoring the terms and conditions for each sale will quickly become overwhelming</Box>
              <Box align="center" flex="1">Your individual data is also not very valuable "when viewed in isolation" -  but when your data is "grouped" into clusters of similar people, it grows significantly in value</Box>
              <Box align="center" flex="1">Coalitions are DAOs. Stake your {CHAIN_TOKEN_SYMBOL(chainMeta.networkId)} and align to the Coalition who best suits your interests. Delegate the ownership of your personal data and have the Coalition trade your data on your behalf</Box>
            </HStack>
            <Link mt="10" href="https://itheum.medium.com/itheum-data-dex-whitepaper-fc6b205636b6#6117" isExternal>
              <Button colorScheme="teal" variant="outline">Read about Data Coalitions in our Whitepaper</Button>
            </Link>
          </Center>
        </Box>        
      </Flex>
    </Stack>
  );
};
