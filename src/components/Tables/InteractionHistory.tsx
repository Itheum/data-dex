import React, { useState, useEffect } from "react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useBreakpointValue, useColorMode } from "@chakra-ui/react";
import InteractionTxTable from "components/Tables/InteractionTxTable";
import { NetworkIdType } from "libs/types";
import { useChainMeta } from "store/ChainMetaContext";

export default function InteractionsHistory({
  mxAddress,
  networkId,
  onAfterCloseInteractionsHistory,
}: {
  mxAddress: string;
  networkId: NetworkIdType;
  onAfterCloseInteractionsHistory: () => void;
}) {
  const [interactionTransactionsModalOpen, setInteractionTransactionsModalOpen] = useState(true);
  const { chainMeta: _chainMeta } = useChainMeta();
  const { colorMode } = useColorMode();

  const modelSize = useBreakpointValue({ base: "xs", md: "xl" });

  return (
    <Modal
      isOpen={interactionTransactionsModalOpen}
      onClose={() => {
        onAfterCloseInteractionsHistory();
        setInteractionTransactionsModalOpen(false);
      }}
      scrollBehavior="inside">
      <ModalOverlay />
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
