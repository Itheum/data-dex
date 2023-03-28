import React, { FC } from "react";
import { Button, Flex, Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay, Text } from "@chakra-ui/react";

interface DataNFTProcureReadModalProps {
  isReadTermsModalOpen: boolean;
  onReadTermsModalOpen: () => void;
  onReadTermsModalClose: () => void;
}

const DataNFTProcureReadModal: FC<DataNFTProcureReadModalProps> = ({ isReadTermsModalOpen, onReadTermsModalOpen, onReadTermsModalClose }) => {
  return (
    <Modal isOpen={isReadTermsModalOpen} onClose={onReadTermsModalClose} closeOnEsc={false} closeOnOverlayClick={false}>
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px) hue-rotate(90deg)" />
      <ModalContent>
        <ModalHeader>Data NFT-FT Terms of Use</ModalHeader>
        <ModalBody pb={6}>
          <Text>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since
            the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but
            also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets
            containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
          </Text>
          <Flex justifyContent="end" mt="6 !important">
            <Button colorScheme="teal" onClick={onReadTermsModalClose}>
              I have read this
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default DataNFTProcureReadModal;
