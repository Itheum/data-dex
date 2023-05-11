import React, { useState, useEffect } from "react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useBreakpointValue } from "@chakra-ui/react";
import { useChainMeta } from "store/ChainMetaContext";
import ClaimsTxTable from "Tables/ClaimsTxTable";

export default function ChaimsHistory({ mxAddress, networkId, onAfterCloseChaimsHistory }) {
  const [claimTransactionsModalOpen, setClaimTransactionsModalOpen] = useState(true);
  const { chainMeta: _chainMeta } = useChainMeta();

  const modelSize = useBreakpointValue({ base: "xs", md: "xl" });

  return (
    <Modal
      isOpen={claimTransactionsModalOpen}
      onClose={() => {
        onAfterCloseChaimsHistory();
        setClaimTransactionsModalOpen(false);
      }}
      size={modelSize}
      scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxH={"900px"} maxW={"1200px"}>
        <ModalHeader>Recent Claim Transactions</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <ClaimsTxTable address={mxAddress} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
