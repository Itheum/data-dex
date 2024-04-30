import React, { useEffect } from "react";
import { Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, useColorMode } from "@chakra-ui/react";
import { BondContract } from "@itheum/sdk-mx-data-nft/out";
import { IS_DEVNET } from "../../../libs/config";

type BlacklistModalProps = {
  isModalOpen: boolean;
  onModalClose: () => void;
  compensationId: number;
};

export const BlacklistModal: React.FC<BlacklistModalProps> = (props) => {
  const { isModalOpen, onModalClose, compensationId } = props;
  const { colorMode } = useColorMode();
  const [blacklistAddresses, setBlacklistAddresses] = React.useState<Array<string>>([]);
  const bondContract = new BondContract(IS_DEVNET ? "devnet" : "mainnet");

  const handleBlacklistModalClose = () => {
    onModalClose();
  };

  useEffect(() => {
    (async () => {
      if (!isModalOpen) return;
      const data = await bondContract.viewCompensationBlacklist(compensationId);
      setBlacklistAddresses(data);
    })();
  }, [isModalOpen]);

  return (
    <>
      {isModalOpen && (
        <Modal isCentered size="3xl" isOpen={isModalOpen} onClose={handleBlacklistModalClose} closeOnEsc={false} closeOnOverlayClick={false}>
          <ModalOverlay backdropFilter="blur(10px)" />
          <ModalContent bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
            <ModalCloseButton />
            <ModalHeader mt={5}>Blacklist Addresses</ModalHeader>
            <ModalBody pb={6}>
              <Text fontSize="xl" fontWeight="700" color="teal.200">
                Addresses
              </Text>
              {blacklistAddresses.map((address, index) => (
                <Flex key={index} gap={2}>
                  <Text>
                    {index + 1}. {address.substring(0, 7)}...{address.substring(address.length, address.length - 7)}
                  </Text>
                </Flex>
              ))}
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};
