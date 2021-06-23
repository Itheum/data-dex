import React, { useState, useEffect } from 'react';
import { Box, Stack } from '@chakra-ui/layout';
import {
  Button, Link, Badge, Flex, Image, StackDivider,
  HStack, Heading, Center, Text
} from '@chakra-ui/react';
import dataNFTIcon from './img/data-nft-icon.png';
import chainlinkLogoIcon from './img/chainlink-logo.png';

export default function() {

  return (
    <Stack spacing={5}>      
      <Flex align="top" spacing={10}>
        <Box maxW="sm" borderWidth="1px" p="10" m="auto" borderRadius="lg" w="80%" maxWidth="initial">
          <Center flexDirection="column">
            <Heading size="lg">Data NFT Marketplace <Badge variant="outline" colorScheme="green">Coming Soon</Badge></Heading>
            <Image src={dataNFTIcon} boxSize="150px" />
            <HStack divider={<StackDivider borderColor="gray.200" />} spacing={4} alignItems="baseline">
              <Box align="center" flex="1">Convert highly personal or sensitive datasets into NFTs - allowing for uniqueness and limited availability to prevent over sharing of data. If re-sales happen, the original NFT minter (you!) earn royalties on it</Box>
              <Box align="center" flex="1">For example, your might want to share your DNA data under the "research only" terms -  but you want to limit how many buyers can purchase it -  data NFTs allow you to do this</Box>
              <Box align="center" flex="1">To make it more akin to a collectible, datasets are converted to a unique visual representation of that data using unique hash algorithms.
                <HStack>
                  <Image src={chainlinkLogoIcon} boxSize="75px" objectFit="contain"></Image>
                  <Text fontSize="sm" opacity=".7">Powered by Chainlink VRF</Text>
                </HStack>
              </Box>
            </HStack>
            <Link mt="10" href="https://itheum.medium.com/itheum-data-dex-whitepaper-fc6b205636b6#c91e" isExternal>
              <Button colorScheme="teal" variant="outline">Read about Data NFTs in our Whitepaper</Button>
            </Link>
          </Center>
        </Box>        
      </Flex>
    </Stack>
  );
};
