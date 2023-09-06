import React, { useState } from "react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, Text, ModalCloseButton, useColorMode, HStack } from "@chakra-ui/react";
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
      <ModalContent maxWidth={{ md: "70vw" }} overflowY="scroll" maxH="90%" backgroundColor={colorMode === "light" ? "bgWhite" : "bgDark"}>
        <ModalHeader paddingBottom={0} bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
          <HStack spacing="5">
            <ModalCloseButton />
          </HStack>
          <Text fontFamily="Clash-Medium" fontSize="32px" mt={3}>
            Recent Claim Transactions
          </Text>
        </ModalHeader>
        <ModalBody bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
          <ClaimsTxTable address={mxAddress} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
