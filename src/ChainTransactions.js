import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import { useMoralis, useMoralisQuery } from 'react-moralis';
import { Box, Stack, HStack } from '@chakra-ui/layout';
import {
  Skeleton, Alert, Text, Link, Badge,
  AlertIcon, AlertTitle, CloseButton, Heading,
  Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption,
  useToast,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons'
import ShortAddress from './ShortAddress';
import { config, mydaRoundUtil } from './util';
import { CHAIN_TX_VIEWER, CHAIN_TOKEN_SYMBOL, CHAIN_TX_LIST } from './util';
import { ChainMetaContext } from './contexts';

export default function() {
  const chainMeta = useContext(ChainMetaContext);
  const { user } = useMoralis();
  const { web3 } = useMoralis();

  const [allTx, setAllTx] = useState([]);

  const { data: advertiseEvents, error: errorAdvertiseEvents } = useMoralisQuery(CHAIN_TX_LIST[chainMeta.networkId].advertiseEvents, query =>
    query.descending("createdAt")
  );

  const { fetch: fetchPurchaseEvents, data: purchaseEvents, error: errorPurchaseEvents, isLoading } = useMoralisQuery(
    CHAIN_TX_LIST[chainMeta.networkId].purchaseEvents,
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
    return className.includes(CHAIN_TX_LIST[chainMeta.networkId].purchaseEvents);
  }

  function mydaRound(val) {
    return mydaRoundUtil(val, 18, web3.utils.BN);
  }

  return (
    <Stack spacing={5}>
      <Heading size="lg">Chain Transactions</Heading>

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
        <Box>
          <Table variant="simple">
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
                    {isPurchasedEvent(item.className) && 'Data Purchased' || 'Advertised for Sale'}
                  </Badge>
                </Td>
                <Td>{moment(item.createdAt).format(config.dateStrTm)}</Td>
                <Td><ShortAddress address={item.get('dataPackId')} /></Td>
                <Td>{item.get('seller') && <ShortAddress address={item.get('seller')} />}</Td>
                <Td>{item.get('buyer') && <ShortAddress address={item.get('buyer')} />}</Td>
                <Td>{item.get('feeInMyda') && `${mydaRound(item.get('feeInMyda'))} ${CHAIN_TOKEN_SYMBOL(chainMeta.networkId)}` }</Td>
                <Td>
                  <HStack>
                    <ShortAddress address={item.get('transaction_hash')} />
                    <Link href={`${CHAIN_TX_VIEWER[chainMeta.networkId]}${item.get('transaction_hash')}`} isExternal><ExternalLinkIcon mx="2px" /></Link>
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
