import React, { useState } from "react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useColorMode } from "@chakra-ui/react";
import ClaimsTxTable from "./Tables/ClaimsTxTable";

export default function ChaimsHistory({ mxAddress, onAfterCloseChaimsHistory }: { mxAddress: string; onAfterCloseChaimsHistory: () => void }) {
  const [claimTransactionsModalOpen, setClaimTransactionsModalOpen] = useState(true);
  const { colorMode } = useColorMode();

  return (
    <Modal
      isOpen={claimTransactionsModalOpen}
      onClose={() => {
        onAfterCloseChaimsHistory();
        setClaimTransactionsModalOpen(false);
      }}
      scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(10px)" />
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
