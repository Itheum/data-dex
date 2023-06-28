import React, { useEffect, useState } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Progress,
  Link,
  CloseButton,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Spacer,
  Spinner,
  Stack,
  Text,
  useToast,
  SimpleGrid,
  useColorMode,
  Flex,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import AppMarketplace from "Home/AppMarketplace";
import myNFMe from "img/my-nfme.png";
import { CHAIN_TOKEN_SYMBOL, MENU, styleStrings, sleep } from "libs/util";
import RecentArticles from "Sections/RecentArticles";
import { useChainMeta } from "store/ChainMetaContext";
import ChainSupportedComponent from "UtilComps/ChainSupportedComponent";

import { ethers } from "ethers";
import { ABIS } from "../EVM/ABIs";

export default function HomeMx({ setMenuItem, dataCATAccount, onRfMount, onRefreshTokenBalance, loadingDataCATAccount, onDataCATAccount }) {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const { chainMeta: _chainMeta } = useChainMeta();
  const [faucetWorking, setFaucetWorking] = useState(false);
  const [txConfirmationFaucet, setTxConfirmationFaucet] = useState(0);
  const [txHashFaucet, setTxHashFaucet] = useState(null);
  const [txErrorFaucet, setTxErrorFaucet] = useState(null);

  const navigate = useNavigate();

  // S: Faucet
  useEffect(() => {
    if (txErrorFaucet) {
      setFaucetWorking(false);
    } else {
      if (txHashFaucet && txConfirmationFaucet === 100) {
        toast({
          title: `Congrats! the faucet has sent you some ${CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)}`,
          status: "success",
          duration: 6000,
          isClosable: true,
        });

        resetFaucetState();
        onRefreshTokenBalance();
      }
    }
  }, [txConfirmationFaucet, txHashFaucet, txErrorFaucet]);

  const web3_tokenFaucet = async () => {
    setFaucetWorking(true);

    const web3Signer = _chainMeta.ethersProvider.getSigner();
    const tokenContract = new ethers.Contract(_chainMeta.contracts.itheumToken, ABIS.token, web3Signer);

    const decimals = 18;
    const tokenInPrecision = ethers.utils.parseUnits("50.0", decimals).toHexString();

    try {
      const txResponse = await tokenContract.faucet(_chainMeta.loggedInAddress, tokenInPrecision);

      // show a nice loading animation to user
      setTxHashFaucet(`https://shibuya.subscan.io/tx/${txResponse.hash}`);

      await sleep(2);
      setTxConfirmationFaucet(40);

      // wait for 1 confirmation from ethers
      const txReceipt = await txResponse.wait();
      setTxConfirmationFaucet(60);
      await sleep(2);

      if (txReceipt.status) {
        setTxConfirmationFaucet(100);
      } else {
        const txErr = new Error("Token Contract Error on method faucet");
        console.error(txErr);

        setTxErrorFaucet(txErr);
      }
    } catch (e) {
      setTxErrorFaucet(e);
    }
  };

  function resetFaucetState() {
    setFaucetWorking(false);
    setTxConfirmationFaucet(0);
    setTxHashFaucet(null);
    setTxErrorFaucet(null);
  }

  const handleOnChainFaucet = async () => {
    setTxErrorFaucet(null);
    web3_tokenFaucet();
  };
  // E: Faucet

  const tileBoxMdW = "330px";
  const tileBoxH = "360px";

  let gradientBorderForTrade = styleStrings.gradientBorderMulticolorToBottomRight;

  if (colorMode === "light") {
    gradientBorderForTrade = styleStrings.gradientBorderMulticolorToBottomRightLight;
  }

  return (
    <Stack mx={{ base: 5, lg: 24 }}>
      <AppMarketplace setMenuItem={setMenuItem} />

      <Box m="auto" pt="10" pb="10" backgroundColor="none">
        <Heading size="lg" fontWeight="semibold" textAlign={["center", "initial"]}>
          Web3 Identity
        </Heading>

        <Stack mt="5">
          <SimpleGrid columns={[1, null, 4]} spacing={20} backgroundColor="none">
            <Box
              w={{ base: "290px", "2xl": tileBoxMdW }}
              border=".1rem solid transparent"
              backgroundColor="none"
              borderRadius="1.5rem"
              style={{ "background": gradientBorderForTrade }}>
              <Stack p="5" h={tileBoxH}>
                {!dataCATAccount && (
                  <Heading size="md" fontWeight="semibold" pb={2}>
                    Linked Data CAT Accounts
                  </Heading>
                )}

                {(loadingDataCATAccount && (
                  <Box textAlign="center" mt="40% !important">
                    <Spinner speed="0.64s" color="teal.200" label="Fetching Data" />
                  </Box>
                )) ||
                  (!dataCATAccount && (
                    <>
                      <Alert borderRadius="lg" mt="2 !important" bgColor="#68686850">
                        <Flex direction="column">
                          <AlertTitle fontSize="md">
                            <AlertIcon mb={{ base: 1, "2xl": 2 }} mt={1} color="#ED5D5D" />{" "}
                            <Flex direction="row">
                              <Text color="#ED5D5D">Sorry! You don&apos;t seem to have a linked Data CAT account</Text>
                            </Flex>
                          </AlertTitle>
                          <AlertDescription fontSize="md" color="#929497" pb="2">
                            But don&apos;t fret; you can still test the Data DEX by temporarily linking to a test data account below.
                          </AlertDescription>
                        </Flex>
                      </Alert>

                      <Spacer />

                      <Button size="lg" borderRadius="xl" colorScheme="teal" variant="solid" onClick={() => onDataCATAccount(true)}>
                        <Text color={colorMode === "dark" ? "white" : "black"}>Load Test Data</Text>
                      </Button>
                    </>
                  )) || (
                    <>
                      <Stack>
                        <Text fontSize="xl">Welcome {`${dataCATAccount.firstName} ${dataCATAccount.lastName}`}</Text>
                        <Text fontSize="sm" mb="4 !important">
                          You have data available to trade from the following programs
                        </Text>
                        {dataCATAccount.programsAllocation.map((item) => (
                          <Stack direction="row" key={item.program}>
                            <Badge borderRadius="full" px="2" colorScheme="teal">
                              {dataCATAccount._lookups.programs[item.program].programName}
                            </Badge>
                          </Stack>
                        ))}
                      </Stack>

                      <Spacer />

                      <Button
                        size="lg"
                        borderRadius="xl"
                        colorScheme="teal"
                        variant="outline"
                        onClick={() => {
                          setMenuItem(2);
                          navigate("/tradedata");
                        }}>
                        <Text color={colorMode === "dark" ? "white" : "black"}>Trade My Data</Text>
                      </Button>
                    </>
                  )}
              </Stack>
            </Box>

            <ChainSupportedComponent feature={MENU.FAUCET}>
              <Box
                w={{ base: "290px", "2xl": tileBoxMdW }}
                border=".1rem solid transparent"
                backgroundColor="none"
                borderRadius="1.5rem"
                style={{ "background": gradientBorderForTrade }}>
                <Stack p="5" h={tileBoxH}>
                  <Heading size="md" fontWeight="semibold" pb={2}>
                    {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)} Faucet
                  </Heading>
                  <Text fontSize="md" color="#929497" pb={5}>
                    Get some free {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)} tokens to try DEX features
                  </Text>
                  Progress
                  {txHashFaucet && (
                    <Stack>
                      <Progress colorScheme="teal" hasStripe value={txConfirmationFaucet} />

                      <HStack>
                        <Text fontSize="sm">Transaction </Text>
                        <Link fontSize="sm" href={txHashFaucet} isExternal>
                          {" "}
                          <ExternalLinkIcon mx="2px" />
                        </Link>
                      </HStack>
                    </Stack>
                  )}
                  {txErrorFaucet && (
                    <Alert status="error">
                      <AlertIcon />
                      {txErrorFaucet.message && <AlertTitle fontSize="md">{txErrorFaucet.message}</AlertTitle>}
                      <CloseButton position="absolute" right="8px" top="8px" onClick={resetFaucetState} />
                    </Alert>
                  )}
                  <Spacer />
                  <Button isLoading={faucetWorking} colorScheme="teal" size="lg" variant="outline" borderRadius="xl" onClick={handleOnChainFaucet}>
                    <Text color={colorMode === "dark" ? "white" : "black"}>Send me 50 {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)}</Text>
                  </Button>
                </Stack>
              </Box>
            </ChainSupportedComponent>

            <Box
              w={{ base: "290px", "2xl": tileBoxMdW }}
              border=".1rem solid transparent"
              backgroundColor="none"
              borderRadius="1.5rem"
              style={{ "background": gradientBorderForTrade }}>
              <Stack p="5" h={tileBoxH} bgImage={myNFMe} bgSize="cover" bgPosition="top" borderRadius="lg">
                <Heading size="md" textAlign="center" mr="20px">
                  NFMe ID Avatar
                </Heading>
                <Spacer />
                <Text fontSize="sm" align="center">
                  Coming Soon
                </Text>
              </Stack>
            </Box>
          </SimpleGrid>
        </Stack>
      </Box>

      {/* <Box m="auto" pt="10" pb="10" backgroundColor="none">
        <RecentDataNFTs headingText="Recent Data NFTs" headingSize="lg" networkId={_chainMeta.networkId} />
      </Box> */}

      <Box m="auto" pt="10" pb="10" backgroundColor="none">
        <Heading size="lg" fontWeight="semibold" textAlign={["center", "initial"]}>
          Featured Articles
        </Heading>

        <RecentArticles />
      </Box>
    </Stack>
  );
}
