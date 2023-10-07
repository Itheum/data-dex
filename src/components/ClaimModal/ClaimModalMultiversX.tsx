import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  HStack,
  Text,
  Spacer,
  Button,
  Stack,
  useBreakpointValue,
  useColorMode,
} from "@chakra-ui/react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { CHAIN_TOKEN_SYMBOL } from "libs/config";
import { formatNumberRoundFloor } from "libs/utils";

const ClaimModal = ({ isOpen, onClose, title, tag1, value1, tag2, value2, claimType, mxClaimsContract }: any) => {
  const { address: mxAddress } = useGetAccountInfo();
  const { chainID } = useGetNetworkConfig();
  const { colorMode } = useColorMode();

  const resetClaimState = () => {
    onClose();
  };

  const handleOnChainClaim = () => {
    if (mxAddress) {
      onClose();
      mxClaimsContract.sendClaimRewardsTransaction(mxAddress, claimType - 1);
    }
  };

  const modelSize = useBreakpointValue({ base: "xs", md: "xl" });

  return (
    <Modal size={modelSize} isOpen={isOpen} onClose={() => resetClaimState()} isCentered closeOnEsc={false} closeOnOverlayClick={false}>
      <ModalOverlay backdropFilter="blur(10px)" />

      <ModalContent h="300px" w="400px" bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
        <ModalHeader>My Claimable {title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={5}>
          <Stack spacing="5" mb="5">
            <Stack>
              <Text color="gray" as="b" fontSize="md">
                {tag1}:
              </Text>{" "}
              <Text fontSize="md">
                {formatNumberRoundFloor(value1)} {CHAIN_TOKEN_SYMBOL(chainID)}
              </Text>
            </Stack>
            <Stack>
              <Text color="gray" as="b" fontSize="md">
                {tag2}:
              </Text>{" "}
              <Text fontSize="md">{value2}</Text>
            </Stack>
          </Stack>
          <Spacer />
        </ModalBody>
        <Spacer />
        <ModalFooter>
          <HStack spacing={1}>
            <Button size="sm" mr={3} colorScheme="teal" variant="outline" onClick={resetClaimState}>
              Close
            </Button>
            <Button size="sm" colorScheme="teal" onClick={handleOnChainClaim}>
              Claim Now
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ClaimModal;
