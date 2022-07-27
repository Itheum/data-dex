import { useMoralis } from "react-moralis";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, 
  ModalCloseButton, HStack, Text, Spacer, Button, Link, Progress, CloseButton, Stack, 
  Alert, AlertIcon, AlertTitle, useToast } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import ShortAddress from "UtilComps/ShortAddress";
import React, { useState, useEffect } from "react";
import { config, sleep } from "libs/util";
import { CHAIN_TOKEN_SYMBOL, CHAIN_TX_VIEWER } from "libs/util";
import { ABIS } from "EVM/ABIs";
import { useUser } from "store/UserContext";
import { useChainMeta } from "store/ChainMetaContext";

const ClaimModal = ({isOpen, onClose, title, tag1, value1, tag2, value2, n }) => {
  const {
    isAuthenticated,
    user,
    Moralis: { web3Library: ethers }, web3: web3Provider
  } = useMoralis();

  const toast = useToast();

  const [txConfirmationClaim, setTxConfirmationClaim] = useState(0);
  const [txHashClaim, setTxHashClaim] = useState(null);
  const [txErrorClaim, setTxErrorClaim] = useState(null);
  const [claimWorking, setClaimWorking] = useState(false);
  const { user: _user, setUser } = useUser();
  const { chainMeta: _chainMeta, setChainMeta } = useChainMeta();

  useEffect(() => {
    if (txErrorClaim) {
      resetClaimState({ clearError: false, keepOpen: true });
    } else {
      if (txHashClaim && txConfirmationClaim === config.txConfirmationsNeededLrg) {
        toast({
          title: `Congrats! you have claimed your tokens for ${title}`,
          status: "success",
          duration: 6000,
          isClosable: true,
        });

        resetClaimState({ refreshTokenBalances: true });
      }
    }
  }, [txConfirmationClaim, txHashClaim, txErrorClaim]);

  const web3_claims = async (ntype) => {
    setClaimWorking(true);

    const web3Signer = web3Provider.getSigner();
    const tokenContract = new ethers.Contract(_chainMeta.contracts.claims, ABIS.claims, web3Signer);

    try {
      const txResponse = await tokenContract.claimDeposit(ntype);
      setTxHashClaim(txResponse.hash);

      await sleep(1);
      setTxConfirmationClaim(0.5);

      const txReceipt = await txResponse.wait();
      setTxConfirmationClaim(1);
      await sleep(1);

      if (txReceipt.status) {
        setTxConfirmationClaim(2);
      } else {
        const txErr = new Error("Claim Contract Error on method claimDeposit");
        console.error(txErr);
        setTxErrorClaim(txErr);
      }
    } catch (e) {
      setTxErrorClaim(e);
    }
  };

  const resetClaimState = ({ refreshTokenBalances = false, clearError = true, keepOpen = false }) => {
    setClaimWorking(false);
    setTxConfirmationClaim(0);
    setTxHashClaim(null);

    if (clearError) {
      setTxErrorClaim(null);
    }

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
    setTxErrorClaim(null);
    web3_claims(n);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => resetClaimState({})} isCentered size={"xl"} closeOnEsc={false} closeOnOverlayClick={false}>
      <ModalOverlay />

      <ModalContent h="400px" w="400px">
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

          {txHashClaim && (
            <Stack>
              <Progress colorScheme="teal" size="sm" value={(100 / config.txConfirmationsNeededLrg) * txConfirmationClaim} />

              <HStack>
                <Text fontSize="sm">Transaction </Text>
                <ShortAddress address={txHashClaim} />
                <Link href={`${CHAIN_TX_VIEWER[_chainMeta.networkId]}${txHashClaim}`} isExternal>
                  {" "}
                  <ExternalLinkIcon mx="2px" />
                </Link>
              </HStack>
            </Stack>
          )}

          {txErrorClaim && (
            <Alert status="error">
              <AlertIcon />
              {txErrorClaim.message && <AlertTitle fontSize="md">{txErrorClaim.message}</AlertTitle>}
              <CloseButton position="absolute" right="8px" top="8px" onClick={() => resetClaimState({ keepOpen: true })} />
            </Alert>
          )}

          <Spacer />
          <Spacer />
        </ModalBody>
        <Spacer />
        <ModalFooter>
          <HStack spacing={1}>
            <Button isDisabled={claimWorking} size="sm" mr={3} colorScheme="teal" variant="outline" onClick={resetClaimState}>
              Close
            </Button>
            <Button isLoading={claimWorking} size="sm" colorScheme="teal" onClick={handleOnChainClaim}>
              Claim Now
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ClaimModal;
