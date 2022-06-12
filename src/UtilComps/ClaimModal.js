import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  VStack, HStack, Text, Spacer, Button,
  Link, Progress, CloseButton, Stack, Spinner,
  Alert, AlertIcon, AlertTitle,
  useToast,  
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import ShortAddress from "../UtilComps/ShortAddress";
import React, { useState, useEffect, useContext } from "react";
import { useMoralis } from "react-moralis";
import { config, sleep } from "../libs/util";
import { ABIS, CHAIN_TOKEN_SYMBOL, CHAIN_TX_VIEWER } from "../libs/util";
import { ChainMetaContext } from "../libs/contexts";
import { useUser } from "../store/UserContext";

const ClaimModal = ({
  isOpen,
  onClose,
  title,
  tag1,
  value1,
  tag2,
  value2,
  n,
}) => {
  const chainMeta = useContext(ChainMetaContext);
  const toast = useToast();

  const { web3: web3Provider, Moralis: { web3Library: ethers } } = useMoralis();
  const { user } = useMoralis();
  const [txConfirmationClaim, setTxConfirmationClaim] = useState(0);
  const [txHashClaim, setTxHashClaim] = useState(null);
  const [txErrorClaim, setTxErrorClaim] = useState(null);
  const [claimWorking, setClaimWorking] = useState(false);
  const { user: _user, setUser } = useUser();

  useEffect(() => {
    if (txErrorClaim) {
      setClaimWorking(false);
    } else {
      if (txHashClaim && txConfirmationClaim === config.txConfirmationsNeededLrg) {
        toast({
          title: `Congrats! the faucet has sent you some ${CHAIN_TOKEN_SYMBOL( chainMeta.networkId)}`,
          status: "success",
          duration: 6000,
          isClosable: true,
        });

        resetClaimState();
      }
    }
  }, [txConfirmationClaim, txHashClaim, txErrorClaim]);

  const web3_claims = async(ntype) => {
    setClaimWorking(true);

    const web3Signer = web3Provider.getSigner();
    const walletAddress = user.get("ethAddress");
    
    const tokenContract = new ethers.Contract(chainMeta.contracts.claims, ABIS.claims, web3Signer);

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
        const txErr = new Error("Token Contract Error on method faucet");
        console.error(txErr);
        setTxErrorClaim(txErr);
      }
    } catch (e) {
      setTxErrorClaim(e);
    }
  };

  const [clicked, setClicked] = useState(false);

  function resetClaimState() {
    setClaimWorking(false);
    setTxConfirmationClaim(0);
    setTxHashClaim(null);
    setTxErrorClaim(null);
    setClicked(false);
    onClose();
    setUser({
      ..._user,
      claimBalanceValues: ["a", "a", "a"],
    });
    showClaimBalance();
  }

  const showClaimBalance = async () => {
    const walletAddress = user.get("ethAddress");

    const contract = new ethers.Contract(chainMeta.contracts.claims, ABIS.claims, web3Provider);
    const claimUints = {
      rewards: 1,
      airdrops: 2,
      allocations: 3,
    };

    let keys = Object.keys(claimUints);

    let values = keys.map((el) => {
      return claimUints[el];
    });

    let hexDataPromiseArray = values.map(async (el) => {
      let a = await contract.deposits(walletAddress, el);
      return a;
    });

    let claimBalanceResponse = (await Promise.all(hexDataPromiseArray)).map(
      (el) => {
        const dates = new Date(
          parseInt(el.lastDeposited._hex.toString(), 16) * 1000
        ).toLocaleDateString("en-US");
        let value = parseInt(el.amount._hex.toString(), 16)/(10**18);
        return { values: value, dates: dates };
      }
    );

    const valuesArray = claimBalanceResponse.map((el) => {
      return el["values"];
    });
    
    const dates = claimBalanceResponse.map((el) => {
      return el["dates"];
    });

    await setUser({
      ..._user,
      claimBalanceValues: valuesArray,
      claimBalanceDates: dates,
    });
  };

  const handleClick = () => {
    web3_claims(n);
    setClicked(!clicked);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={"xl"}>
      <ModalOverlay />

      <ModalContent h="400px" w="400px">
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={10} align={"left"}>
            <Spacer />

            <HStack spacing={100}>
              <Text color="gray" as="b">
                {tag1}
              </Text>
              <Text>{value1}</Text>
            </HStack>
            <HStack spacing={100}>
              <Text color="gray" as="b">
                {tag2}
              </Text>
              <Text>{value2}</Text>
            </HStack>
            <Spacer />
          </VStack>

          {clicked && (
            <>
              {txHashClaim && (
                <Stack>
                  <Progress
                    colorScheme="teal"
                    size="sm"
                    value={
                      (100 / config.txConfirmationsNeededLrg) *
                      txConfirmationClaim
                    }
                  />

                  <HStack>
                    <Text fontSize="sm">Transaction </Text>
                    <ShortAddress address={txHashClaim} />
                    <Link
                      href={`${
                        CHAIN_TX_VIEWER[chainMeta.networkId]
                      }${txHashClaim}`}
                      isExternal
                    >
                      {" "}
                      <ExternalLinkIcon mx="2px" />
                    </Link>
                  </HStack>
                </Stack>
              )}

              {txErrorClaim && (
                <Alert status="error">
                  <AlertIcon />
                  {txErrorClaim.message && (
                    <AlertTitle>{txErrorClaim.message}</AlertTitle>
                  )}
                  <CloseButton
                    position="absolute"
                    right="8px"
                    top="8px"
                    onClick={resetClaimState}
                  />
                </Alert>
              )}
              <Spacer />
              <Spacer />
            </>
          )}
        </ModalBody>
        <Spacer />
        <ModalFooter>
          <HStack spacing={1}>
            <Button
              size="sm"
              mr={3}
              h="35px"
              w="75px"
              colorScheme="teal"
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              size="sm"
              h="35px"
              w="75px"
              colorScheme="teal"
              onClick={handleClick}
              disabled={clicked}
            >
              {!clicked ? "Claim Now" : <Spinner size="xs" />}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ClaimModal;
