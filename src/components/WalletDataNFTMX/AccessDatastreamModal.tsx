import React from "react";
import { Alert, AlertTitle, AlertIcon, AlertDescription } from "@chakra-ui/alert";
import { Button } from "@chakra-ui/button";
import { CloseButton } from "@chakra-ui/close-button";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { Stack, HStack, Text } from "@chakra-ui/layout";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody } from "@chakra-ui/modal";
import { Spinner } from "@chakra-ui/spinner";

type DatastreamModalPropType = {
  isOpen: boolean;
  onClose: () => void;
  unlockAccessProgress: { s1: number; s2: number; s3: number };
  errorMessage: string;
};

export default function AccessDataStreamModal(props: DatastreamModalPropType) {
  const { isOpen, onClose, unlockAccessProgress, errorMessage } = props;
  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnEsc={false} closeOnOverlayClick={false}>
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent>
        <ModalHeader>Data Access Unlock Progress</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Stack spacing={5}>
            <HStack>
              {(!unlockAccessProgress.s1 && <Spinner size="md" />) || <CheckCircleIcon w={6} h={6} />}
              <Text>Initiating handshake with Data Marshal</Text>
            </HStack>

            <HStack>
              {(!unlockAccessProgress.s3 && <Spinner size="md" />) || <CheckCircleIcon w={6} h={6} />}
              <Text>Verifying data access rights to unlock Data Stream</Text>
            </HStack>

            {errorMessage && (
              <Alert status="error">
                <Stack>
                  <AlertTitle fontSize="md">
                    <AlertIcon mb={2} />
                    Process Error
                  </AlertTitle>
                  {errorMessage && <AlertDescription fontSize="md">{errorMessage}</AlertDescription>}
                  <CloseButton position="absolute" right="8px" top="8px" onClick={onClose} />
                </Stack>
              </Alert>
            )}
            {unlockAccessProgress.s1 && unlockAccessProgress.s2 && unlockAccessProgress.s3 && (
              <Button colorScheme="teal" variant="outline" onClick={onClose}>
                Close & Return
              </Button>
            )}
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
