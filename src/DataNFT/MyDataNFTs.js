import moment from 'moment';
import React, { useContext, useState, useEffect } from 'react';
import { useMoralis, useMoralisQuery } from 'react-moralis';
import { Box, Stack } from '@chakra-ui/layout';
import {
  Skeleton, CloseButton, HStack,
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

  const [userDataNFTs, setUserDataNFTs] = useState([]);
  const { data: dataNFTs, error: errorDataNFTsGet, isLoading } = useMoralisQuery("DataNFT", query =>
    query.descending("createdAt") &&
    query.notEqualTo("txHash", null) &&
    query.equalTo("txNetworkId", chainMeta.networkId)
  );

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
  }, [onChainNFTs]);

  useEffect(() => {
    if (user && user.get('ethAddress') && dataNFTs.length > 0) {
      console.log('🚀 ~ useEffect ~ dataNFTs', dataNFTs);
      setUserDataNFTs(dataNFTs.filter(i => (i.get('sellerEthAddress') === user.get('ethAddress'))));
    }
  }, [dataNFTs]);

  return (
    <Stack spacing={5}>
      <Heading size="lg">My Data NFTs</Heading>

      {errorDataNFTsGet && 
        <Alert status="error">
          <Box flex="1">
            <AlertIcon />
            <AlertTitle>{errorDataNFTsGet.message}</AlertTitle>
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" />
        </Alert>
      }

      {userDataNFTs.length === 0 &&
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

          {userDataNFTs.map((item) => <Box key={item.id} maxW="xs" borderWidth="1px" borderRadius="lg" overflow="hidden" ml="1rem" w="250px">
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
                <HStack>
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
