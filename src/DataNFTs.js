import React, { useState, useEffect } from 'react';
import { Box, Stack } from '@chakra-ui/layout';
import {
  Button, Link, Badge, Flex, Image, StackDivider,
  HStack, Heading, Center, Text
} from '@chakra-ui/react';
import { MENU } from './libs/util';
import openSeaLogoIcon from './img/opensea-logo.png';
import dataNFTIcon from './img/data-nft-icon.png';

export default function({setMenuItem}) {
  return (
    <Stack spacing={5}>      
      <Flex align="top" spacing={10}>
        <Box maxW="sm" borderWidth="1px" p="10" m="auto" borderRadius="lg" w="80%" maxWidth="initial">
          <Center flexDirection="column">
            <Heading size="lg">Data NFTs <Badge colorScheme="teal" fontSize="0.5em">Beta</Badge></Heading>
            <Image src={dataNFTIcon} boxSize="150px" m={5} borderRadius="md" />
            <HStack divider={<StackDivider borderColor="gray.200" />} spacing={4} alignItems="baseline">
              <Box align="center" flex="1">Highly personal or sensitive datasets can essentially function as a NFT allowing for uniqueness and limited availability</Box>
              <Box align="center" flex="1">Allow for resale in secondary markets (like OpenSea) and earn royalties if your data is resold. i.e. if a buyer resells your data, you can earn a % as royalty</Box>
              <Box align="center" flex="1">To make it more akin to a collectible, datasets are converted to a unique visual representation of that data using unique hash algorithms.                
              </Box>
            </HStack>
            
            <HStack spacing="5" mt="10">
              <Button colorScheme="teal" onClick={() => setMenuItem(MENU.NFTMINE)}>Data NFT Wallet</Button>
              <Button colorScheme="teal" onClick={() => setMenuItem(MENU.NFTALL)}>Data NFT Marketplace</Button>
            </HStack>

            <Stack mt="10" align="center">
              <Text>Our Cross-Chain NFT Marketplace is Powered by OpenSea</Text>
              <Image src={openSeaLogoIcon} w="150px" />
            </Stack>
            
            <Link mt="10" href="https://dev.to/itheum/itheum-data-dex-whitepaper-ooo#data-nfts-1" isExternal>
              <Button size="xs" colorScheme="teal" variant="outline">Read about Data NFTs in our Whitepaper</Button>
            </Link>
          </Center>
        </Box>        
      </Flex>
    </Stack>
  );
};
