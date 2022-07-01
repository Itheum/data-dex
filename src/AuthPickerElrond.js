import { useEffect, useState } from "react";
import { Button, Stack, Alert, AlertIcon, Box, AlertTitle, AlertDescription, Text, Image, Link, Wrap, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, WrapItem } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { DappUI } from "@elrondnetwork/dapp-core";
import { useGetAccountInfo, refreshAccount, sendTransactions } from "@elrondnetwork/dapp-core";

function AuthPickerElrond () {
  const { ExtensionLoginButton, WebWalletLoginButton, LedgerLoginButton, WalletConnectLoginButton } = DappUI;

  const { address: elrondAddress } = useGetAccountInfo();

  // const WALLETS = {
  //   ELROND: 3,
  // };

  const { isOpen: isProgressModalOpen, onOpen: onProgressModalOpen, onClose: onProgressModalClose } = useDisclosure();

  useEffect(() => {
    onProgressModalOpen();
    
    try {
      document.getElementsByClassName('chakra-portal')[0].style.display = 'initial';
    } catch(e) {}
  }, []);


  useEffect(() => {
    if (elrondAddress) {
      // setWalletUsed(WALLETS.ELROND);
    }
  }, [elrondAddress]);

  const handleProgressModalClose = () => {
    onProgressModalClose();

    // reset the original state of the chakra model
    document.querySelector('body').classList.remove('dapp-core-modal-active');
  };

  const handleModelFix = () => {
    document.querySelector('body').classList.toggle('dapp-core-modal-active');
  }

  return (
    <Stack spacing={6} p="5">
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
                  <Wrap spacing="20px" justify="space-between">
                    <WrapItem onClick={handleModelFix} width="230px">
                      <WalletConnectLoginButton 
                        callbackRoute={"/"} 
                        loginButtonText={"Maiar App"} 
                        buttonClassName="auth_button"></WalletConnectLoginButton>
                    </WrapItem>

                    <WrapItem width="230px">
                      <ExtensionLoginButton 
                        callbackRoute={"/"} 
                        loginButtonText={"Maiar DeFi Wallet"} 
                        buttonClassName="auth_button"></ExtensionLoginButton>
                    </WrapItem>

                    <WrapItem width="230px">
                      <WebWalletLoginButton 
                        callbackRoute={"/"} 
                        loginButtonText={"Web Wallet"} 
                        buttonClassName="auth_button"></WebWalletLoginButton>
                    </WrapItem>

                    <WrapItem onClick={handleModelFix} width="230px">
                      <LedgerLoginButton callbackRoute={"/"} 
                        loginButtonText={"Ledger"} 
                        buttonClassName="auth_button" ></LedgerLoginButton>
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
    </Stack>
  );
};

export default AuthPickerElrond;
