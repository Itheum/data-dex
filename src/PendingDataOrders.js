import React, {useState} from 'react';
import { useMoralis, useMoralisQuery } from 'react-moralis';
import { Box, Stack, HStack } from '@chakra-ui/layout';
import {
  Skeleton,
  Alert, Text,
  AlertIcon,
  AlertTitle,
  CloseButton,
  Button,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  useToast,
} from '@chakra-ui/react';
import ShortAddress from './ShortAddress';

export default function() {
  const toast = useToast();
  const { user } = useMoralis();
  const { data: dataOrders, error: errorDataOrderGet, isLoading } = useMoralisQuery("DataOrder", query =>
    query.equalTo("state", "1")
  );

  return (
    <Stack spacing={5}>
      <Box></Box>
      {errorDataOrderGet && 
        <Alert status="error">
          <Box flex="1">
            <AlertIcon />
            <AlertTitle>{errorDataOrderGet.message}</AlertTitle>
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" />
        </Alert>
      }
      {(isLoading || dataOrders.length === 0) && <Stack>
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack> || 
        <Box>
          <Table variant="simple">
            <TableCaption>The following data orders need to be actioned</TableCaption>
            <Thead>
              <Tr>
                <Th>Data Order ID</Th>
                <Th>Data Pack ID</Th>
                <Th>Seller Address</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {dataOrders.map((item) => <Tr key={item.id}>
                <Td>{item.id}</Td>
                <Td>{item.get('dataPackId')}</Td>
                <Td><ShortAddress address={item.get('sellerEthAddress')}/></Td>
                <Td>
                {(item.get('sellerEthAddress') === user.get('ethAddress')) && 
                  <HStack>
                    <Button isLoading={false} colorScheme="red" onClick={() => console.log(item.id)}>Reject</Button>
                    <Button isLoading={false} colorScheme="green" onClick={() => console.log(item.id)}>Approve</Button>
                  </HStack> || <Text fontSize="xs">n/a</Text>}
                </Td>
              </Tr>)}
            </Tbody>
            <Tfoot>
              <Tr>
                <Th>Data Order ID</Th>
                <Th>Data Pack ID</Th>
                <Th>Seller Address</Th>
                <Th>Actions</Th>
              </Tr>
            </Tfoot>
          </Table>
        </Box>}
    </Stack>
  );
};
