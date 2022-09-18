import { useState, useEffect } from 'react';
import { 
  Spinner, Box, Text, Link,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  TableContainer, Table, Thead, Tr, Th, Tbody, Td, Tfoot, useToast, useBreakpointValue } from '@chakra-ui/react';
import { getClaimTransactions, getTransactionLink } from './api';
import { useChainMeta } from 'store/ChainMetaContext';
import { CloseIcon, WarningTwoIcon, ExternalLinkIcon } from '@chakra-ui/icons';

export default function ChaimsHistory({ elrondAddress, networkId, onAfterCloseChaimsHistory }) {
  const [claimTransactionsModalOpen, setClaimTransactionsModalOpen] = useState(true);
  const [elrondClaims, setElrondClaims] = useState([]);
  const [loadingClaims, setLoadingClaims] = useState(-1); // 0 is done, -1 is loading, -2 is an error
  const { chainMeta: _chainMeta, setChainMeta } = useChainMeta();
  const toast = useToast();

  useEffect(() => {
    fetchElrondClaims();
  }, []);

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

  const modelSize = useBreakpointValue({ base: 'xs', md: 'xl' });

  return (
    <Modal isOpen={claimTransactionsModalOpen} onClose={() => {
        onAfterCloseChaimsHistory();
        setClaimTransactionsModalOpen(false);
      }} size={modelSize} scrollBehavior="inside">
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
                    <Th>When</Th>
                    <Th>Hash</Th>
                    <Th>Type</Th>
                    <Th textAlign="center">Amount</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {elrondClaims.map((item) => <Tr key={item.hash}>
                    <Td><Text fontSize="xs">                      
                      {new Date(item.timestamp).toLocaleString()}                      
                    </Text></Td>
                    <Td>                      
                      <Link fontSize="sm" href={getTransactionLink(networkId, item.hash)} isExternal>
                        <ExternalLinkIcon mx="2px" /> {item.hash.slice(0, 5)}...{item.hash.slice(item.hash.length - 5, item.hash.length)}
                      </Link>
                      {item.status === 'success' ? '' : <CloseIcon ml="2" fontSize="xs" color="red" verticalAlign="baseline"></CloseIcon>}
                    </Td>
                    <Td><Text fontSize="sm">{item.claimType}</Text></Td>
                    <Td textAlign="center"><Text fontSize="sm">{item.amount / Math.pow(10, 18).toFixed(2)}</Text></Td>
                  </Tr>)}
                </Tbody>
                <Tfoot>
                  <Tr>
                    <Th>When</Th>
                    <Th>Hash</Th>
                    <Th>Type</Th>
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
