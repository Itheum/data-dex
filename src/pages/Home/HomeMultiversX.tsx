import React, { useEffect, useState } from "react";
import { WarningTwoIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Spacer,
  Spinner,
  Stack,
  Text,
  Tooltip,
  useBreakpointValue,
  useColorMode,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useGetAccountInfo, useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import myNFMe from "assets/img/my-nfme.png";
import ClaimModalMx from "components/ClaimModal/ClaimModalMultiversX";
import RecentDataNFTs from "components/Sections/RecentDataNFTs";
import ChainSupportedComponent from "components/UtilComps/ChainSupportedComponent";
import { CHAIN_TOKEN_SYMBOL, CLAIM_TYPES, MENU, uxConfig } from "libs/config";
import { ClaimsContract } from "libs/MultiversX/claims";
import { FaucetContract } from "libs/MultiversX/faucet";
import { formatNumberRoundFloor } from "libs/utils";
import AppMarketplace from "pages/Home/AppMarketplace";
import { useChainMeta } from "store/ChainMetaContext";

export default function HomeMultiversX({
  setMenuItem,
  dataCATAccount,
  onRfMount,
  loadingDataCATAccount,
  onDataCATAccount,
}: {
  setMenuItem: any;
  dataCATAccount: any;
  onRfMount: any;
  loadingDataCATAccount: boolean;
  onDataCATAccount: any;
}) {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const { chainMeta: _chainMeta } = useChainMeta();
  const { address: mxAddress } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();

  const [isOnChainInteractionDisabled, setIsOnChainInteractionDisabled] = useState(false);
  const [isMxFaucetDisabled, setIsMxFaucetDisabled] = useState(false);
  const [claimsBalances, setClaimsBalances] = useState({
    claimBalanceValues: ["-1", "-1", "-1", "-1"], // -1 is loading, -2 is error
    claimBalanceDates: [0, 0, 0, 0],
  });
  const [claimContractPauseValue, setClaimContractPauseValue] = useState(false);

  const navigate = useNavigate();

  const mxFaucetContract = new FaucetContract(_chainMeta.networkId);
  const mxClaimsContract = new ClaimsContract(_chainMeta.networkId);

  // S: Faucet
  useEffect(() => {
    // hasPendingTransactions will fire with false during init and then move from true to false each time a TX is done...
    // ... so if it's 'false' we need check and prevent faucet from being used too often
    if (_chainMeta?.networkId === "ED" && mxAddress && mxFaucetContract && !hasPendingTransactions) {
      mxFaucetContract.getFaucetTime(mxAddress).then((lastUsedTime) => {
        const timeNow = new Date().getTime();

        if (lastUsedTime + 120000 > timeNow) {
          setIsMxFaucetDisabled(true);

          // after 2 min wait we reenable the button on the UI automatically
          setTimeout(() => {
            setIsMxFaucetDisabled(false);
          }, lastUsedTime + 120 * 60 * 1000 + 1000 - timeNow);
        } else {
          setIsMxFaucetDisabled(false);
        }
      });
    }
  }, [mxAddress, hasPendingTransactions]);

  const handleOnChainFaucet = async () => {
    if (mxAddress) {
      mxFaucetContract.sendActivateFaucetTransaction(mxAddress);
    }
  };
  // E: Faucet

  // S: Claims
  useEffect(() => {
    // this will trigger during component load/page load, so let's get the latest claims balances
    if (!hasPendingTransactions) {
      mxClaimsBalancesUpdate();
    }
  }, [mxAddress, hasPendingTransactions]);

  // utility func to get claims balances from chain
  const mxClaimsBalancesUpdate = async () => {
    if (mxAddress) {
      const claimBalanceValues = [];
      const claimBalanceDates: number[] = [];

      const claims = await mxClaimsContract.getClaims(mxAddress);

      if (!claims.error && claims.data) {
        claims.data.forEach((claim) => {
          claimBalanceValues.push(claim.amount / Math.pow(10, 18));
          claimBalanceDates.push(claim.date);
        });
      } else if (claims.error) {
        claimBalanceValues.push("-2", "-2", "-2", "-2"); // errors

        if (!toast.isActive("er2")) {
          toast({
            id: "er2",
            title: "ER2: Could not get your claims information from the MultiversX blockchain.",
            status: "error",
            isClosable: true,
            duration: null,
          });
        }
      }

      setClaimsBalances({
        claimBalanceValues,
        claimBalanceDates,
      });
    }
  };

  useEffect(() => {
    // check if claims contract is paused, freeze ui so user does not waste gas
    if (!hasPendingTransactions) {
      getAndSetMxClaimsIsPaused();
    }
  }, [mxAddress]);

  const getAndSetMxClaimsIsPaused = async () => {
    if (mxAddress && isMxLoggedIn) {
      const isPaused = await mxClaimsContract.isClaimsContractPaused();
      setClaimContractPauseValue(isPaused);
      return isPaused;
    }
  };
  // E: Claims

  useEffect(() => {
    if (hasPendingTransactions) {
      // block user trying to do other claims or on-chain tx until current one completes
      setIsOnChainInteractionDisabled(true);

      // user just triggered a faucet tx, so we prevent them from clicking ui again until tx is complete
      setIsMxFaucetDisabled(true);
    } else {
      // mxClaimsBalancesUpdate(); // get latest claims balances from on-chain as well

      setIsOnChainInteractionDisabled(false); // unlock, and let them do other on-chain tx work
    }
  }, [hasPendingTransactions]);

  const shouldClaimButtonBeDisabled = (claimTypeIndex: number) => {
    return (
      claimContractPauseValue ||
      isOnChainInteractionDisabled ||
      claimsBalances.claimBalanceValues[claimTypeIndex] === "-1" ||
      claimsBalances.claimBalanceValues[claimTypeIndex] === "-2" ||
      Number(claimsBalances.claimBalanceValues[claimTypeIndex]) <= 0
    );
  };

  // S: claims related logic
  const { isOpen: isRewardsOpen, onOpen: onRewardsOpen, onClose: onRewardsClose } = useDisclosure();

  const rewardsModalData = {
    isOpen: isRewardsOpen,
    onClose: () => {
      onRewardsClose();
    },
    title: "Rewards",
    tag1: "Total Available",
    value1: claimsBalances.claimBalanceValues[0],
    tag2: "Last Deposited on",
    value2: moment(claimsBalances.claimBalanceDates[0]).format(uxConfig.dateStrTm),
    claimType: CLAIM_TYPES.REWARDS,
    mxClaimsContract,
  };

  const { isOpen: isAirdropsOpen, onOpen: onAirdropsOpen, onClose: onAirdropClose } = useDisclosure();

  const airdropsModalData = {
    isOpen: isAirdropsOpen,
    onClose: () => {
      onAirdropClose();
    },
    title: "Airdrops",
    tag1: "Total Available",
    value1: claimsBalances.claimBalanceValues[1],
    tag2: "Last Deposited on",
    value2: moment(claimsBalances.claimBalanceDates[1]).format(uxConfig.dateStrTm),
    claimType: CLAIM_TYPES.AIRDROPS,
    mxClaimsContract,
  };

  const { isOpen: isAllocationsOpen, onOpen: onAllocationsOpen, onClose: onAllocationsClose } = useDisclosure();

  const allocationsModalData = {
    isOpen: isAllocationsOpen,
    onClose: () => {
      onAllocationsClose();
    },
    title: "Allocations",
    tag1: "Total Available",
    value1: claimsBalances.claimBalanceValues[2],
    tag2: "Last Deposited on",
    value2: moment(claimsBalances.claimBalanceDates[2]).format(uxConfig.dateStrTm),
    claimType: CLAIM_TYPES.ALLOCATIONS,
    mxClaimsContract,
  };

  const { isOpen: isRoyaltiesOpen, onOpen: onRoyaltiesOpen, onClose: onRoyaltiesClose } = useDisclosure();

  const royaltiesModalData = {
    isOpen: isRoyaltiesOpen,
    onClose: () => {
      onRoyaltiesClose();
    },
    title: "Royalties",
    tag1: "Total Available",
    value1: claimsBalances.claimBalanceValues[3],
    tag2: "Last Deposited on",
    value2: moment(claimsBalances.claimBalanceDates[3]).format(uxConfig.dateStrTm),
    claimType: CLAIM_TYPES.ROYALTIES,
    mxClaimsContract,
  };
  // E: claims related logic

  const tileBoxMdW = "310px";
  const tileBoxH = "360px";
  const claimsStackMinW = "220px";
  const heroGridMargin = useBreakpointValue({ base: "auto", md: "initial" });

  // obtain signature by signing the following message: `${address}${init}`
  // Example:
  // - if the address is `erd1qnk2vmuqywfqtdnkmauvpm8ls0xh00k8xeupuaf6cm6cd4rx89qqz0ppgl`
  // - and the init string is `YXBpLmVscm9uZC5jb20.066de4ba7df143f2383c3e0cd7ef8eeaf13375d1123ec8bafcef9f7908344b0f.86400.e30`
  // - then the signable message should be `erd1qnk2vmuqywfqtdnkmauvpm8ls0xh00k8xeupuaf6cm6cd4rx89qqz0ppgl066de4ba7df143f2383c3e0cd7ef8eeaf13375d1123ec8bafcef9f7908344b0f.86400.e30`

  return (
    <>
      <Stack mx={{ base: 5, lg: 24 }}>
        <Box m={heroGridMargin} pt="20" pb="10">
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3, "2xl": 4 }} spacing={10}>
            <ChainSupportedComponent feature={MENU.DATACAT}>
              <Box w={[tileBoxMdW, "initial"]} backgroundColor="none" border="1px solid transparent" borderColor="#00C79740" borderRadius="16px">
                <Stack p="5" alignItems={{ base: "center", xl: "start" }}>
                  {!dataCATAccount && (
                    <Heading size="md" fontWeight="semibold" pb={2}>
                      Linked Data CAT Accounts
                    </Heading>
                  )}

                  {(loadingDataCATAccount && (
                    <Flex justifyContent="center" alignItems="center" textAlign="center" h="350px" w="full">
                      <Spinner speed="0.64s" color="teal.200" label="Fetching Data" />
                    </Flex>
                  )) ||
                    (!dataCATAccount && (
                      <Stack h={tileBoxH}>
                        <Alert borderRadius="lg" bgColor={colorMode === "dark" ? "#68686850" : "#68686815"} overflowY={{ base: "scroll", lg: "hidden" }}>
                          <Flex direction="column">
                            <Box>
                              <AlertTitle fontSize="md" mt={{ base: 0, md: 0, xl: 0, "2xl": 0 }}>
                                <AlertIcon pb={{ base: 1, "2xl": 2 }} mt={1} color="#ED5D5D" />{" "}
                                <Flex direction="row">
                                  <Text color="#ED5D5D">Sorry! You don&apos;t seem to have a linked Data CAT account</Text>
                                </Flex>
                              </AlertTitle>
                              <AlertDescription fontSize="1rem" color={colorMode === "dark" ? "#FFFFFFBF" : "#868686bf"} pb="2" fontWeight="300">
                                But don&apos;t fret; you can still test the Data DEX by temporarily linking to a test account below.
                              </AlertDescription>
                            </Box>
                          </Flex>
                        </Alert>

                        <Spacer />
                        {/*<Box h={{ base: 32, md: 12, xl: 12 }}></Box>*/}

                        <Button colorScheme="teal" size="lg" variant="outline" borderRadius="xl" onClick={() => onDataCATAccount(true)}>
                          <Text color={colorMode === "dark" ? "white" : "black"}>Load Test Data</Text>
                        </Button>
                      </Stack>
                    )) || (
                      <>
                        <Stack h="395px" w="full">
                          <Heading size="md" fontWeight="semibold" pb={2} textAlign={{ base: "center", xl: "left" }}>
                            Welcome {`${dataCATAccount.firstName} ${dataCATAccount.lastName}`}
                          </Heading>
                          <Text fontSize="md" mb="4 !important" textAlign={{ base: "center", xl: "left" }} color="#929497">
                            You have data available to trade from the following programs
                          </Text>
                          {dataCATAccount.programsAllocation.map((item: any) => (
                            <Stack direction="row" key={item.program}>
                              <Badge borderRadius="full" px="2" colorScheme="teal">
                                {dataCATAccount._lookups.programs[item.program].programName}
                              </Badge>
                            </Stack>
                          ))}

                          <Spacer />

                          <Button
                            colorScheme="teal"
                            size="lg"
                            variant="outline"
                            borderRadius="xl"
                            onClick={() => {
                              setMenuItem(2);
                              navigate("/tradedata");
                            }}>
                            <Text color={colorMode === "dark" ? "white" : "black"}>Trade My Data</Text>
                          </Button>
                        </Stack>
                      </>
                    )}
                </Stack>
              </Box>
            </ChainSupportedComponent>

            <ChainSupportedComponent feature={MENU.FAUCET}>
              <Box w={[tileBoxMdW, "initial"]} backgroundColor="none" border="1px solid transparent" borderColor="#00C79740" borderRadius="16px">
                <Stack p="5" alignItems={{ base: "center", xl: "start" }}>
                  <Heading size="md" fontWeight="semibold" pb={2}>
                    {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)} Faucet
                  </Heading>
                  <Stack h={tileBoxH} w={"full"}>
                    <Text textAlign={{ base: "center", xl: "left" }} fontSize="md" color="#929497" pb={5}>
                      Get some free {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)} tokens to try DEX features
                    </Text>

                    <Spacer />
                    {/*<Box h={{ base: 40, md: 40, xl: 40 }}></Box>*/}

                    <Button colorScheme="teal" size="lg" variant="outline" borderRadius="xl" onClick={handleOnChainFaucet} isDisabled={isMxFaucetDisabled}>
                      <Text color={colorMode === "dark" ? "white" : "black"}>Send me 20 {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)}</Text>
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </ChainSupportedComponent>

            <Box w={[tileBoxMdW, "initial"]} backgroundColor="none" border="1px solid transparent" borderColor="#00C79740" borderRadius="16px">
              <Stack p="5" h={"430px"} bgImage={myNFMe} bgSize="cover" bgPosition="top" borderRadius="lg" alignItems={{ base: "center", xl: "start" }}>
                <Heading size="md" pb={2}>
                  NFMe ID Avatar
                </Heading>
                <Spacer />

                <Flex w="full" justifyContent="center">
                  <Badge borderRadius="full" px="2" bgColor="teal.200">
                    <Text fontSize="md" fontWeight="600" color={colorMode === "light" ? "bgWhite" : "black"}>
                      Coming Soon
                    </Text>
                  </Badge>
                </Flex>
              </Stack>
            </Box>

            <ChainSupportedComponent feature={MENU.CLAIMS}>
              <Box w={[tileBoxMdW, "initial"]} backgroundColor="none" border="1px solid transparent" borderColor="#00C79740" borderRadius="16px">
                <Stack p="5" h={"430px"} minW={claimsStackMinW}>
                  <Heading size="md" pb={2} textAlign={{ base: "center", xl: "start" }}>
                    My Claims
                  </Heading>

                  <Flex flexDirection="column" gap={7}>
                    <HStack justifyContent={"space-between"}>
                      <Text color="#929497">Rewards</Text>
                      <Tooltip colorScheme="teal" hasArrow label="The claims contract is currently paused" isDisabled={!claimContractPauseValue}>
                        <Button isDisabled={shouldClaimButtonBeDisabled(0)} colorScheme="teal" variant="outline" w="70px" onClick={onRewardsOpen}>
                          {claimsBalances.claimBalanceValues[0] !== "-1" && claimsBalances.claimBalanceValues[0] !== "-2" ? (
                            <Text color={colorMode === "dark" ? "white" : "black"}>{formatNumberRoundFloor(Number(claimsBalances.claimBalanceValues[0]))}</Text>
                          ) : claimsBalances.claimBalanceValues[0] !== "-2" ? (
                            <Spinner size="xs" />
                          ) : (
                            <WarningTwoIcon />
                          )}
                        </Button>
                      </Tooltip>

                      <ClaimModalMx {...rewardsModalData} />
                    </HStack>

                    <Spacer />
                    <HStack justifyContent={"space-between"}>
                      <Text color="#929497">Airdrops</Text>
                      <Tooltip colorScheme="teal" hasArrow label="The claims contract is currently paused" isDisabled={!claimContractPauseValue}>
                        <Button isDisabled={shouldClaimButtonBeDisabled(1)} colorScheme="teal" variant="outline" w="70px" onClick={onAirdropsOpen}>
                          {claimsBalances.claimBalanceValues[1] !== "-1" && claimsBalances.claimBalanceValues[1] !== "-2" ? (
                            <Text color={colorMode === "dark" ? "white" : "black"}>{formatNumberRoundFloor(Number(claimsBalances.claimBalanceValues[1]))}</Text>
                          ) : claimsBalances.claimBalanceValues[1] !== "-2" ? (
                            <Spinner size="xs" />
                          ) : (
                            <WarningTwoIcon />
                          )}
                        </Button>
                      </Tooltip>

                      <ClaimModalMx {...airdropsModalData} />
                    </HStack>
                    <Spacer />

                    <HStack justifyContent={"space-between"}>
                      <Text color="#929497">Royalties</Text>
                      <Tooltip colorScheme="teal" hasArrow label="The claims contract is currently paused" isDisabled={!claimContractPauseValue}>
                        <Button isDisabled={shouldClaimButtonBeDisabled(3)} colorScheme="teal" variant="outline" w="70px" onClick={onRoyaltiesOpen}>
                          {claimsBalances.claimBalanceValues[3] !== "-1" && claimsBalances.claimBalanceValues[3] !== "-2" ? (
                            <Text color={colorMode === "dark" ? "white" : "black"}>{formatNumberRoundFloor(Number(claimsBalances.claimBalanceValues[3]))}</Text>
                          ) : claimsBalances.claimBalanceValues[3] !== "-2" ? (
                            <Spinner size="xs" />
                          ) : (
                            <WarningTwoIcon />
                          )}
                        </Button>
                      </Tooltip>

                      <ClaimModalMx {...royaltiesModalData} />
                    </HStack>
                    <Spacer />

                    {(Number(claimsBalances.claimBalanceValues[2]) > 0 && (
                      <Box h="40px">
                        <HStack justifyContent={"space-between"}>
                          <Text color="#929497">Allocations</Text>
                          <Tooltip colorScheme="teal" hasArrow label="The claims contract is currently paused" isDisabled={!claimContractPauseValue}>
                            <Button isDisabled={shouldClaimButtonBeDisabled(2)} colorScheme="teal" variant="outline" w="70px" onClick={onAllocationsOpen}>
                              {claimsBalances.claimBalanceValues[2] !== "-1" && claimsBalances.claimBalanceValues[2] !== "-2" ? (
                                <Text color={colorMode === "dark" ? "white" : "black"}>
                                  {formatNumberRoundFloor(Number(claimsBalances.claimBalanceValues[2]))}
                                </Text>
                              ) : claimsBalances.claimBalanceValues[2] !== "-2" ? (
                                <Spinner size="xs" />
                              ) : (
                                <WarningTwoIcon />
                              )}
                            </Button>
                          </Tooltip>
                          <ClaimModalMx {...allocationsModalData} />
                        </HStack>
                      </Box>
                    )) || <Box h="40px" />}

                    <Spacer />
                  </Flex>
                </Stack>
              </Box>
            </ChainSupportedComponent>
          </SimpleGrid>
        </Box>

        <Box m="auto" pt="10" pb="10">
          <RecentDataNFTs headingText="Recent Data NFTs" headingSize="lg" networkId={_chainMeta.networkId} />
        </Box>

        <Box m="auto" pt="10" pb="6rem">
          <AppMarketplace setMenuItem={setMenuItem} />
        </Box>
      </Stack>
    </>
  );
}
