import { 
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, 
  HStack, Text, Spacer, Button, Stack, useBreakpointValue } from '@chakra-ui/react';
import React from 'react';
import { useGetAccountInfo } from '@elrondnetwork/dapp-core/hooks/account';
import { CHAIN_TOKEN_SYMBOL } from 'libs/util';
import { useChainMeta } from 'store/ChainMetaContext';

const ClaimModal = ({ isOpen, onClose, title, tag1, value1, tag2, value2, claimType, elrondClaimsContract }) => {
  const { address: elrondAddress } = useGetAccountInfo();
  const { chainMeta: _chainMeta } = useChainMeta();

  const resetClaimState = () => {
    onClose();
  };

  const handleOnChainClaim = () => {
    if (elrondAddress) {
      onClose();
      elrondClaimsContract.sendClaimRewardsTransaction(claimType - 1);
    }
  };

  const modelSize = useBreakpointValue({ base: 'xs', md: 'xl' });

  return (
    <Modal size={modelSize} isOpen={isOpen} onClose={() => resetClaimState({})} isCentered closeOnEsc={false} closeOnOverlayClick={false}>
      <ModalOverlay />

      <ModalContent h="300px" w="400px">
        <ModalHeader>My Claimable {title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={5}>
          <Stack spacing="5" mb="5">
            <Stack>
              <Text color="gray" as="b" fontSize="md">
                {tag1}:
              </Text>{' '}
              <Text fontSize="md">
                {value1} {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)}
              </Text>
            </Stack>
            <Stack>
              <Text color="gray" as="b" fontSize="md">
                {tag2}:
              </Text>{' '}
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
