import { useEffect } from "react";
import { Stack, Box, Text, Link, Wrap, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, WrapItem } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { DappUI } from "@elrondnetwork/dapp-core";
import { useGetAccountInfo } from "@elrondnetwork/dapp-core";
import { WALLETS } from 'libs/util';
import { gtagGo } from 'libs/util';
import { useSessionStorage } from 'libs/hooks';

function AuthPickerElrond ({ resetLaunchMode }) {
  const { ExtensionLoginButton, WebWalletLoginButton, LedgerLoginButton, WalletConnectLoginButton } = DappUI;
  const { address: elrondAddress } = useGetAccountInfo();
  const { isOpen: isProgressModalOpen, onOpen: onProgressModalOpen, onClose: onProgressModalClose } = useDisclosure();
  const [walletUsedSession, setWalletUsedSession] = useSessionStorage('wallet-used', null);

  useEffect(() => {
    onProgressModalOpen();
    
    try {
      document.getElementsByClassName('chakra-portal')[0].style.display = 'initial';
    } catch(e) {}
  }, []);


  useEffect(() => {
    if (elrondAddress) {
      handleProgressModalClose();
    }
  }, [elrondAddress]);

  const handleProgressModalClose = () => {
    onProgressModalClose();

    // reset the original state of the chakra model
    document.querySelector('body').classList.remove('dapp-core-modal-active');

    // only reset host page to elrond vs evm wallet selector IF user did NOT just already log in successfully
    if (!elrondAddress) {
      resetLaunchMode();
    }
  };

  const goElrondLogin = (wallet) => {
    gtagGo('auth', 'login', wallet);

    setWalletUsedSession(wallet);

    if (wallet === 'el_maiar' || wallet === 'el_ledger') {
      document.querySelector('body').classList.add('dapp-core-modal-active');
    }
  };

  return (
    <>
      {!elrondAddress && <Stack spacing={6} p="5">
      <Modal size="xl" isOpen={isProgressModalOpen} onClose={handleProgressModalClose} closeOnEsc={false} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select a Wallet</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack spacing="5">
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

export default AuthPickerElrond;
