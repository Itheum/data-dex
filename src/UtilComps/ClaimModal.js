import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Button,
  Text,
  Spacer,
} from "@chakra-ui/react";

const ClaimModal = ({ isOpen, onClose, title, tag1, value1, tag2, value2 }) => {
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} isCentered size={"xl"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={10}>
            <Spacer/>
              
              <HStack spacing={100}>
                <Text fontSize="2xl" textAlign={"center"} >{tag1}</Text>
                <Text fontSize="2xl" textAlign={"center"}>{value1}</Text>
              </HStack>
              <HStack spacing={100}>
                <Text fontSize="2xl" textAlign={"center"}>{tag2}</Text>
                <Text fontSize="2xl" textAlign={"center"} >{value2}</Text>
              </HStack>
              <Spacer/>
            </VStack>
          </ModalBody>

          <Spacer/>

          <ModalFooter>
            <HStack spacing={300}>
              <Button colorScheme="blue" mr={3} onClick={onClose}>
                Close
              </Button>
              <Button variant="outline">Claim Now</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ClaimModal;
