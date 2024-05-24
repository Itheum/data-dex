import React, { useEffect, useState } from "react";
import { WarningTwoIcon } from "@chakra-ui/icons";
import {
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
import { Address } from "@multiversx/sdk-core/out";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetAccountInfo, useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import myNFMe from "assets/img/my-nfme.png";
import illustration from "assets/img/whitelist/getWhitelist.png";
import ClaimModalMx from "components/ClaimModal/ClaimModalMultiversX";
import Faucet from "components/Faucet/Faucet";
import ExplainerArticles from "components/Sections/ExplainerArticles";
import RecentDataNFTs from "components/Sections/RecentDataNFTs";
import ChainSupportedComponent from "components/UtilComps/ChainSupportedComponent";
import { CLAIM_TYPES, MENU, uxConfig } from "libs/config";
import { ClaimsContract } from "libs/MultiversX/claims";
import { formatNumberToShort } from "libs/utils";
import AppMarketplace from "pages/Home/components/AppMarketplace";
import { TrendingData } from "./components/TrendingData";
import VolumesDataNfts from "./components/VolumesDataNfts";

export default function HomeMultiversX({ setMenuItem }: { setMenuItem: any }) {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const { chainID } = useGetNetworkConfig();
  const { address: mxAddress } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();
  const [isOnChainInteractionDisabled, setIsOnChainInteractionDisabled] = useState(false);
  const [claimsBalances, setClaimsBalances] = useState({
    claimBalanceValues: ["-1", "-1", "-1", "-1"], // -1 is loading, -2 is error
    claimBalanceDates: [0, 0, 0, 0],
  });
  const [claimContractPauseValue, setClaimContractPauseValue] = useState(false);
  const navigate = useNavigate();
  const mxClaimsContract = new ClaimsContract(chainID);

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

      const claims = await mxClaimsContract.getClaims(new Address(mxAddress));

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

  const tileBoxW = "310px";
  const tileBoxH = "360px";
  const claimsStackMinW = "220px";
  const heroGridMargin = useBreakpointValue({ base: "auto", md: "initial" });

  return (
    <>
      <Stack mx={{ base: 5, lg: 24 }}>
        <Box m={heroGridMargin} pt="20" pb="10" w={"100%"}>
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3, "2xl": 4 }} spacing={10}>
            <Box w={[tileBoxW, "initial"]} border="1px solid transparent" borderColor="#00C79740" borderRadius="16px">
              <Stack p="5" h={"439px"} borderRadius="lg" alignItems={{ base: "center", xl: "start" }}>
                <Box
                  className="bounce-hero-img"
                  h="100%"
                  w="100%"
                  bgPosition="50% 30%"
                  bgImage={illustration}
                  bgSize="230px"
                  backgroundRepeat="no-repeat"></Box>
                <Spacer />

                <Flex w="full" justifyContent="center">
                  <Button
                    mt="3"
                    size="lg"
                    colorScheme="teal"
                    variant="outline"
                    borderRadius="xl"
                    onClick={() => {
                      navigate("/mintdata");
                    }}>
                    <Text color={colorMode === "dark" ? "white" : "black"}>Mint Your Data as a Data NFT</Text>
                  </Button>
                </Flex>
              </Stack>
            </Box>

            <ChainSupportedComponent feature={MENU.FAUCET}>
              <Faucet tileBoxW={tileBoxW} tileBoxH={tileBoxH}></Faucet>
            </ChainSupportedComponent>

            <Box w={[tileBoxW, "initial"]} border="1px solid transparent" borderColor="#00C79740" borderRadius="16px">
              <Stack p="5" h={"430px"} bgImage={myNFMe} bgSize="cover" bgPosition="top" borderRadius="lg" alignItems={{ base: "center", xl: "start" }}>
                <Heading size="md" fontFamily="Clash-Medium" pb={2}>
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
              <Box w={[tileBoxW, "initial"]} border="1px solid transparent" borderColor="#00C79740" borderRadius="16px">
                <Stack p="5" h={"430px"} minW={claimsStackMinW}>
                  <Heading size="md" fontFamily="Clash-Medium" pb={2} textAlign={{ base: "center", xl: "start" }}>
                    My Claims
                  </Heading>

                  <Flex flexDirection="column" gap={7}>
                    <HStack justifyContent={"space-between"}>
                      <Text color="#929497">Rewards</Text>
                      <Tooltip colorScheme="teal" hasArrow label="The claims contract is currently paused" isDisabled={!claimContractPauseValue}>
                        <Button isDisabled={shouldClaimButtonBeDisabled(0)} colorScheme="teal" variant="outline" w="6.1rem" onClick={onRewardsOpen}>
                          {claimsBalances.claimBalanceValues[0] !== "-1" && claimsBalances.claimBalanceValues[0] !== "-2" ? (
                            <Text color={colorMode === "dark" ? "white" : "black"} textOverflow="ellipsis">
                              {formatNumberToShort(Number(claimsBalances.claimBalanceValues[0]))}
                            </Text>
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
                        <Button isDisabled={shouldClaimButtonBeDisabled(1)} colorScheme="teal" variant="outline" w="6.1rem" onClick={onAirdropsOpen}>
                          {claimsBalances.claimBalanceValues[1] !== "-1" && claimsBalances.claimBalanceValues[1] !== "-2" ? (
                            <Text color={colorMode === "dark" ? "white" : "black"} textOverflow="ellipsis">
                              {formatNumberToShort(Number(claimsBalances.claimBalanceValues[1]))}
                            </Text>
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
                        <Button isDisabled={shouldClaimButtonBeDisabled(3)} colorScheme="teal" variant="outline" w="6.1rem" onClick={onRoyaltiesOpen}>
                          {claimsBalances.claimBalanceValues[3] !== "-1" && claimsBalances.claimBalanceValues[3] !== "-2" ? (
                            <Text color={colorMode === "dark" ? "white" : "black"} textOverflow="ellipsis">
                              {formatNumberToShort(Number(claimsBalances.claimBalanceValues[3]))}
                            </Text>
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
                            <Button isDisabled={shouldClaimButtonBeDisabled(2)} colorScheme="teal" variant="outline" w="6.1rem" onClick={onAllocationsOpen}>
                              {claimsBalances.claimBalanceValues[2] !== "-1" && claimsBalances.claimBalanceValues[2] !== "-2" ? (
                                <Text color={colorMode === "dark" ? "white" : "black"} textOverflow="ellipsis">
                                  {formatNumberToShort(Number(claimsBalances.claimBalanceValues[2]))}
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
        <Box m="auto" pt="10" pb="10" w={"100%"}>
          <VolumesDataNfts />
        </Box>
        <Box m="auto" pt="10" pb="10" w={"100%"}>
          <RecentDataNFTs headingText="Recent Data NFTs" headingSize="lg" />
        </Box>
        <Box m="auto" pt="10" pb="10" w={"100%"}>
          <TrendingData />
        </Box>
        <Box m="auto" pt="10" pb="10" w={"100%"}>
          <Heading size="lg" fontFamily="Clash-Medium" fontWeight="semibold">
            Get Started
          </Heading>

          <ExplainerArticles reduceGap={true} />
        </Box>
        <Box m="auto" pt="10" pb="6rem" w={"100%"}>
          <AppMarketplace setMenuItem={setMenuItem} />
        </Box>
      </Stack>
    </>
  );
}
