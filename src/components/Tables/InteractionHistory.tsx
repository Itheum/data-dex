import React, { useState } from "react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useColorMode, HStack, Text } from "@chakra-ui/react";
import InteractionTxTable from "components/Tables/InteractionTxTable";

export default function InteractionsHistory({
  mxAddress,
  onAfterCloseInteractionsHistory,
}: {
  mxAddress: string;
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
      <ModalContent maxWidth={{ md: "80vw" }} overflowY="scroll" maxH="90%" backgroundColor={colorMode === "light" ? "bgWhite" : "#181818"}>
        <ModalHeader paddingBottom={0} bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
          <HStack spacing="5">
            <ModalCloseButton />
          </HStack>
          <Text fontFamily="Clash-Medium" fontSize="32px" mt={3}>
            Recent Data NFT Interactions
          </Text>
        </ModalHeader>
        <ModalBody>
          <InteractionTxTable address={mxAddress} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
