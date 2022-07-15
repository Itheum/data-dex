import { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { Button, Stack, Alert, AlertIcon, Box, AlertTitle, AlertDescription, Text, Image, Link, Wrap, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, WrapItem } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import walletConnect from './img/wallet-connect.png';
import walletMetamask from './img/wallet-metamask.png';
import { DappUI } from '@elrondnetwork/dapp-core';
import { gtagGo } from './libs/util';
import { useSessionStorage } from './libs/hooks';
import { useNavigate, useLocation } from 'react-router-dom';

export const Auth = ({ setWalletUsed }) => {
  const { ExtensionLoginButton, WebWalletLoginButton, LedgerLoginButton, WalletConnectLoginButton } = DappUI;

  const WALLETS = {
    METAMASK: 'evm_metamask',
    WC: 2,
    ELROND_MAIARAPP: 'el_maiar',
    ELROND_DEFI: 'el_defi',
    ELROND_WEBWALLET: 'el_webwallet',
    ELROND_LEDGER: 'el_ledger',
  };

  const { authenticate, isAuthenticating, authError } = useMoralis();
  const { isOpen: isProgressModalOpen, onOpen: onProgressModalOpen, onClose: onProgressModalClose } = useDisclosure();

  const [authErrorUi, setAuthErrorUi] = useState(null);
  const [EVMWalletUsed, setEVMWalletUsed] = useState(null);
  const [isAuthenticatingMetamask, setIsAuthenticatingMetamask] = useState(0);
  const [isAuthenticatingWc, setIsAuthenticatingWc] = useState(0);
  const [, setWalletUsedSession] = useSessionStorage('wallet-used', null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/unlock') {
      navigate('/', { replace: true });
    }
  }, []);

  useEffect(() => {
    try {
      document.getElementsByClassName('chakra-portal')[0].style.display = 'initial';
    } catch (e) {}
  }, []);

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

  const handleProgressModalClose = () => {
    setAuthErrorUi(null);
    onProgressModalClose();

    // reset the original state of the chakra model
    document.querySelector('body').classList.remove('dapp-core-modal-active');
  };

  const handleAuthenticate = (wallet) => {
    setAuthErrorUi(null);

    switch (wallet) {
      case WALLETS.WC:
        setEVMWalletUsed(WALLETS.WC);
        setWalletUsed(WALLETS.WC);
        authenticate({ provider: 'walletconnect' });
        break;

      default:
        gtagGo('auth', 'login', wallet);
        setEVMWalletUsed(WALLETS.METAMASK);
        setWalletUsed(WALLETS.METAMASK);
        authenticate();
        break;
    }

    setWalletUsed(wallet);
    setWalletUsedSession(wallet);
  };

  const handleModelFix = () => {
    document.querySelector('body').classList.toggle('dapp-core-modal-active');
  };

  const goElrondLogin = (wallet) => {
    gtagGo('auth', 'login', wallet);

    setWalletUsed(wallet);
    setWalletUsedSession(wallet);

    if (wallet === 'el_maiar' || wallet === 'el_ledger') {
      handleModelFix();
    }
  };

  return (
    <Stack spacing={6} p="5">
      <Button onClick={onProgressModalOpen} m="auto">
        Connect my Wallet
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

              <Text fontSize="sm">Want to use the Elrond Blockchain? Try these wallets...</Text>

              <Box p="5px">
                <Stack>
                  <Wrap spacing="20px" justify="space-between" padding="10px">
                    <WrapItem onClick={() => goElrondLogin(WALLETS.ELROND_MAIARAPP)} className="auth_wrap">
                      <WalletConnectLoginButton callbackRoute={'/'} loginButtonText={'Maiar App'} buttonClassName="auth_button"></WalletConnectLoginButton>
                    </WrapItem>

                    <WrapItem onClick={() => goElrondLogin(WALLETS.ELROND_DEFI)} className="auth_wrap">
                      <ExtensionLoginButton callbackRoute={'/'} loginButtonText={'Maiar DeFi Wallet'} buttonClassName="auth_button" onClick={() => (alert('s'))}></ExtensionLoginButton>
                    </WrapItem>

                    <WrapItem onClick={() => goElrondLogin(WALLETS.ELROND_WEBWALLET)} className="auth_wrap">
                      <WebWalletLoginButton callbackRoute={'/'} loginButtonText={'Web Wallet'} buttonClassName="auth_button"></WebWalletLoginButton>
                    </WrapItem>

                    <WrapItem onClick={() => goElrondLogin(WALLETS.ELROND_LEDGER)} className="auth_wrap">
                      <LedgerLoginButton callbackRoute={'/'} loginButtonText={'Ledger'} buttonClassName="auth_button"></LedgerLoginButton>
                    </WrapItem>
                  </Wrap>
                </Stack>
              </Box>

              <Text fontSize="sm">
                By logging in, you are agreeing to the{' '}
                <Link href="https://itheum.com/termsofuse" isExternal>
                  Terms of Use <ExternalLinkIcon mx="2px" />
                </Link>{' '}
                &{' '}
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
