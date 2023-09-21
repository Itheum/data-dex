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
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { NativeAuthConfigType } from "@multiversx/sdk-dapp/types";
import { ExtensionLoginButton, LedgerLoginButton, WalletConnectLoginButton, WebWalletLoginButton } from "@multiversx/sdk-dapp/UI";
import { useLocation } from "react-router-dom";
import { WALLETS } from "libs/config";
import { useLocalStorage } from "libs/hooks";
import { getApi } from "libs/MultiversX/api";
import { walletConnectV2ProjectId } from "libs/mxConstants";
import { gtagGo, clearAppSessionsLaunchMode, sleep } from "libs/utils";

function ModalAuthPickerMx({ resetLaunchMode }: { resetLaunchMode: any }) {
  const { address: mxAddress } = useGetAccountInfo();
  const { chainID } = useGetNetworkConfig();
  const { isOpen: isProgressModalOpen, onOpen: onProgressModalOpen, onClose: onProgressModalClose } = useDisclosure();
  const [, setWalletUsedSession] = useLocalStorage("itm-wallet-used", null);
  const { pathname } = useLocation();

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

  const nativeAuthProps: NativeAuthConfigType = {
    apiAddress: `https://${getApi(chainID)}`,
    origin: window.location.origin,
    expirySeconds: 3000,
  };
  const commonProps = {
    nativeAuth: {
      ...nativeAuthProps,
    },
    callbackRoute: pathname,
  };

  return (
    <>
      {!mxAddress && (
        <Modal isCentered size={modelSize} isOpen={isProgressModalOpen} onClose={handleProgressModalClose} closeOnEsc={false} closeOnOverlayClick={false}>
          <ModalOverlay backdropFilter="blur(10px)" />
          <ModalContent>
            <ModalCloseButton />
            <ModalHeader mt={5}>
              Select a{" "}
              <Badge mb="1" mr="1" ml="1" variant="outline" fontSize="0.8em" colorScheme="teal">
                {process.env.REACT_APP_ENV_NETWORK}
              </Badge>{" "}
              MultiversX Wallet
            </ModalHeader>
            <ModalBody pb={6}>
              <Stack spacing="5">
                <Box p="5px">
                  <Stack>
                    <Wrap spacing="20px" justify="space-between" padding="10px">
                      <WrapItem onClick={() => goMxLogin(WALLETS.MX_XPORTALAPP)} className="auth_wrap">
                        <WalletConnectLoginButton
                          loginButtonText={"xPortal App"}
                          buttonClassName="auth_button"
                          {...commonProps}
                          {...(walletConnectV2ProjectId ? { isWalletConnectV2: true } : {})}></WalletConnectLoginButton>
                      </WrapItem>

                      <WrapItem onClick={() => goMxLogin(WALLETS.MX_DEFI)} className="auth_wrap">
                        <ExtensionLoginButton loginButtonText={"DeFi Wallet"} buttonClassName="auth_button" {...commonProps}></ExtensionLoginButton>
                      </WrapItem>

                      <WrapItem onClick={() => goMxLogin(WALLETS.MX_WEBWALLET)} className="auth_wrap">
                        <WebWalletLoginButton loginButtonText={"Web Wallet"} buttonClassName="auth_button" {...commonProps}></WebWalletLoginButton>
                      </WrapItem>

                      <WrapItem onClick={() => goMxLogin(WALLETS.MX_LEDGER)} className="auth_wrap">
                        <LedgerLoginButton loginButtonText={"Ledger"} buttonClassName="auth_button" {...commonProps}></LedgerLoginButton>
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

export default ModalAuthPickerMx;
