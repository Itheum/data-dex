import { useEffect } from 'react';
import { Stack, Box, Text, Link, Wrap, Badge, Modal, ModalOverlay, ModalContent, 
  ModalHeader, ModalBody, ModalCloseButton, useDisclosure, WrapItem, useBreakpointValue } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { DappUI } from '@elrondnetwork/dapp-core';
import { useGetAccountInfo } from '@elrondnetwork/dapp-core';
import { WALLETS } from 'libs/util';
import { gtagGo, clearAppSessions, sleep } from 'libs/util';
import { useSessionStorage } from 'libs/hooks';
import { useNavigate } from 'react-router-dom';

function AuthPickerElrond ({ launchEnvironment, resetLaunchMode }) {
  const navigate = useNavigate();
  const { ExtensionLoginButton, WebWalletLoginButton, LedgerLoginButton, WalletConnectLoginButton } = DappUI;
  const { address: elrondAddress } = useGetAccountInfo();
  const { isOpen: isProgressModalOpen, onOpen: onProgressModalOpen, onClose: onProgressModalClose } = useDisclosure();
  const [walletUsedSession, setWalletUsedSession] = useSessionStorage('itm-wallet-used', null);

  useEffect(() => {
    async function cleanOutRemoteMaiarAppWalletDisconnect() {
      clearAppSessions();

      await sleep(1);
      window.location.replace('/');
    }

    if (window.location.pathname === '/unlock') {
      // if a user disconnects the mobile maiar app, it logs out user 
      //... via dapp-core internally but redirects to a /unlock. We need to clean out the sessions correctly in this case
      cleanOutRemoteMaiarAppWalletDisconnect();
    } else {
      onProgressModalOpen();
    }
  }, []);

  useEffect(() => {
    if (elrondAddress) {
      handleProgressModalClose();
    }
  }, [elrondAddress]);

  const handleProgressModalClose = () => {
    onProgressModalClose();

    // only reset host page to elrond vs evm wallet selector IF user did NOT just already log in successfully
    if (!elrondAddress) {
      resetLaunchMode();
    }
  };

  const goElrondLogin = (wallet) => {
    gtagGo('auth', 'login', wallet);

    setWalletUsedSession(wallet);
  };

  const modelSize = useBreakpointValue({ base: 'xs', md: 'xl' });

  return (
    <>
      {!elrondAddress && <Stack spacing={6} p="5">
      <Modal isCentered size={modelSize} isOpen={isProgressModalOpen} onClose={handleProgressModalClose} closeOnEsc={false} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select a <Badge mb="1" mr="1" ml="1" variant='outline' fontSize='0.8em' colorScheme="teal">{launchEnvironment}</Badge> Elrond Wallet</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack spacing="5">
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
    </Stack>}
    </>
  );
};

export default AuthPickerElrond;
