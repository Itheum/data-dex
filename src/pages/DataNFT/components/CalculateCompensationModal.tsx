import React from "react";
import { Badge, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, useColorMode } from "@chakra-ui/react";

type BlacklistModalProps = {
  isModalOpen: boolean;
  onModalClose: () => void;
  proofOfRefundAmount: number;
  totalProofOfRefundAmount: number;
  accumulatedAmount: number;
  blacklistStatus: boolean;
};

export const CalculateCompensationModal: React.FC<BlacklistModalProps> = (props) => {
  const { isModalOpen, onModalClose, proofOfRefundAmount, totalProofOfRefundAmount, accumulatedAmount, blacklistStatus } = props;
  const { colorMode } = useColorMode();
  const handleCalculationModalClose = () => {
    onModalClose();
  };

  return (
    <>
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCalculationModalClose} closeOnEsc={false} closeOnOverlayClick={false}>
          <ModalOverlay backdropFilter="blur(10px)" />
          <ModalContent bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
            <ModalCloseButton />
            <ModalHeader mt={5}>Calculate Compensation</ModalHeader>
            <ModalBody pb={6}>
              <Text fontSize="xl" fontWeight="700" color="teal.200">
                Reward calculation
              </Text>
              <Text fontSize="lg" fontWeight="700">
                Data NFT&apos;s: {proofOfRefundAmount}
              </Text>
              <Text fontSize="lg" fontWeight="700">
                Itheum tokens: {(accumulatedAmount / proofOfRefundAmount) * totalProofOfRefundAmount}
              </Text>
              <Flex fontSize="lg" gap={4} alignItems="center">
                <Text fontWeight="700">Blacklist status: </Text>
                {blacklistStatus ? (
                  <Badge colorScheme="red" rounded="lg" px={2} py={1}>
                    You are blacklisted
                  </Badge>
                ) : (
                  <Badge colorScheme="green" rounded="lg" px={2} py={1}>
                    Not blacklisted
                  </Badge>
                )}
              </Flex>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};
