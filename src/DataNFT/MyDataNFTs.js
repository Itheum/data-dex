import moment from 'moment';
import React, { useContext, useState, useEffect } from 'react';
import { useMoralis, useMoralisQuery, useMoralisCloudFunction, useMoralisWeb3Api } from 'react-moralis';
import { Box, Stack } from '@chakra-ui/layout';
import {
  Skeleton, CloseButton, HStack, Badge, Button,
  Alert, AlertIcon, AlertTitle, Heading, Image, Flex, Link, Text,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import ShortAddress from '../UtilComps/ShortAddress';
import SkeletonLoadingList from '../UtilComps/SkeletonLoadingList';
import { sleep, buyOnOpenSea, contractsForChain } from '../libs/util';
import { TERMS, CHAIN_TOKEN_SYMBOL, OPENSEA_CHAIN_NAMES, CHAIN_NAMES, CHAIN_TX_VIEWER } from '../libs/util';
import { ChainMetaContext } from '../libs/contexts';

export default function() {
  const chainMeta = useContext(ChainMetaContext);
  const { user } = useMoralis();
  const { web3 } = useMoralis();
  const Web3Api = useMoralisWeb3Api();
  
  const { isInitialized, Moralis } = useMoralis();
  const [onChainNFTs, setOnChainNFTs] = useState(null);
  const [oneNFTImgLoaded, setOneNFTImgLoaded] = useState(false);
  const [noData, setNoData] = useState(false);
  const [showRoboHashTnk, setShowRoboHashTnk] = useState(false);

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
    console.log('MOUNT MyDataNFTs');
  }, []);

  useEffect(() => {
    async function getOnChainNFTs () {
      const myNFTs = await Web3Api.account.getNFTs({
        chain: CHAIN_NAMES[chainMeta.networkId]
      });

      console.log('🚀 ~ getOnChainNFTs ~ myNFTs', myNFTs);

      setOnChainNFTs(myNFTs.result);
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
    (async() => {
      console.log('usersDataNFTCatalog');
      console.log(usersDataNFTCatalog);

      if (usersDataNFTCatalog && usersDataNFTCatalog.length === 0) {
        await sleep(5);
        setNoData(true);
      } else {
        if (usersDataNFTCatalog) {
          setShowRoboHashTnk(true);
        }
      }
    })();
  }, [usersDataNFTCatalog]);

  return (
    <Stack spacing={5}>
      <Heading size="lg">Data NFT Wallet</Heading>
      <Heading size="xs" opacity=".7">Below are the Data NFTs you created and/or purchased on the current chain</Heading>

      {cfErr_getUserDataNFTCatalog && 
        <Alert status="error">
          <Box flex="1">
            <AlertIcon />
            <AlertTitle>{cfErr_getUserDataNFTCatalog.message}</AlertTitle>
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" />
        </Alert>
      }

      {(!usersDataNFTCatalog || usersDataNFTCatalog && usersDataNFTCatalog.length === 0) &&
        <>{!noData && <SkeletonLoadingList /> || <Text>No data yet...</Text>}</> ||
        <Flex wrap="wrap" spacing={5}>
          {usersDataNFTCatalog && usersDataNFTCatalog.map((item) => <Box key={item.id} maxW="xs" borderWidth="1px" borderRadius="lg" overflow="hidden" mr="1rem" w="250px" mb="1rem">
            <Flex justifyContent="center">
              <Skeleton isLoaded={oneNFTImgLoaded}>
                <Image src={item.nftImgUrl} alt={item.dataPreview} pt="1rem" onLoad={() => setOneNFTImgLoaded(true)} w={200} />
              </Skeleton>
            </Flex>

            <Flex p="3" direction="column" justify="space-between" height="250px">
              <Box
                mt="1"
                fontWeight="semibold"
                as="h4"
                lineHeight="tight">
                {item.nftName}
              </Box>

              <Box as="span" color="gray.600" fontSize="sm" flexGrow="1">
                {`${item.feeInMyda} ${CHAIN_TOKEN_SYMBOL(chainMeta.networkId)}`}
              </Box>

              <Box mt="5">  
                {item.stillOwns && <Badge borderRadius="full" px="2" colorScheme="teal">
                  {item.originalOwner && 'you are the owner' || 'you are the creator & owner' }
                </Badge> || <Badge borderRadius="full" px="2" colorScheme="red" display="none">
                  sold
                </Badge>}

                <HStack mt="5">
                  <Text fontSize="xs">Mint TX: </Text>
                  <ShortAddress address={item.txHash} />
                  <Link href={`${CHAIN_TX_VIEWER[item.txNetworkId]}${item.txHash}`} isExternal><ExternalLinkIcon mx="2px" /></Link>
                </HStack>

                {OPENSEA_CHAIN_NAMES[item.txNetworkId] &&
                  <HStack mt=".5">
                    <Text fontSize="xs">OpenSea Listing: </Text>
                    <Link onClick={() => buyOnOpenSea(item.txNFTId, contractsForChain(item.txNetworkId).dnft, item.txNetworkId)}><ExternalLinkIcon mx="2px" /></Link>
                  </HStack>}

                <HStack mt=".5">
                  <Text fontSize="xs">Download Data File</Text>
                  <Link href={item.dataFileUrl} isExternal><ExternalLinkIcon mx="2px" /></Link>
                </HStack>
              </Box>              
            </Flex>
          </Box>)}
          
        </Flex>
      }

      {showRoboHashTnk && <Text fontSize="xs" textAlign="center" opacity=".2" pb="10">Robots lovingly delivered by Robohash.org</Text>}
    </Stack>
  );
};
