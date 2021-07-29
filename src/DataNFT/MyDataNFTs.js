import moment from 'moment';
import React, { useContext, useState, useEffect } from 'react';
import { useMoralis, useMoralisQuery, useMoralisCloudFunction } from 'react-moralis';
import { Box, Stack } from '@chakra-ui/layout';
import {
  Skeleton, CloseButton, HStack, Badge,
  Alert, AlertIcon, AlertTitle, Heading, Image, Flex, Link, Text,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import ShortAddress from '../ShortAddress';
import { TERMS, CHAIN_TOKEN_SYMBOL, OPENSEA_CHAIN_NAMES, CHAIN_NAMES, CHAIN_TX_VIEWER } from '../util';
import { config } from '../util';
import { ChainMetaContext } from '../contexts';

export default function() {
  const chainMeta = useContext(ChainMetaContext);
  const { user } = useMoralis();
  const { web3 } = useMoralis();
  
  const { isInitialized, Moralis } = useMoralis();
  const [onChainNFTs, setOnChainNFTs] = useState([]);
  const [oneNFTImgLoaded, setOneNFTImgLoaded] = useState(false);

  const {
    error: cfErr_getUserDataNFTCatalog,
    fetch: cf_getUserDataNFTCatalog,
    data: usersDataNFTCatalog,
  } = useMoralisCloudFunction("getUserDataNFTCatalog", {
    ethAddress: user.get('ethAddress'),
    networkId: chainMeta.networkId,
    myOnChainNFTs: onChainNFTs
  }, { autoFetch: false });  

  useEffect(() => {
    async function getOnChainNFTs () {
      const myNFTs = await Moralis.Web3.getNFTs({
        chain: CHAIN_NAMES[chainMeta.networkId],
        address: user.get('ethAddress')
      });

      setOnChainNFTs(myNFTs);
    }

    if (isInitialized) {
      getOnChainNFTs();
    }
  }, [isInitialized, Moralis]);

  useEffect(() => {
    console.log('onChainNFTs');
    console.log(onChainNFTs);

    // we now have all data to call the CF
    cf_getUserDataNFTCatalog();
  }, [onChainNFTs]);

  useEffect(() => {
    console.log('usersDataNFTCatalog');
    console.log(usersDataNFTCatalog);
  }, [usersDataNFTCatalog]);

  return (
    <Stack spacing={5}>
      <Heading size="lg">Data NFT Catalog</Heading>

      {cfErr_getUserDataNFTCatalog && 
        <Alert status="error">
          <Box flex="1">
            <AlertIcon />
            <AlertTitle>{cfErr_getUserDataNFTCatalog.message}</AlertTitle>
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" />
        </Alert>
      }

      {usersDataNFTCatalog.length === 0 &&
        <Stack w="1000px">
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Box />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
        </Stack> || 
        <Flex>

          {usersDataNFTCatalog.map((item) => <Box key={item.id} maxW="xs" borderWidth="1px" borderRadius="lg" overflow="hidden" ml="1rem" w="250px">
            <Flex justifyContent="center">
              <Skeleton isLoaded={oneNFTImgLoaded}>
                <Image src={item.get('nftImgUrl')} alt={item.get('dataPreview')} pt="1rem" onLoad={() => setOneNFTImgLoaded(true)} />
              </Skeleton>
            </Flex>

            <Box p="3">
              <Box
                mt="1"
                fontWeight="semibold"
                as="h4"
                lineHeight="tight">
                {item.get('nftName')}
              </Box>

              <Box mt="5">  
                {item.get('stillOwns') && <Badge borderRadius="full" px="2" colorScheme="teal">
                  you are the owner
                </Badge> || <Badge borderRadius="full" px="2" colorScheme="red">
                  sold
                </Badge>}

                <HStack mt="3">
                  <Text fontSize="xs">Mint TX: </Text>
                  <ShortAddress address={item.get('txHash')} />
                  <Link href={`${CHAIN_TX_VIEWER[chainMeta.networkId]}${item.get('txHash')}`} isExternal><ExternalLinkIcon mx="2px" /></Link>
                </HStack>

                <HStack mt=".5">
                  <Text fontSize="xs">OpenSea Listing: </Text>
                  <Link href={`https://testnets.opensea.io/assets/${OPENSEA_CHAIN_NAMES[chainMeta.networkId]}/${chainMeta.contracts.dnft}/${item.get('txNFTId')}`} isExternal><ExternalLinkIcon mx="2px" /></Link>
                </HStack>
              </Box>              
            </Box>
          </Box>)}
          
        </Flex>
      }
    </Stack>
  );
};
