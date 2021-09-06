import moment from 'moment';
import React, { useContext, useState, useEffect } from 'react';
import { useMoralis, useMoralisQuery, useMoralisCloudFunction } from 'react-moralis';
import { Box, Stack } from '@chakra-ui/layout';
import {
  Skeleton, CloseButton, HStack, Badge, ButtonGroup, Button,
  Alert, AlertIcon, AlertTitle, Heading, Image, Flex, Link, Text,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import ShortAddress from '../UtilComps/ShortAddress';
import { TERMS, CHAIN_TOKEN_SYMBOL, OPENSEA_CHAIN_NAMES, CHAIN_NAMES, CHAIN_TX_VIEWER, CHAINS } from '../libs/util';
import { ChainMetaContext } from '../libs/contexts';

export default function() {
  const chainMeta = useContext(ChainMetaContext);
  const { user } = useMoralis();
  const { web3 } = useMoralis();
  
  const { isInitialized, Moralis } = useMoralis();
  const [onChainNFTs, setOnChainNFTs] = useState(null);
  const [oneNFTImgLoaded, setOneNFTImgLoaded] = useState(false);

  const {
    error: cfErr_getUserDataNFTCatalog,
    fetch: cf_getUserDataNFTCatalog,
    data: usersDataNFTCatalog,
  } = useMoralisCloudFunction("getAllDataNFTs", {
    ethAddress: user.get('ethAddress'),
    networkId: chainMeta.networkId,
    myOnChainNFTs: onChainNFTs
  }, { autoFetch: false });  

  useEffect(() => {
    console.log('MOUNT MyDataNFTs');
  }, []);

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

    if (onChainNFTs !== null) {
      // we now have all data to call the CF
      cf_getUserDataNFTCatalog();
    }
  }, [onChainNFTs]);

  useEffect(() => {
    console.log('usersDataNFTCatalog');
    console.log(usersDataNFTCatalog);
  }, [usersDataNFTCatalog]);

  function buyOnOpenSea(txNFTId) {
    window.open(`https://testnets.opensea.io/assets/${OPENSEA_CHAIN_NAMES[chainMeta.networkId]}/${chainMeta.contracts.dnft}/${txNFTId}`);
  }

  const buyOrderSubmit = () => {
    console.log('buyOrderSubmit');
  }

  return (
    <Stack spacing={5}>
      <Heading size="lg">Data NFT Marketplace</Heading>
      <Heading size="xs" opacity=".7">Browse, View and Buy Cross-Chain Data NFTs</Heading>

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
        <Flex wrap="wrap" spacing={5}>

          {usersDataNFTCatalog.map((item) => <Box key={item.id} maxW="xs" borderWidth="1px" borderRadius="lg" overflow="wrap" mr="1rem" w="250px" mb="1rem">
            <Flex justifyContent="center">
              <Skeleton isLoaded={oneNFTImgLoaded}>
                <Image src={item.nftImgUrl} alt={item.dataPreview} pt="1rem" onLoad={() => setOneNFTImgLoaded(true)} />
              </Skeleton>
            </Flex>

            <Box p="3">
              <Box
                mt="1"
                fontWeight="semibold"
                as="h4"
                lineHeight="tight">
                {item.nftName}
              </Box>

              <Box>
                <Box as="span" color="gray.600" fontSize="sm">
                  {`${item.feeInMyda} ${CHAIN_TOKEN_SYMBOL(chainMeta.networkId)}`}
                </Box>
              </Box>

              <Box mt="5">  
                <Text>For Sale on <Badge borderRadius="full" px="2" colorScheme="teal">{CHAINS[item.txNetworkId]}</Badge></Text>

                <HStack mt="5">
                  <Text fontSize="xs">Seller: </Text>
                  <ShortAddress address={item.sellerEthAddress} />
                </HStack>

                <HStack mt=".5">
                  <Text fontSize="xs">Mint TX: </Text>
                  <ShortAddress address={item.txHash} />
                  <Link href={`${CHAIN_TX_VIEWER[chainMeta.networkId]}${item.txHash}`} isExternal><ExternalLinkIcon mx="2px" /></Link>
                </HStack>

                <ButtonGroup colorScheme="teal" spacing="3" size="sm" mt="5">
                  <Button isLoading={false} onClick={() => buyOnOpenSea(item.txNFTId)}>Buy on OpenSea</Button>
                  {(item.txNetworkId === chainMeta.networkId) && <Button display="none" isLoading={false}  onClick={() => buyOrderSubmit(item.id)}>Buy Now</Button>}
                </ButtonGroup>
              </Box>              
            </Box>
          </Box>)}
          
        </Flex>
      }
    </Stack>
  );
};
