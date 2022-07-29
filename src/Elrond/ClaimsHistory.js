import { useState, useEffect } from 'react';
import { 
  Spinner, Box, Text, Link,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  TableContainer, Table, Thead, Tr, Th, Tbody, Td, Tfoot, useToast  } from '@chakra-ui/react';
import { getClaimTransactions, getTransactionLink } from './api';
import { useChainMeta } from "store/ChainMetaContext";
import { CloseIcon, WarningTwoIcon } from '@chakra-ui/icons';

export default function ChaimsHistory({elrondAddress, networkId, onAfterCloseChaimsHistory}) {
  const [claimTransactionsModalOpen, setClaimTransactionsModalOpen] = useState(true);
  const [elrondClaims, setElrondClaims] = useState([]);
  const [loadingClaims, setLoadingClaims] = useState(-1); // 0 is done, -1 is loading, -2 is an error
  const { chainMeta: _chainMeta, setChainMeta } = useChainMeta();
  const toast = useToast();

  useEffect(() => {
    fetchElrondClaims();
  },[]);

  const fetchElrondClaims = async () => {
    const transactions = await getClaimTransactions(elrondAddress, _chainMeta.contracts.claims, networkId);
    
    if (transactions.error) {
      toast({
        title: 'ER4: Could not get your recent transactions from the elrond blockchain.',
        status: 'error',
        isClosable: true,
        duration: null
      });

      setLoadingClaims(-2);
    } else {
      setElrondClaims(transactions);
      setLoadingClaims(0);
    }

    setClaimTransactionsModalOpen(true);
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
          {(loadingClaims === -1 || loadingClaims === -2) && 
            <Box minH="150" alignItems="center" display="flex" justifyContent="center">
              {loadingClaims === -1 ? <Spinner size="lg" /> : <WarningTwoIcon />}
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
                      <Link fontSize="sm" href={getTransactionLink(networkId, item.hash)} isExternal>{item.hash.slice(0, 5)}...{item.hash.slice(item.hash.length - 5, item.hash.length)}</Link>
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
