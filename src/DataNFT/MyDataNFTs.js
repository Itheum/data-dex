import React, { useState, useEffect } from 'react';
import { useMoralis, useMoralisCloudFunction, useMoralisWeb3Api } from 'react-moralis';
import { Box, Stack } from '@chakra-ui/layout';
import {
  Skeleton, CloseButton, HStack, Badge,
  Alert, AlertIcon, AlertTitle, Heading, Image, Flex, Link, Text, Tooltip
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import ShortAddress from 'UtilComps/ShortAddress';
import SkeletonLoadingList from 'UtilComps/SkeletonLoadingList';
import { sleep, buyOnOpenSea, contractsForChain } from 'libs/util';
import { CHAIN_TOKEN_SYMBOL, OPENSEA_CHAIN_NAMES, CHAIN_NAMES, CHAIN_TX_VIEWER } from 'libs/util';
import { useChainMeta } from 'store/ChainMetaContext';

export default function() {
  const { chainMeta: _chainMeta, setChainMeta } = useChainMeta();
  const { isAuthenticated, user, isInitialized, isWeb3Enabled } = useMoralis();
  const Web3Api = useMoralisWeb3Api();
  
  const [onChainNFTs, setOnChainNFTs] = useState(null);
  const [onChainMetadataMap, setOnChainMetadataMap] = useState({});
  const [oneNFTImgLoaded, setOneNFTImgLoaded] = useState(false);
  const [noData, setNoData] = useState(false);

  const {
    error: cfErr_getUserDataNFTCatalog,
    fetch: cf_getUserDataNFTCatalog,
    data: usersDataNFTCatalog,
  } = useMoralisCloudFunction('getUserDataNFTCatalog', {
    ethAddress: user.get('ethAddress'),
    networkId: _chainMeta.networkId,
    myOnChainNFTs: onChainNFTs
  }, { autoFetch: false });

  useEffect(() => {
    if (isInitialized) {
      getOnChainNFTs();
    }
  }, [user, isWeb3Enabled, isAuthenticated]);

  useEffect(() => {
    (async() => {
      if (onChainNFTs !== null) {
        if (onChainNFTs.length > 0) {
          const onChainMetadataMap = {};
    
          onChainNFTs.map(i => {
            const nftMetadata = JSON.parse(i.metadata);
            onChainMetadataMap[nftMetadata?.properties?.data_dex_nft_id] = nftMetadata;
          });
    
          setOnChainMetadataMap(onChainMetadataMap);
    
          // we now have all data to call the CF
          cf_getUserDataNFTCatalog();
        } else {
          await sleep(5);
          setNoData(true);
        }
      }
    })();
  }, [onChainNFTs]);

  const getOnChainNFTs = async() => {
    if (user && isWeb3Enabled && isAuthenticated) {
      console.log(Web3Api.account);
      const myNFTs = await Web3Api.account.getNFTs({
        chain: CHAIN_NAMES[_chainMeta.networkId]
      });

      console.log('🚀 ~ getOnChainNFTs ~ myNFTs', myNFTs);

      setOnChainNFTs(myNFTs.result);
    }
  }

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
        <>{!noData && <SkeletonLoadingList /> || <Text onClick={getOnChainNFTs}>No data yet...</Text>}</> ||
        <Flex wrap="wrap" spacing={5}>
          {usersDataNFTCatalog && usersDataNFTCatalog.map((item) => <Box key={item.id} maxW="xs" borderWidth="1px" borderRadius="lg" overflow="hidden" mr="1rem" w="250px" mb="1rem">
            <Flex justifyContent="center" pt={5}>
              <Skeleton isLoaded={oneNFTImgLoaded} h={200}>
                <Image src={item.nftImgUrl} alt={item.dataPreview} h={200} w={200} borderRadius="md" onLoad={() => setOneNFTImgLoaded(true)} />
              </Skeleton>
            </Flex>

            <Flex p="3" direction="column" justify="space-between" height="250px">
              <Box
                fontSize="sm"
                mt="1"
                fontWeight="semibold"
                as="h4"
                lineHeight="tight">
                {item.nftName}
              </Box>

              <Box as="span" color="gray.600" fontSize="sm" flexGrow="1">
                {`${item.feeInMyda} ${CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)}`}
              </Box>

              <Box mt="5">
                {item.stillOwns && <Badge borderRadius="full" px="2" colorScheme="teal">
                  {item.originalOwner && 'you are the owner' || 'you are the creator & owner' }
                </Badge> || <Badge borderRadius="full" px="2" colorScheme="red" display="none">
                  sold
                </Badge>}

                <Badge borderRadius="full" px="2" colorScheme="blue">
                  Fully Transferable License
                </Badge>

                <Badge borderRadius="full" px="2" colorScheme="blue">
                  {onChainMetadataMap[item.id]?.properties?.data_nft_type === 'datastream' ? 'Data Stream' : 'Data File'}
                </Badge>

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
                  {onChainMetadataMap[item.id]?.properties?.data_nft_type === 'datastream' ? 
                    <Link href={onChainMetadataMap[item.id]?.properties?.stream_url} isExternal><ExternalLinkIcon mx="2px" /></Link>
                  : 
                    <Link href={item.dataFileUrl} isExternal><ExternalLinkIcon mx="2px" /></Link>
                  }
                </HStack>
              </Box>              
            </Flex>
          </Box>)}
          
        </Flex>
      }
    </Stack>
  );
};
