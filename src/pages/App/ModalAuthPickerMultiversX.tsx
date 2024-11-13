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
  useToast,
  useBreakpointValue,
  useColorMode,
} from "@chakra-ui/react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { NativeAuthConfigType } from "@multiversx/sdk-dapp/types";
import { ExtensionLoginButton, LedgerLoginButton, WalletConnectLoginButton, WebWalletLoginButton } from "@multiversx/sdk-dapp/UI";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { WALLETS, MVX_ENV_ENUM } from "libs/config";
import { useLocalStorage } from "libs/hooks";
import { getMvxRpcApi } from "libs/MultiversX/api";
import { walletConnectV2ProjectId } from "libs/mxConstants";
import { gtagGo, clearAppSessionsLaunchMode, sleep, getApiDataDex } from "libs/utils";

/* 
we use global vars here so we can maintain this state across routing back and forth to this unlock page
these vars are used to detect a "new login", i.e a logged out user logged in. we can use this to enable
"user accounts" type activity, i.e. check if its a new user or returning user etc
*/
let mvxGotConnected = false;

function ModalAuthPickerMx({ resetLaunchMode, redirectToRoute }: { resetLaunchMode: any; redirectToRoute: null | string }) {
  const { address: mxAddress } = useGetAccountInfo();
  const {
    network: { chainId: chainID },
  } = useGetNetworkConfig();
  const { isOpen: isProgressModalOpen, onOpen: onProgressModalOpen, onClose: onProgressModalClose } = useDisclosure();
  const [, setWalletUsedSession] = useLocalStorage("itm-wallet-used", null);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const modelSize = useBreakpointValue({ base: "xs", md: "xl" });
  const toast = useToast();

  useEffect(() => {
    async function cleanOutRemoteXPortalAppWalletDisconnect() {
      clearAppSessionsLaunchMode();

      await sleep(1);
      if (window !== undefined) {
        navigate("/");
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
    console.log("==== effect for mxAddress. mxAddress = ", mxAddress);

    if (!mxAddress) {
      mvxGotConnected = false;
    } else {
      handleProgressModalClose();

      if (!mvxGotConnected) {
        // the user came to the unlock page without a mvx connection and then connected a wallet,
        // ... i.e a non-logged in user, just logged in using MVX
        console.log("==== User JUST logged in with mxAddress = ", mxAddress);

        const chainId = import.meta.env.VITE_ENV_NETWORK === "devnet" ? MVX_ENV_ENUM.devnet : MVX_ENV_ENUM.mainnet;
        logUserLoggedInInUserAccounts(mxAddress, chainId, true);
      }

      mvxGotConnected = true;
    }
  }, [mxAddress]);

  const handleProgressModalClose = () => {
    onProgressModalClose();

    resetLaunchMode();
  };

  const goMxLogin = (wallet: any) => {
    gtagGo("auth", "login", wallet);

    setWalletUsedSession(wallet);
  };

  const nativeAuthProps: NativeAuthConfigType = {
    apiAddress: `https://${getMvxRpcApi(chainID)}`,
    // origin: "https://test.datadex.itheum.io",
    expirySeconds: 3600,
  };

  const commonProps = {
    nativeAuth: {
      ...nativeAuthProps,
    },
    callbackRoute: redirectToRoute || pathname,
  };

  const logUserLoggedInInUserAccounts = async (addr: string, chainId: string, isMvx?: boolean) => {
    try {
      const callRes = await axios.post(`${getApiDataDex()}/datadexapi/userAccounts/userLoggedIn`, {
        addr,
        chainId,
      });

      const userLoggedInCallData = callRes.data;

      if (userLoggedInCallData?.error) {
        console.error("User account login call failed");
      } else {
        const celebrateEmojis = ["🥳", "🎊", "🍾", "🥂", "🍻", "🍾"];

        if (userLoggedInCallData?.newUserAccountCreated) {
          toast({
            title: `${celebrateEmojis[Math.floor(Math.random() * celebrateEmojis.length)]} Welcome New User! Its Great To Have You Here.`,
            status: "success",
          });
        } else if (userLoggedInCallData?.existingUserAccountLastLoginUpdated) {
          let userMessage = "";

          if (isMvx) {
            userMessage = "Welcome Back MultiversX Champion!";
          } else {
            userMessage = "Welcome Back Solana Legend!";
          }

          toast({
            title: `${celebrateEmojis[Math.floor(Math.random() * celebrateEmojis.length)]} ${userMessage}`,
            status: "success",
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {!mxAddress && isProgressModalOpen && (
        <Modal isCentered size={modelSize} isOpen={isProgressModalOpen} onClose={handleProgressModalClose} closeOnEsc={false} closeOnOverlayClick={false}>
          <ModalOverlay backdropFilter="blur(10px)" />
          <ModalContent bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
            <ModalCloseButton />
            <ModalHeader mt={5}>
              Select a{" "}
              <Badge mb="1" mr="1" ml="1" variant="outline" fontSize="0.8em" colorScheme="teal">
                {import.meta.env.VITE_ENV_NETWORK}
              </Badge>{" "}
              MultiversX Wallet
            </ModalHeader>
            <ModalBody pb={6}>
              <Stack spacing="5">
                <Box p="5px">
                  <Stack>
                    <Wrap spacing="20px" justify="space-around" padding="10px">
                      <WrapItem
                        onClick={() => {
                          goMxLogin(WALLETS.MX_XPORTALAPP);
                        }}
                        className="auth_wrap">
                        <WalletConnectLoginButton
                          loginButtonText={"xPortal App"}
                          buttonClassName="auth_button"
                          {...commonProps}
                          {...(walletConnectV2ProjectId ? { isWalletConnectV2: true } : {})}></WalletConnectLoginButton>
                      </WrapItem>

                      <WrapItem
                        onClick={() => {
                          goMxLogin(WALLETS.MX_DEFI);
                        }}
                        className="auth_wrap">
                        <ExtensionLoginButton loginButtonText={"DeFi Wallet"} buttonClassName="auth_button" {...commonProps}></ExtensionLoginButton>
                      </WrapItem>

                      <WrapItem
                        onClick={() => {
                          goMxLogin(WALLETS.MX_WEBWALLET);
                        }}
                        className="auth_wrap">
                        <WebWalletLoginButton loginButtonText={"Web Wallet"} buttonClassName="auth_button" {...commonProps}></WebWalletLoginButton>
                      </WrapItem>

                      <WrapItem
                        onClick={() => {
                          goMxLogin(WALLETS.MX_LEDGER);
                        }}
                        className="auth_wrap">
                        <LedgerLoginButton loginButtonText={"Ledger"} buttonClassName="auth_button" {...commonProps}></LedgerLoginButton>
                      </WrapItem>

                      {/* <WrapItem
                        onClick={() => {
                          goMxLogin(WALLETS.MX_XALIAS);
                        }}
                        className="auth_wrap">
                        <WebWalletLoginButton
                          loginButtonText={"Google (xAlias)"}
                          buttonClassName="auth_button"
                          customWalletAddress={IS_DEVNET ? "https://devnet.xalias.com" : "https://xalias.com"}
                          {...commonProps}></WebWalletLoginButton>
                      </WrapItem> */}
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
