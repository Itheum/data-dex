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
  useColorMode,
} from "@chakra-ui/react";
import { NetworkIdType } from "libs/types";
import { formatNumberRoundFloor } from "libs/utils";
import { useChainMeta } from "store/ChainMetaContext";
import ClaimsTxTable from "./Tables/ClaimsTxTable";
import { getClaimTransactions, getTransactionLink } from "../libs/MultiversX/api";

export default function ChaimsHistory({
  mxAddress,
  networkId,
  onAfterCloseChaimsHistory,
}: {
  mxAddress: string;
  networkId: NetworkIdType;
  onAfterCloseChaimsHistory: () => void;
}) {
  const [claimTransactionsModalOpen, setClaimTransactionsModalOpen] = useState(true);
  const [mxClaims, setMxClaims] = useState<any[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(-1); // 0 is done, -1 is loading, -2 is an error
  const { chainMeta: _chainMeta } = useChainMeta();
  const toast = useToast();
  const { colorMode } = useColorMode();

  useEffect(() => {
    fetchMxClaims();
  }, []);

  const fetchMxClaims = async () => {
    const res = await getClaimTransactions(mxAddress, _chainMeta.contracts.claims, networkId);

    if (res.error) {
      toast({
        title: "ER4: Could not get your recent transactions from the MultiversX blockchain.",
        status: "error",
        isClosable: true,
        duration: null,
      });

      setLoadingClaims(-2);
    } else {
      setMxClaims(res.transactions);
      setLoadingClaims(0);
    }

    setClaimTransactionsModalOpen(true);
  };

  const modelSize = useBreakpointValue({ base: "xs", md: "xl" });

  return (
    <Modal
      isOpen={claimTransactionsModalOpen}
      onClose={() => {
        onAfterCloseChaimsHistory();
        setClaimTransactionsModalOpen(false);
      }}
      scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxWidth={{ md: "70vw" }} maxHeight={{ md: "90vh" }} backgroundColor={colorMode === "light" ? "bgWhite" : "bgDark"}>
        <ModalHeader>Recent Claim Transactions</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <ClaimsTxTable address={mxAddress} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
