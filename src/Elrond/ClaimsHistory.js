import { useState, useEffect } from 'react';
import { 
  Spinner, Box, Text, Link,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  TableContainer, Table, Thead, Tr, Th, Tbody, Td, Tfoot  } from '@chakra-ui/react';
import { getClaimTransactions, getTransactionLink } from './api';
import { claimsContractAddress_Elrond } from '../libs/contactAddresses';
import { CloseIcon } from '@chakra-ui/icons';
import { CHAINS } from '../libs/util';

export default function ChaimsHistory({elrondAddress, networkId, onAfterCloseChaimsHistory}) {
  const [claimTransactionsModalOpen, setClaimTransactionsModalOpen] = useState(true);
  const [elrondClaims, setElrondClaims] = useState([]);
  const [loadingClaims, setLoadingClaims] = useState(true);

  useEffect(() => {
    fetchElrondClaims();
  },[]);

  const fetchElrondClaims = async () => {
    const transactions = await getClaimTransactions(elrondAddress, claimsContractAddress_Elrond, CHAINS[networkId]);
    setElrondClaims(transactions);
    setClaimTransactionsModalOpen(true);

    setLoadingClaims(false);
  }

  return (
    <Modal isOpen={claimTransactionsModalOpen} onClose={() => {
        onAfterCloseChaimsHistory();
        setClaimTransactionsModalOpen(false);
      }} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Recent Claim Transactions</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loadingClaims && 
            <Box minH="150" alignItems="center" display="flex" justifyContent="center">
              <Spinner size="lg" />
            </Box> 
          || 
            <>
            {elrondClaims.length > 0 && 
              <TableContainer>
              <Table variant="striped" size="sm">
                <Thead>
                  <Tr>
                    <Th textAlign="center">When</Th>
                    <Th textAlign="center">Hash</Th>
                    <Th textAlign="center">Type</Th>
                    <Th textAlign="center">Amount</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {elrondClaims.map((item) => <Tr key={item.hash}>
                    <Td textAlign="center"><Text fontSize="xs">
                      {item.status === "success" ? '' : <CloseIcon fontSize="xs" color="red" verticalAlign="baseline"></CloseIcon>}
                      {' '}
                      {new Date(item.timestamp).toLocaleString()}
                    </Text></Td>
                    <Td textAlign="center">
                      <Link fontSize="sm" href={getTransactionLink(CHAINS[networkId], item.hash)} isExternal>{item.hash.slice(0, 5)}...{item.hash.slice(item.hash.length - 5, item.hash.length)}</Link>
                    </Td>
                    <Td textAlign="center"><Text fontSize="sm">{item.claimType}</Text></Td>
                    <Td textAlign="center"><Text fontSize="sm">{item.amount / Math.pow(10, 18).toFixed(2)}</Text></Td>
                  </Tr>)}
                </Tbody>
                <Tfoot>
                  <Tr>
                    <Th textAlign="center">When</Th>
                    <Th textAlign="center">Hash</Th>
                    <Th textAlign="center">Type</Th>
                    <Th textAlign="center">Amount</Th>
                  </Tr>
                </Tfoot>
              </Table>
              </TableContainer> || 
              <Box minH="150" alignItems="center" display="flex" justifyContent="center">
                No claims yet...
              </Box>
            }
            </>     
          }
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
