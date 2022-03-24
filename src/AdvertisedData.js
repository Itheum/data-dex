import moment from 'moment';
import React, { useContext, useState, useEffect } from 'react';
import { useMoralis, useMoralisQuery } from 'react-moralis';
import { Box, Stack } from '@chakra-ui/layout';
import {
  Skeleton, CloseButton, Text,
  Alert, AlertIcon, AlertTitle, Heading,
  Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption,
  useToast, useDisclosure, 
} from '@chakra-ui/react';
import ShortAddress from './UtilComps/ShortAddress';
import SkeletonLoadingList from './UtilComps/SkeletonLoadingList';
import { TERMS, CHAIN_TOKEN_SYMBOL } from './libs/util';
import { sleep } from './libs/util';
import { config } from './libs/util';
import { ChainMetaContext } from './libs/contexts';

export default function() {
  const chainMeta = useContext(ChainMetaContext);
  const toast = useToast();
  const { web3 } = useMoralis();
  const { user } = useMoralis();
  const [noData, setNoData] = useState(false);
  const [userAdvertisedData, setUserAdvertisedData] = useState([]);
  const { data: dataPacks, error: errorDataPackGet, isLoading } = useMoralisQuery("DataPack", query =>
    query.descending("createdAt") &&
    query.notEqualTo("txHash", null) &&
    query.equalTo("txNetworkId", chainMeta.networkId)
  );

  useEffect(() => {
    (async() => {
      if (dataPacks.length === 0) {
        await sleep(5);
        setNoData(true);
      } else {
        if (user && user.get('ethAddress')) {
          setUserAdvertisedData(dataPacks.filter(i => (i.get('sellerEthAddress') === user.get('ethAddress'))));
        }
      }
    })();
  }, [dataPacks]);

  return (
    <Stack spacing={5}>
      <Heading size="lg">Advertised Data</Heading>
      <Heading size="xs" opacity=".7">These are the Data Packs you have put up for direct peer-to-peer sale</Heading>

      {errorDataPackGet && 
        <Alert status="error">
          <Box flex="1">
            <AlertIcon />
            <AlertTitle>{errorDataPackGet.message}</AlertTitle>
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" />
        </Alert>
      }

      {userAdvertisedData.length === 0 &&
        <>{!noData && <SkeletonLoadingList /> || <Text>No data yet...</Text>}</> ||
        <Box overflowX="auto">
          <Table variant="striped" mt="3" size="sm">
            <TableCaption>The following data packs have been advertised for sale by you</TableCaption>
            <Thead>
              <Tr>
                <Th>When</Th>
                <Th>Data Pack ID</Th>
                <Th>Data Preview</Th>
                <Th>Data Hash</Th>
                <Th>Terms of use</Th>
                <Th>Cost</Th>
              </Tr>
            </Thead>
            <Tbody>
            {userAdvertisedData.map((item) => <Tr key={item.id}>
              <Td><Text fontSize="xs">{moment(item.createdAt).format(config.dateStrTm)}</Text></Td>
              <Td><ShortAddress address={item.id} /></Td>
              <Td><Text fontSize="sm">{item.get('dataPreview')}</Text></Td>
              <Td><ShortAddress address={item.get('dataHash')} /></Td>
              <Td><Text fontSize="sm">{item.get('termsOfUseId') && TERMS.find(i => i.id === item.get('termsOfUseId')).val}</Text></Td>
              <Td><Text fontSize="sm">{item.get('termsOfUseId') && TERMS.find(i => i.id === item.get('termsOfUseId')).coin} {CHAIN_TOKEN_SYMBOL(chainMeta.networkId)}</Text></Td>
            </Tr>)}
          </Tbody>
            <Tfoot>
              <Tr>
                <Th>When</Th>
                <Th>Data Pack ID</Th>
                <Th>Data Preview</Th>
                <Th>Data Hash</Th>
                <Th>Terms of use</Th>
                <Th>Cost</Th>
              </Tr>
            </Tfoot>
          </Table>        
        </Box>
      }
    </Stack>
  );
};
