import React, { useState, useEffect } from 'react';
import { Box, Stack } from '@chakra-ui/layout';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Button, Link, Progress, Badge, Flex, Image, StackDivider,
  Alert, AlertIcon, AlertTitle, AlertDescription, Spacer,
  Text, HStack, Heading, Center,
  useToast
} from '@chakra-ui/react';
import ShortAddress from './ShortAddress';
import { config, ABIS } from './util';
import dataVaultIcon from './img/data-vault-icon.png';

export default function() {

  return (
    <Stack spacing={5}>      
      <Flex align="top" spacing={10}>
        <Box maxW="sm" borderWidth="1px" p="10" m="auto" borderRadius="lg" w="80%" maxWidth="initial">
          <Center flexDirection="column">
            <Heading size="lg">Data Vault <Badge variant="outline" colorScheme="green">Coming Soon</Badge></Heading>
            <Image src={dataVaultIcon} boxSize="150px" />
            <HStack divider={<StackDivider borderColor="gray.200" />} spacing={4} alignItems="baseline">
              <Box align="center" flex="1">Store highly sensitive personal data in your data vault. For example: details about your gender, race, sexual preference, prior health conditions, financial history etc</Box>
              <Box align="center" flex="1">Data is encrypted using your own private key (no one else can unlock and view it) and stored in IPFS (no one else can destroy it)</Box>
              <Box align="center" flex="1">Append data from your vault to the regular data you sell on the data dex. As this gives the "dataset" more context, it becomes more valuable to the buyer  -  so you will earn more MYDA</Box>
            </HStack>
            <Link mt="10" href="https://itheum.medium.com/itheum-data-dex-whitepaper-fc6b205636b6#60cc" isExternal>
              <Button colorScheme="teal" variant="outline">Read about Data Vaults in our Whitepaper</Button>
            </Link>
          </Center>
        </Box>        
      </Flex>
    </Stack>
  );
};
