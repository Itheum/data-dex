import React, { useEffect } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Stack,
  Box,
  Text,
  Link,
  Wrap,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  WrapItem,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { ExtensionLoginButton, LedgerLoginButton, WalletConnectLoginButton, WebWalletLoginButton } from "@multiversx/sdk-dapp/UI";
import { WALLETS } from "libs/config";
import { useLocalStorage } from "libs/hooks";
import { walletConnectV2ProjectId } from "libs/mxConstants";
import { gtagGo, clearAppSessionsLaunchMode, sleep } from "libs/utils";

function AuthPickerMx({ launchEnvironment, resetLaunchMode }: { launchEnvironment: any; resetLaunchMode: any }) {
  const { address: mxAddress } = useGetAccountInfo();
  const { isOpen: isProgressModalOpen, onOpen: onProgressModalOpen, onClose: onProgressModalClose } = useDisclosure();
  const [, setWalletUsedSession] = useLocalStorage("itm-wallet-used", null);

  useEffect(() => {
    async function cleanOutRemoteXPortalAppWalletDisconnect() {
      clearAppSessionsLaunchMode();

      await sleep(1);
      if (window !== undefined) {
        window.location.replace("/");
      }
    }

    if (window.location.pathname === "/unlock") {
      // if a user disconnects the mobile xPortal app, it logs out user
      //... via dapp-core internally but redirects to a /unlock. We need to clean out the sessions correctly in this case
      cleanOutRemoteXPortalAppWalletDisconnect();
    } else {
      onProgressModalOpen();
    }
  }, []);

  useEffect(() => {
    if (mxAddress) {
      handleProgressModalClose();
    }
  }, [mxAddress]);

  const handleProgressModalClose = () => {
    onProgressModalClose();

    // only reset host page to mx vs evm wallet selector IF user did NOT just already log in successfully
    if (!mxAddress) {
      resetLaunchMode();
    }
  };

  const goMxLogin = (wallet: any) => {
    gtagGo("auth", "login", wallet);

    setWalletUsedSession(wallet);
  };

  const modelSize = useBreakpointValue({ base: "xs", md: "xl" });

  return (
    <>
      {!mxAddress && (
        <Modal isCentered size={modelSize} isOpen={isProgressModalOpen} onClose={handleProgressModalClose} closeOnEsc={false} closeOnOverlayClick={false}>
          <ModalOverlay backdropFilter="blur(10px)" />
          <ModalContent>
            <ModalHeader>
              Select a{" "}
              <Badge mb="1" mr="1" ml="1" variant="outline" fontSize="0.8em" colorScheme="teal">
                {launchEnvironment}
              </Badge>{" "}
              MultiversX Wallet
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Stack spacing="5">
                <Box p="5px">
                  <Stack>
                    <Wrap spacing="20px" justify="space-between" padding="10px">
                      <WrapItem onClick={() => goMxLogin(WALLETS.MX_XPORTALAPP)} className="auth_wrap">
                        <WalletConnectLoginButton
                          callbackRoute={"/dashboard"}
                          loginButtonText={"xPortal App"}
                          buttonClassName="auth_button"
                          {...(walletConnectV2ProjectId ? { isWalletConnectV2: true } : {})}></WalletConnectLoginButton>
                      </WrapItem>

                      <WrapItem onClick={() => goMxLogin(WALLETS.MX_DEFI)} className="auth_wrap">
                        <ExtensionLoginButton callbackRoute={"/dashboard"} loginButtonText={"DeFi Wallet"} buttonClassName="auth_button"></ExtensionLoginButton>
                      </WrapItem>

                      <WrapItem onClick={() => goMxLogin(WALLETS.MX_WEBWALLET)} className="auth_wrap">
                        <WebWalletLoginButton callbackRoute={"/dashboard"} loginButtonText={"Web Wallet"} buttonClassName="auth_button"></WebWalletLoginButton>
                      </WrapItem>

                      <WrapItem onClick={() => goMxLogin(WALLETS.MX_LEDGER)} className="auth_wrap">
                        <LedgerLoginButton callbackRoute={"/dashboard"} loginButtonText={"Ledger"} buttonClassName="auth_button"></LedgerLoginButton>
                      </WrapItem>
                    </Wrap>
                  </Stack>
                </Box>

                <Text fontSize="sm">
                  By logging in, you are agreeing to the{" "}
                  <Link href="https://itheum.com/legal/datadex/termsofuse" isExternal>
                    Terms of Use <ExternalLinkIcon mx="2px" />
                  </Link>{" "}
                  &{" "}
                  <Link href="https://itheum.com/legal/datadex/privacypolicy" isExternal>
                    Privacy Policy <ExternalLinkIcon mx="2px" />
                  </Link>
                </Text>
              </Stack>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
}

export default AuthPickerMx;
