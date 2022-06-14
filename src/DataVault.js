import React, { useContext } from 'react';
import { Box, Stack } from '@chakra-ui/layout';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Button, Link, Progress, Badge, Flex, Image, StackDivider,
  Alert, AlertIcon, AlertTitle, AlertDescription, Spacer,
  Text, HStack, Heading, Center,
  useToast
} from '@chakra-ui/react';
import { CHAIN_TOKEN_SYMBOL } from './libs/util';
import { useChainMeta } from './store/ChainMetaContext';
import dataVaultIcon from './img/data-vault-icon.png';

export default function() {
  const { chainMeta: _chainMeta, setChainMeta } = useChainMeta();

  return (
    <Stack spacing={5}>      
      <Flex align="top" spacing={10}>
        <Box maxW="sm" borderWidth="1px" p="10" m="auto" borderRadius="lg" w="90%" maxWidth="initial">
          <Center flexDirection="column">
            <Heading size="lg">Data Vault <Badge variant="outline" colorScheme="teal">Coming Soon</Badge></Heading>
            <Image src={dataVaultIcon} boxSize="150px" m={5} borderRadius="md" />
            <HStack divider={<StackDivider borderColor="gray.200" />} spacing={4} alignItems="baseline">
              <Box align="center" flex="1">Store highly sensitive personal data in your data vault. For example: details about your gender, race, sexual preference, prior health conditions, financial history etc</Box>
              <Box align="center" flex="1">Data is encrypted using your own private key (no one else can unlock and view it) and stored in IPFS (no one else can destroy it)</Box>
              <Box align="center" flex="1">Append data from your vault to the regular data you sell on the data dex. As this gives the "dataset" more context, it becomes more valuable to the buyer  -  so you will earn more {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)}</Box>
            </HStack>
            <Link mt="10" href="https://dev.to/itheum/itheum-data-dex-whitepaper-ooo#data-vault-1" isExternal>
              <Button size="xs" colorScheme="teal" variant="outline">Read about Data Vaults in our Whitepaper</Button>
            </Link>
          </Center>
        </Box>        
      </Flex>
    </Stack>
  );
};
