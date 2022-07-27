import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useMoralis, useMoralisQuery } from 'react-moralis';
import { Box, Stack, HStack } from '@chakra-ui/layout';
import {
  Alert, Text, Link, Badge,
  AlertIcon, AlertTitle, CloseButton, Heading,
  Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons'
import ShortAddress from 'UtilComps/ShortAddress';
import SkeletonLoadingList from 'UtilComps/SkeletonLoadingList';
import { config, itheumTokenRoundUtil } from 'libs/util';
import { CHAIN_TX_VIEWER, CHAIN_TOKEN_SYMBOL, CHAIN_TX_LIST } from 'libs/util';
import { useChainMeta } from 'store/ChainMetaContext';

export default function() {
  const { chainMeta: _chainMeta, setChainMeta } = useChainMeta();
  const { user, Moralis: {web3Library: ethers} } = useMoralis();
  const { web3 } = useMoralis();

  const [allTx, setAllTx] = useState([]);

  const { data: advertiseEvents, error: errorAdvertiseEvents } = useMoralisQuery(CHAIN_TX_LIST[_chainMeta.networkId].advertiseEvents, query =>
    query.descending("createdAt")
  );

  const { fetch: fetchPurchaseEvents, data: purchaseEvents, error: errorPurchaseEvents, isLoading } = useMoralisQuery(
    CHAIN_TX_LIST[_chainMeta.networkId].purchaseEvents,
    query =>
      query
        .descending("createdAt"),
    [],
    { autoFetch: false },
  );
  
  useEffect(() => {
    if (user && user.get('ethAddress') && advertiseEvents.length > 0) {
      setAllTx(prev => [...prev, ...advertiseEvents]);

      fetchPurchaseEvents();
    }
  }, [advertiseEvents]);

  useEffect(() => {
    if (user && user.get('ethAddress') && advertiseEvents.length > 0) {
      setAllTx(prev => [...prev, ...purchaseEvents]);
    }
  }, [purchaseEvents]);

  function isPurchasedEvent(className) {
    return className.includes(CHAIN_TX_LIST[_chainMeta.networkId].purchaseEvents);
  }

  function tokenRound(val) {
    return itheumTokenRoundUtil(val, 18, ethers.BigNumber);
  }

  return (
    <Stack spacing={5}>
      <Heading size="lg">Chain Transactions</Heading>
      <Heading size="xs" opacity=".7">Transparently monitor on-chain Data DEX trade activity</Heading>

      {errorAdvertiseEvents && 
        <Alert status="error">
          <Box flex="1">
            <AlertIcon />
            <AlertTitle>{errorAdvertiseEvents.message}</AlertTitle>
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" />
        </Alert>
      }

      {errorPurchaseEvents && 
        <Alert status="error">
          <Box flex="1">
            <AlertIcon />
            <AlertTitle>{errorPurchaseEvents.message}</AlertTitle>
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" />
        </Alert>
      }

      {advertiseEvents.length === 0 && 
        <SkeletonLoadingList /> || 
        <Box overflowX="auto">
          <Table variant="striped" mt="3" size="sm">
            <TableCaption>The following data dex transactions have happened on-chain</TableCaption>
            <Thead>
              <Tr>
                <Th>Event</Th>
                <Th>When</Th>
                <Th>Data Pack ID</Th>
                <Th>Seller</Th>
                <Th>Buyer</Th>
                <Th>Price Paid</Th>
                <Th>TX Hash</Th>
              </Tr>
            </Thead>
            <Tbody>
              {allTx.map((item) => <Tr key={item.id}>
                <Td>
                  <Badge borderRadius="full" px="2" colorScheme={isPurchasedEvent(item.className) && 'teal' || 'green' }>
                    {isPurchasedEvent(item.className) && 'Data Purchased' || 'Advertised for Trade'}
                  </Badge>
                </Td>
                <Td><Text fontSize="xs">{moment(item.createdAt).format(config.dateStrTm)}</Text></Td>
                <Td><ShortAddress address={item.get('dataPackId')} /></Td>
                <Td>{item.get('seller') && <ShortAddress address={item.get('seller')} />}</Td>
                <Td>{item.get('buyer') && <ShortAddress address={item.get('buyer')} />}</Td>
                <Td>{item.get('feeInMyda') && `${tokenRound(item.get('feeInMyda'))} ${CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)}` }</Td>
                <Td>
                  <HStack>
                    <ShortAddress address={item.get('transaction_hash')} />
                    <Link href={`${CHAIN_TX_VIEWER[_chainMeta.networkId]}${item.get('transaction_hash')}`} isExternal><ExternalLinkIcon mx="2px" /></Link>
                  </HStack>
                </Td> 
              </Tr>)}
            </Tbody>
            <Tfoot>
              <Tr>
                <Th>Event</Th>
                <Th>When</Th>
                <Th>Data Pack ID</Th>
                <Th>Seller</Th>
                <Th>Buyer</Th>
                <Th>Price Paid</Th>
                <Th>TX Hash</Th>
              </Tr>
            </Tfoot>
          </Table>
        </Box>}
    </Stack>
  );
};
