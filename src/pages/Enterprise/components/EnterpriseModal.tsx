import React, { Dispatch, SetStateAction } from "react";
import { CloseButton, HStack, Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay, Text, useColorMode } from "@chakra-ui/react";
import { LaunchNftMinter } from "./LaunchNftMinter";

type EnterpriseModalProps = {
  minterAddress: string;
  isEnterpriseModalOpen: boolean;
  setEnterpriseModalOpen: Dispatch<SetStateAction<boolean>>;
};

export const EnterpriseModal: React.FC<EnterpriseModalProps> = (props) => {
  const { minterAddress, isEnterpriseModalOpen, setEnterpriseModalOpen } = props;

  const { colorMode } = useColorMode();

  return (
    <Modal onClose={() => setEnterpriseModalOpen(false)} isOpen={isEnterpriseModalOpen} size="6xl" closeOnEsc={false} closeOnOverlayClick={false}>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(15px)" />
      <ModalContent bgColor={colorMode === "dark" ? "#181818" : "bgWhite"} overflowY="scroll" h="90%">
        <ModalHeader paddingBottom={0} bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
          <HStack spacing="5">
            <CloseButton size="lg" onClick={() => setEnterpriseModalOpen(false)} />
          </HStack>
          <Text fontSize="36px" fontFamily="Clash-Medium" mt="10">
            Itheum Enterprise - Minter Dashboard
          </Text>
          <Text size="1rem" opacity=".7" fontFamily="Satoshi-Medium" fontWeight="light">
            {minterAddress}
          </Text>
        </ModalHeader>
        <ModalBody bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
          <LaunchNftMinter />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
