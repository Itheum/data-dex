import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { Button, Stack, Alert, AlertIcon, Box, AlertTitle, AlertDescription, Text, Image, Link, Wrap, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, WrapItem } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import walletConnect from "img/wallet-connect.png";
import walletMetamask from "img/wallet-metamask.png";
import { WALLETS } from 'libs/util';
import { gtagGo } from 'libs/util';
import { useSessionStorage } from 'libs/hooks';

function AuthPickerEVM({ resetLaunchMode }) {
  useEffect(() => {
    onProgressModalOpen();
  },[]);

  const { authenticate, isAuthenticating, authError, isAuthenticated, user } = useMoralis();
  const { isOpen: isProgressModalOpen, onOpen: onProgressModalOpen, onClose: onProgressModalClose } = useDisclosure();

  const [authErrorUi, setAuthErrorUi] = useState(null);
  const [EVMWalletUsed, setEVMWalletUsed] = useState(null);
  const [isAuthenticatingMetamask, setIsAuthenticatingMetamask] = useState(0);
  const [isAuthenticatingWc, setIsAuthenticatingWc] = useState(0);
  const [walletUsedSession, setWalletUsedSession] = useSessionStorage('wallet-used', null);

  useEffect(() => {
    if (authError) {
      setEVMWalletUsed(null);
      setIsAuthenticatingMetamask(0);
      setIsAuthenticatingWc(0);
      setAuthErrorUi(authError);
    }
  }, [authError]);

  useEffect(() => {
    if (isAuthenticating) {
      switch (EVMWalletUsed) {
        case WALLETS.WC:
          setIsAuthenticatingWc(1);
          break;

        default:
          setIsAuthenticatingMetamask(1);
          break;
      }
    } else {
      // this will trigger when the user login and logsout -- so it's like a ui reset
      // ... (but we cant reset error as we need to show this)
      setEVMWalletUsed(null);
      setIsAuthenticatingMetamask(0);
      setIsAuthenticatingWc(0);
    }
  }, [isAuthenticating]);

  useEffect(() => {
    if (isAuthenticated && user) {
      handleProgressModalClose();
    }
  }, [isAuthenticated]);

  const handleProgressModalClose = () => {
    setAuthErrorUi(null);
    onProgressModalClose();

    // only reset host page to elrond vs evm wallet selector IF user did NOT just already log in successfully
    if (!isAuthenticated && !user) {
      resetLaunchMode();
    }
  };

  const handleAuthenticate = (wallet) => {
    setAuthErrorUi(null);

    switch (wallet) {
      case WALLETS.WC:
        authenticate({ provider: "walletconnect" });
        break;

      default:
        authenticate();
        break;
    }

    gtagGo('auth', 'login', wallet);
    setEVMWalletUsed(wallet);
    setWalletUsedSession(wallet);
  };

  return (
    <>
      {(!isAuthenticated && !user) && <Stack spacing={6} p="5">
        <Modal size="xl" isOpen={isProgressModalOpen} onClose={handleProgressModalClose} closeOnEsc={false} closeOnOverlayClick={false}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Select a EVM Wallet</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Stack spacing="5">
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
                      <Button isLoading={Boolean(isAuthenticatingMetamask)} onClick={() => handleAuthenticate(WALLETS.METAMASK)} width="220px" p="8">
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
      </Stack>}
    </>
  );
};

export default AuthPickerEVM;