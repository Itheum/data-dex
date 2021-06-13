import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { useMoralis, useMoralisQuery } from 'react-moralis';
import { Box, Stack } from '@chakra-ui/layout';
import {
  Skeleton, CloseButton, 
  Alert, AlertIcon, AlertTitle, Heading,
  Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption,
  useToast, useDisclosure, 
} from '@chakra-ui/react';
import ShortAddress from './ShortAddress';
import { TERMS } from './util';
import { config } from './util';

export default function() {
  const toast = useToast();
  const { web3 } = useMoralis();
  const { user } = useMoralis();
  const [userAdvertisedData, setSserAdvertisedData] = useState([]);
  const { data: dataPacks, error: errorDataPackGet, isLoading } = useMoralisQuery("DataPack", query =>
    query.ascending("createdAt") &&
    query.notEqualTo("txHash", null)
  );

  useEffect(() => {
    if (user && user.get('ethAddress') && dataPacks.length > 0) {
      setSserAdvertisedData(dataPacks.filter(i => (i.get('sellerEthAddress') === user.get('ethAddress'))));
    }
  }, [dataPacks]);

  return (
    <Stack spacing={5}>
      <Heading size="lg">Advertised Data</Heading>

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
            <TableCaption>The following data packs have been advertised for purchase by you</TableCaption>
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
              <Td>{moment(item.createdAt).format(config.dateStrTm)}</Td>
              <Td><ShortAddress address={item.id} /></Td>
              <Td>{item.get('dataPreview')}</Td>
              <Td><ShortAddress address={item.get('dataHash')} /></Td>
              <Td>{item.get('termsOfUseId') && TERMS.find(i => i.id === item.get('termsOfUseId')).val}</Td>
              <Td>{item.get('termsOfUseId') && TERMS.find(i => i.id === item.get('termsOfUseId')).coin} MYDA</Td>
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
