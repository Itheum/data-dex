import React, { useState } from "react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useColorMode } from "@chakra-ui/react";
import InteractionTxTable from "components/Tables/InteractionTxTable";
import { NetworkIdType } from "libs/types";

export default function InteractionsHistory({
  mxAddress,
  onAfterCloseInteractionsHistory,
}: {
  mxAddress: string;
  networkId: NetworkIdType;
  onAfterCloseInteractionsHistory: () => void;
}) {
  const [interactionTransactionsModalOpen, setInteractionTransactionsModalOpen] = useState(true);
  const { colorMode } = useColorMode();

  return (
    <Modal
      isOpen={interactionTransactionsModalOpen}
      onClose={() => {
        onAfterCloseInteractionsHistory();
        setInteractionTransactionsModalOpen(false);
      }}
      scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent maxWidth={{ md: "80vw" }} backgroundColor={colorMode === "light" ? "bgWhite" : "bgDark"}>
        <ModalHeader>Recent Data NFT Interactions</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <InteractionTxTable address={mxAddress} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
