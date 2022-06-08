import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { Button, Stack, Alert, AlertIcon, Box, AlertTitle, AlertDescription, Text, Image, Link, Wrap, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import walletConnect from "./img/wallet-connect.png";
import walletMetamask from "./img/wallet-metamask.png";
import chainElrond from "./img/elrond-chain-logo.png";
import { DappUI } from "@elrondnetwork/dapp-core";
import { useGetAccountInfo, refreshAccount, sendTransactions } from "@elrondnetwork/dapp-core";

export const Auth = () => {
  const { ExtensionLoginButton, WebWalletLoginButton, LedgerLoginButton, WalletConnectLoginButton } = DappUI;

  const { address: elrondAddress } = useGetAccountInfo();

  const WALLETS = {
    METAMASK: 1,
    WC: 2,
    ELROND: 3,
  };

  const { authenticate, isAuthenticating, Moralis, authError, isAuthenticated } = useMoralis();
  const { isOpen: isProgressModalOpen, onOpen: onProgressModalOpen, onClose: onProgressModalClose } = useDisclosure();

  const [authErrorUi, setAuthErrorUi] = useState(null);
  const [walletUsed, setWalletUsed] = useState(WALLETS.METAMASK);
  const [isAuthenticatingMetamask, setIsAuthenticatingMetamask] = useState(0);
  const [isAuthenticatingWc, setIsAuthenticatingWc] = useState(0);
  const [isAuthenticatingElrond, setIsAuthenticatingElrond] = useState(0);

  useEffect(() => {
    if (authError) {
      setWalletUsed(WALLETS.METAMASK);
      setIsAuthenticatingMetamask(0);
      setIsAuthenticatingWc(0);
      setIsAuthenticatingElrond(0);
      setAuthErrorUi(authError);
    }
  }, [authError]);

  useEffect(() => {
    if (elrondAddress) {
      setWalletUsed(WALLETS.ELROND);
      setIsAuthenticatingMetamask(0);
      setIsAuthenticatingWc(0);
      setIsAuthenticatingElrond(0);
    } else {
      setWalletUsed(WALLETS.METAMASK);
      setIsAuthenticatingMetamask(0);
      setIsAuthenticatingWc(0);
      setIsAuthenticatingElrond(0);
    }
  }, [elrondAddress]);

  useEffect(() => {
    if (isAuthenticating) {
      switch (walletUsed) {
        case WALLETS.WC:
          setIsAuthenticatingWc(1);
          break;

        case WALLETS.ELROND:
          setIsAuthenticatingElrond(1);
          break;

        default:
          setIsAuthenticatingMetamask(1);
          break;
      }
    } else {
      // this will trigger when the user login and logsout -- so it's like a ui reset
      // ... (but we cant reset error as we need to show this)
      setWalletUsed(WALLETS.METAMASK);
      setIsAuthenticatingMetamask(0);
      setIsAuthenticatingWc(0);
      setIsAuthenticatingElrond(0);
    }
  }, [isAuthenticating]);

  const handleProgressModalClose = () => {
    setAuthErrorUi(null);
    onProgressModalClose();
  };

  const handleAuthenticate = (wallet) => {
    setAuthErrorUi(null);

    switch (wallet) {
      case WALLETS.WC:
        setWalletUsed(WALLETS.WC);
        authenticate({ provider: "walletconnect" });
        break;

      case WALLETS.ELROND:
        setWalletUsed(WALLETS.ELROND);
        authenticate({ type: "erd" });
        break;

      default:
        setWalletUsed(WALLETS.METAMASK);
        authenticate();
        break;
    }
  };

  return (
    <Stack spacing={6} p="5">
      <Button onClick={onProgressModalOpen} m="auto">
        Connect a Wallet
      </Button>

      <Modal size="xl" isOpen={isProgressModalOpen} onClose={handleProgressModalClose} closeOnEsc={false} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select a Wallet</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack spacing="5">
              <Text fontSize="sm">Please select a wallet to connect to the Data DEX</Text>

              {authErrorUi && (
                <Alert status="error">
                  <AlertIcon />
                  <Box flex="1">
                    <AlertTitle>Authentication has failed</AlertTitle>
                    <AlertDescription display="block">{authErrorUi.message}</AlertDescription>
                  </Box>
                </Alert>
              )}

              <Box p="15px">
                <Wrap spacing="20px" justify="space-between">
                  <Box>
                    <Button isLoading={Boolean(isAuthenticatingMetamask)} onClick={() => handleAuthenticate()} width="220px" p="8">
                      <Image src={walletMetamask} boxSize="40px" borderRadius="lg" mr="2" />
                      <Text>MetaMask</Text>
                    </Button>
                  </Box>

                  <Box>
                    <Button isDisabled={true} isLoading={Boolean(isAuthenticatingWc)} onClick={() => handleAuthenticate(WALLETS.WC)} width="220px" p="8">
                      <Image src={walletConnect} boxSize="40px" borderRadius="lg" mr="2" />
                      WalletConnect
                    </Button>
                  </Box>

                  <Box>
                    <Button isLoading={Boolean(isAuthenticatingElrond)} onClick={() => handleAuthenticate(WALLETS.ELROND)} width="220px" p="8">
                      <Image src={chainElrond} boxSize="40px" borderRadius="lg" mr="2" />
                      Elrond via Ledger
                    </Button>
                  </Box>
                  <Box>
                    <Button isLoading={Boolean(isAuthenticatingElrond)}>
                      <ExtensionLoginButton callbackRoute={"/"} loginButtonText={"Extension"}></ExtensionLoginButton>
                    </Button>
                    <Button isLoading={Boolean(isAuthenticatingElrond)}>
                      <WalletConnectLoginButton callbackRoute={"/"} loginButtonText={"Maiar"}></WalletConnectLoginButton>
                    </Button>
                  </Box>
                </Wrap>
              </Box>

              <Text fontSize="sm">
                By logging in, you are agreeing to the{" "}
                <Link href="https://itheum.com/termsofuse" isExternal>
                  Terms of Use <ExternalLinkIcon mx="2px" />
                </Link>{" "}
                &{" "}
                <Link href="https://itheum.com/privacypolicy" isExternal>
                  Privacy Policy <ExternalLinkIcon mx="2px" />
                </Link>
              </Text>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Stack>
  );
};
