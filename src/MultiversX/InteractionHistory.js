import React, { useState, useEffect } from "react";
import { CloseIcon, WarningTwoIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Spinner,
  Box,
  Text,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Tfoot,
  useToast,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useChainMeta } from "store/ChainMetaContext";
import { getInteractionTransactions, getTransactionLink } from "./api";

export default function InteractionsHistory({ mxAddress, networkId, onAfterCloseInteractionsHistory }) {
  const [interactionTransactionsModalOpen, setInteractionTransactionsModalOpen] = useState(true);
  const [mxInteractions, setMxInteractions] = useState([]);
  const [loadingInteractions, setLoadingInteractions] = useState(-1); // 0 is done, -1 is loading, -2 is an error
  const { chainMeta: _chainMeta } = useChainMeta();
  const toast = useToast();

  useEffect(() => {
    fetchMxClaims();
  }, []);

  const fetchMxClaims = async () => {
    const interactions = await getInteractionTransactions(mxAddress, _chainMeta.contracts.dataNftMint, _chainMeta.contracts.market, networkId);

    if (interactions.error) {
      toast({
        title: "ER4: Could not get your recent transactions from the MultiversX blockchain.",
        status: "error",
        isClosable: true,
        duration: null,
      });

      setLoadingInteractions(-2);
    } else {
      setMxInteractions(interactions);
      setLoadingInteractions(0);
    }

    setInteractionTransactionsModalOpen(true);
  };

  const modelSize = useBreakpointValue({ base: "xs", md: "xl" });

  return (
    <Modal
      isOpen={interactionTransactionsModalOpen}
      onClose={() => {
        onAfterCloseInteractionsHistory();
        setInteractionTransactionsModalOpen(false);
      }}
      size={modelSize}
      scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Recent Interactions Transactions</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {((loadingInteractions === -1 || loadingInteractions === -2) && (
            <Box minH="150" alignItems="center" display="flex" justifyContent="center">
              {loadingInteractions === -1 ? <Spinner size="lg" /> : <WarningTwoIcon />}
            </Box>
          )) || (
            <>
              {(mxInteractions.length > 0 && (
                <TableContainer>
                  <Table variant="striped" size="sm">
                    <Thead>
                      <Tr>
                        <Th>When</Th>
                        <Th>Hash</Th>
                        <Th>Type</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {mxInteractions.map((item) => (
                        <Tr key={item.hash}>
                          <Td>
                            <Text fontSize="xs">{new Date(item.timestamp).toLocaleString()}</Text>
                          </Td>
                          <Td>
                            <Link fontSize="sm" href={getTransactionLink(networkId, item.hash)} isExternal>
                              <ExternalLinkIcon mx="2px" /> {item.hash.slice(0, 5)}...
                              {item.hash.slice(item.hash.length - 5, item.hash.length)}
                            </Link>
                            {item.status === "success" ? "" : <CloseIcon ml="2" fontSize="xs" color="red" verticalAlign="baseline"></CloseIcon>}
                          </Td>
                          <Td>
                            <Text fontSize="sm">{item.type}</Text>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                    <Tfoot>
                      <Tr>
                        <Th>When</Th>
                        <Th>Hash</Th>
                        <Th>Type</Th>
                      </Tr>
                    </Tfoot>
                  </Table>
                </TableContainer>
              )) || (
                <Box minH="150" alignItems="center" display="flex" justifyContent="center">
                  No interactions yet...
                </Box>
              )}
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
