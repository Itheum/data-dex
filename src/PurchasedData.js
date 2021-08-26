import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import { useMoralis, useMoralisCloudFunction } from 'react-moralis';
import { Box, Stack, HStack } from '@chakra-ui/layout';
import {
  Skeleton, Alert, Link, Text,
  AlertIcon, AlertTitle, CloseButton, Heading,
  Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption,
  useToast,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import ShortAddress from './UtilComps/ShortAddress';
import { config } from './libs/util';
import { CHAIN_TX_VIEWER, CHAIN_TOKEN_SYMBOL, TERMS } from './libs/util';
import { ChainMetaContext } from './libs/contexts';

export default function() {
  const chainMeta = useContext(ChainMetaContext);
  const toast = useToast();
  const { user } = useMoralis();
  const [userDataOrders, setUserDataOrders] = useState([]);

  const {
    error: errCfUsrPurOrders,
    isLoading: loadingUsrPurOrders,
    fetch: doUsrPurOrders,
    data: dataUsrPurOrders
  } = useMoralisCloudFunction("getUserPurchaseDataOrders", {
    userAddress: user.get('ethAddress'),
    networkId: chainMeta.networkId
  }, { autoFetch: false });  

  useEffect(() => {
    if (user && user.get('ethAddress')) {
      console.log('Page loaded');
      doUsrPurOrders();
    }
  }, []);


  useEffect(() => {
    if (!errCfUsrPurOrders && dataUsrPurOrders && dataUsrPurOrders.length > 0) {
      setUserDataOrders(dataUsrPurOrders);
    }
  }, [errCfUsrPurOrders, dataUsrPurOrders]);

  return (
    <Stack spacing={5}>
      <Heading size="lg">Purchased Data</Heading>
      <Heading size="xs" opacity=".7">View Data Packs you have purchased direct from your peers</Heading>

      {errCfUsrPurOrders && 
        <Alert status="error">
          <Box flex="1">
            <AlertIcon />
            <AlertTitle>{errCfUsrPurOrders.message}</AlertTitle>
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" />
        </Alert>
      }
      {userDataOrders.length === 0 && 
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
          <Table variant="simple" mt="3">
            <TableCaption>The following data was purchased by you</TableCaption>
            <Thead>
              <Tr>
                <Th>When</Th>
                <Th>Data Order ID</Th>
                <Th>Data Pack ID</Th>
                <Th>Seller Address</Th>
                <Th>Data Preview</Th>
                <Th>Terms of use</Th>
                <Th>Data File</Th>
                <Th>Price Paid</Th>
                <Th>TX Hash</Th>
              </Tr>
            </Thead>
            <Tbody>
              {userDataOrders.map((item) => <Tr key={item.objectId}>
                <Td><Text fontSize="sm">{moment(item.createdAt).format(config.dateStrTm)}</Text></Td>
                <Td><ShortAddress address={item.objectId} /></Td>
                <Td><ShortAddress address={item.dataPackId} /></Td>
                <Td><ShortAddress address={item.dataPack[0].sellerEthAddress} /></Td>
                <Td><Text fontSize="sm">{item.dataPack[0].dataPreview}</Text></Td>
                <Td><Text fontSize="sm">{TERMS.find(i => i.id === item.dataPack[0].termsOfUseId).val}</Text></Td>
                <Td><Link href={item.dataFileUrl} isExternal><Text fontSize="sm">Download Data File <ExternalLinkIcon mx="2px" /></Text></Link></Td>
                <Td><Text fontSize="sm">{item.pricePaid} {CHAIN_TOKEN_SYMBOL(chainMeta.networkId)}</Text></Td>
                <Td>
                  <HStack>
                    <ShortAddress address={item.txHash} />
                    <Link href={`${CHAIN_TX_VIEWER[chainMeta.networkId]}${item.txHash}`} isExternal><ExternalLinkIcon mx="2px" /></Link>
                  </HStack>
                </Td>
              </Tr>)}
            </Tbody>
            <Tfoot>
              <Tr>
                <Th>When</Th>
                <Th>Data Order ID</Th>
                <Th>Data Pack ID</Th>
                <Th>Seller Address</Th>
                <Th>Data Preview</Th>
                <Th>Terms of use</Th>
                <Th>Data File</Th>
                <Th>Price Paid</Th>
                <Th>TX Hash</Th>
              </Tr>
            </Tfoot>
          </Table>
        </Box>}
    </Stack>
  );
};
