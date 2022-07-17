import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, HStack, Text, Spacer, Button, Link, Progress, CloseButton, Stack, Alert, AlertIcon, AlertTitle, useToast } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import ShortAddress from "../UtilComps/ShortAddress";
import React, { useState, useEffect, useContext } from "react";
import { useMoralis } from "react-moralis";
import { config, sleep } from "../libs/util";
import { ABIS, CHAIN_TOKEN_SYMBOL, CHAIN_TX_VIEWER } from "../libs/util";
import { useUser } from "../store/UserContext";
import { useChainMeta } from "../store/ChainMetaContext";
import { useGetAccountInfo, refreshAccount, sendTransactions } from "@elrondnetwork/dapp-core";
import { ClaimsContract } from "../Elrond/claims";

const ClaimModal = ({ config, isOpen, onClose, title, tag1, value1, tag2, value2, n }) => {
  const { address: elrondAddress } = useGetAccountInfo();

  const toast = useToast();

  const { user: _user, setUser } = useUser();
  const { chainMeta: _chainMeta, setChainMeta } = useChainMeta();
  let claimsContract = null;

  if (ClaimsContract && elrondAddress) {
    claimsContract = new ClaimsContract(_chainMeta.networkId);
  }

  const resetClaimState = ({ refreshTokenBalances = false, clearError = true, keepOpen = false }) => {

    if (clearError) {}

    if (!keepOpen) {
      if (refreshTokenBalances) {
        setUser({
          ..._user,
          claimBalanceValues: ["-1", "-1", "-1"],
        });

        onClose(true);
      } else {
        onClose();
      }
    }
  };

  const handleOnChainClaim = () => {
    if (elrondAddress) {
      onClose();
      claimsContract.sendClaimRewardsTransaction(n - 1);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => resetClaimState({})} isCentered size={"xl"} closeOnEsc={false} closeOnOverlayClick={false}>
      <ModalOverlay />

      <ModalContent h="300px" w="400px">
        <ModalHeader>My Claimable {title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={5}>
          <Stack spacing="5" mb="5">
            <Stack>
              <Text color="gray" as="b" fontSize={"md"}>
                {tag1}:
              </Text>{" "}
              <Text fontSize={"md"}>
                {value1} {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)}
              </Text>
            </Stack>
            <Stack>
              <Text color="gray" as="b" fontSize={"md"}>
                {tag2}:
              </Text>{" "}
              <Text fontSize={"md"}>{value2}</Text>
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
