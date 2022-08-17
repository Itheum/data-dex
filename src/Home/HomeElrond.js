import React, { useState, useEffect } from 'react';
import { Box, Stack } from '@chakra-ui/layout';
import { Button, Badge, Spacer, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter, Text, HStack, Heading, Wrap, Image, WrapItem, Spinner, useToast, useDisclosure, useBreakpointValue } from '@chakra-ui/react';
import { WarningTwoIcon } from '@chakra-ui/icons';
import moment from 'moment';
import { progInfoMeta, uxConfig, debugui } from 'libs/util';
import { CHAIN_TOKEN_SYMBOL, CLAIM_TYPES, MENU, SUPPORTED_CHAINS } from 'libs/util';
import imgProgGaPa from 'img/prog-gaming.jpg';
import imgProgRhc from 'img/prog-rhc.png';
import imgProgWfh from 'img/prog-wfh.png';
import myNFMe from 'img/my-nfme.png';
import ClaimModalElrond from 'ClaimModel/ClaimModalElrond';
import { useUser } from 'store/UserContext';
import { useChainMeta } from 'store/ChainMetaContext';
import ChainSupportedComponent from 'UtilComps/ChainSupportedComponent';
import { FaucetContract } from 'Elrond/faucet';
import { ClaimsContract } from 'Elrond/claims';
import { useGetAccountInfo, useGetPendingTransactions, useGetLoginInfo } from '@elrondnetwork/dapp-core';
import { TokenPayment } from '@elrondnetwork/erdjs/out';

let elrondFaucetContract = null;
let elrondClaimsContract = null;

export default function({ onRfMount }) {
  const toast = useToast();
  const { isOpen: isProgressModalOpen, onOpen: onProgressModalOpen, onClose: onProgressModalClose } = useDisclosure();
  const { chainMeta: _chainMeta } = useChainMeta();
  const { user: _user } = useUser();
  const { address: elrondAddress } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { isLoggedIn: isElrondLoggedIn } = useGetLoginInfo();

  const [learnMoreProd, setLearnMoreProg] = useState(null);
  const [isOnChainInteractionDisabled, setIsOnChainInteractionDisabled] = useState(false);
  const [isElrondFaucetDisabled, setIsElrondFaucetDisabled] = useState(false);
  const [claimsBalances, setClaimsBalances] = useState({
    claimBalanceValues: ['-1', '-1', '-1'], // -1 is loading, -2 is error
    claimBalanceDates: [0, 0, 0]
  });

  useEffect(() => {
    if (_chainMeta?.networkId && _user?.isElrondAuthenticated) {
      if (SUPPORTED_CHAINS.includes(_chainMeta.networkId)) {
        try {
          elrondFaucetContract = new FaucetContract(_chainMeta.networkId);
        } catch (e) {
          console.log(e);
        }
        elrondClaimsContract = new ClaimsContract(_chainMeta.networkId);
      }
    }
  }, [_chainMeta]);

  // S: Faucet
  useEffect(() => {
    // hasPendingTransactions will fire with false during init and then move from true to false each time a TX is done...
    // ... so if it's "false" we need check and prevent faucet from being used too often
    if (elrondAddress && elrondFaucetContract && !hasPendingTransactions) {
      elrondFaucetContract.getFaucetTime(elrondAddress).then((lastUsedTime) => {
        const timeNow = new Date().getTime();

        if (lastUsedTime + 120000 > timeNow) {
          setIsElrondFaucetDisabled(true);

          // after 2 min wait we reenable the button on the UI automatically
          setTimeout(() => {
            setIsElrondFaucetDisabled(false);
          }, lastUsedTime + 120000 + 1000 - timeNow);
        } else {
          setIsElrondFaucetDisabled(false);
        }
      });
    }
  }, [elrondAddress, hasPendingTransactions, elrondFaucetContract]);

  const handleOnChainFaucet = async () => {
    if (elrondAddress && elrondFaucetContract) {
      elrondFaucetContract.sendActivateFaucetTransaction();
    }
  };
  // E: Faucet

  // S: Claims
  useEffect(() => {
    // this will trigger during component load/page load, so let's get the latest claims balances
    if (elrondClaimsContract && !hasPendingTransactions) {
      elrondClaimsBalancesUpdate();
    }
  }, [elrondAddress, hasPendingTransactions, elrondClaimsContract]);

  // utility func to get claims balances from chain
  const elrondClaimsBalancesUpdate = async () => {
    if (elrondAddress && isElrondLoggedIn) {
      if (SUPPORTED_CHAINS.includes(_chainMeta.networkId)) {
        let claims = [
          { amount: 0, date: 0 },
          { amount: 0, date: 0 },
          { amount: 0, date: 0 },
        ];

        const claimBalanceValues = [];
        const claimBalanceDates = [];

        claims = await elrondClaimsContract.getClaims(elrondAddress);

        if (!claims.error) {
          claims.forEach((claim) => {
            claimBalanceValues.push(claim.amount.div(1e18).toNumber());
            claimBalanceDates.push(claim.date);
          });
        } else if (claims.error) {
          claimBalanceValues.push('-2', '-2', '-2'); // errors

          if (!toast.isActive('er2')) {
            toast({
              id: 'er2',
              title: 'ER2: Could not get your claims information from the elrond blockchain.',
              status: 'error',
              isClosable: true,
              duration: null
            });
          }
        }

        setClaimsBalances({
          claimBalanceValues,
          claimBalanceDates
        });
      }
    }
  };
  // E: Claims

  useEffect(() => {
    if (hasPendingTransactions) {
      // block user trying to do other claims or on-chain tx until current one completes
      setIsOnChainInteractionDisabled(true);

      // user just triggered a faucet tx, so we prevent them from clicking ui again until tx is complete
      setIsElrondFaucetDisabled(true);
    } else {
      elrondClaimsBalancesUpdate(); // get latest claims balances from on-chain as well

      setIsOnChainInteractionDisabled(false); // unlock, and let them do other on-chain tx work
    }
  }, [hasPendingTransactions]);

  const handleLearnMoreProg = (progCode) => {
    setLearnMoreProg(progCode);
    onProgressModalOpen();
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
    elrondClaimsContract
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
    elrondClaimsContract
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
    elrondClaimsContract
  };
  // E: claims related logic

  debugui(`_chainMeta.networkId ${_chainMeta.networkId}`);

  const modelSize = useBreakpointValue({ base: 'xs', md: 'xl' });

  return (
    <Stack>
      <Heading size="lg">Home</Heading>

      <Stack p="5">
        <Wrap shouldWrapChildren={true} wrap="wrap" spacing={5}>
          <ChainSupportedComponent feature={MENU.FAUCET}>
            <Box maxW="container.sm" minW="300px" borderWidth="1px" borderRadius="lg" >
              <Stack p="5" h="360">
                <Heading size="md">{CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)} Faucet</Heading>
                <Text fontSize="sm" pb={5}>
                  Get some free {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)} tokens to try DEX features
                </Text>

                <Spacer />

                <Button colorScheme="teal" variant="outline" onClick={handleOnChainFaucet} disabled={isElrondFaucetDisabled}>
                  Send me 10 {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)}
                </Button>
              </Stack>
            </Box>
          </ChainSupportedComponent>

          <Box maxW="container.sm" borderWidth="1px" borderRadius="lg" minW="300px">
            <Stack p="5" h="360" bgImage={myNFMe} bgSize="cover" bgPosition="top" borderRadius="lg">
              <Heading size="md" align="center">NFMe ID Avatar</Heading>                  
              <Spacer />
              <Button disabled colorScheme="teal">Mint & Own NFT</Button>
              <Text fontSize="sm" align="center">Coming Soon</Text>
            </Stack>
          </Box>

          <ChainSupportedComponent feature={MENU.CLAIMS}>
            <Box maxW="container.sm" borderWidth="1px" borderRadius="lg" minW={["300px", "initial"]}>
              <Stack p="5" h="360">
                <Heading size="md">My Claims</Heading>

                <Spacer />
                <HStack spacing={50}>
                  <Text>Rewards</Text>
                  <Button disabled={isOnChainInteractionDisabled || claimsBalances.claimBalanceValues[0] === "-1" || claimsBalances.claimBalanceValues[0] === "-2" || !claimsBalances.claimBalanceValues[0] > 0} colorScheme="teal" variant="outline" w="70px" onClick={onRewardsOpen}>
                    {(claimsBalances.claimBalanceValues[0] !== "-1" && claimsBalances.claimBalanceValues[0] !== "-2") ? 
                        claimsBalances.claimBalanceValues[0] : claimsBalances.claimBalanceValues[0] !== "-2" ? 
                          <Spinner size="xs" /> : <WarningTwoIcon />
                    }
                  </Button>
                  <ClaimModalElrond {...rewardsModalData} />
                </HStack>

                <Spacer />
                <HStack spacing={50}>
                  <Text>Airdrops</Text>
                  <Button disabled={isOnChainInteractionDisabled || claimsBalances.claimBalanceValues[1] === "-1" || claimsBalances.claimBalanceValues[1] === "-2" || !claimsBalances.claimBalanceValues[1] > 0} colorScheme="teal" variant="outline" w="70px" onClick={onAirdropsOpen}>
                    {(claimsBalances.claimBalanceValues[1] !== "-1" && claimsBalances.claimBalanceValues[1] !== "-2") ? 
                        claimsBalances.claimBalanceValues[1] : claimsBalances.claimBalanceValues[1] !== "-2" ? 
                          <Spinner size="xs" /> : <WarningTwoIcon />
                    }
                  </Button>
                  <ClaimModalElrond {...airdropsModalData} />
                </HStack>
                <Spacer />

                {claimsBalances.claimBalanceValues[2] > 0 && 
                  <Box h="40px">
                    <HStack spacing={30}>
                      <Text>Allocations</Text>
                      <Button disabled={isOnChainInteractionDisabled || claimsBalances.claimBalanceValues[2] === "-1" || claimsBalances.claimBalanceValues[2] === "-2" || !claimsBalances.claimBalanceValues[2] > 0} colorScheme="teal" variant="outline" w="70px" onClick={onAllocationsOpen}>
                        {(claimsBalances.claimBalanceValues[2] !== "-1" && claimsBalances.claimBalanceValues[2] !== "-2") ? 
                            claimsBalances.claimBalanceValues[2] : claimsBalances.claimBalanceValues[2] !== "-2" ? 
                              <Spinner size="xs" /> : <WarningTwoIcon />
                        }
                      </Button>
                      <ClaimModalElrond {...allocationsModalData} />
                    </HStack>
                  </Box>
                || <Box h="40px" />}

                <Spacer />
              </Stack>
            </Box>
          </ChainSupportedComponent>
        </Wrap>
      </Stack>

      <Stack p="5" h="360">
        <Heading size="md">App Marketplace</Heading>
        <Text fontSize="md">Join a community built app and earn {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)} when you trade your data</Text>
        <Wrap shouldWrapChildren={true} wrap="wrap" spacing={5}>
          <Box maxW="container.sm" borderWidth="1px" borderRadius="lg" overflow="hidden" width="300px">
            <Image src={imgProgGaPa} />

            <Box p="3">
              <Box d="flex" alignItems="baseline">
                <Box mt="1" mr="1" fontWeight="semibold" as="h4" lineHeight="tight" isTruncated>
                  Gamer Passport
                </Box>
                <Badge borderRadius="full" px="2" colorScheme="teal">
                  {" "}
                  Live
                </Badge>
              </Box>
              <Button size="sm" mt="3" mr="3" colorScheme="teal" variant="outline" onClick={() => handleLearnMoreProg("gdc")}>
                Learn More
              </Button>
              <Button size="sm" mt="3" colorScheme="teal" onClick={() => window.open("https://itheum.medium.com/do-you-want-to-be-part-of-the-gamer-passport-alpha-release-4ae98b93e7ae")}>
                Join Now
              </Button>
            </Box>
          </Box>

          <Box maxW="container.sm" borderWidth="1px" borderRadius="lg" overflow="hidden" width="300px">
            <Image src={imgProgRhc} />

            <Box p="3">
              <Box d="flex" alignItems="baseline">
                <Box mt="1" mr="1" fontWeight="semibold" as="h4" lineHeight="tight" isTruncated>
                  Red Heart Challenge
                </Box>
                <Badge borderRadius="full" px="2" colorScheme="teal">
                  {" "}
                  Live
                </Badge>
              </Box>
              <Button size="sm" mt="3" mr="3" colorScheme="teal" variant="outline" onClick={() => handleLearnMoreProg("rhc")}>
                Learn More
              </Button>
              <Button size="sm" mt="3" colorScheme="teal" onClick={() => window.open(`https://itheum.com/redheartchallenge`)}>
                Join Now
              </Button>
            </Box>
          </Box>

          <Box maxW="container.sm" borderWidth="1px" borderRadius="lg" overflow="hidden" width="300px">
            <Image src={imgProgWfh} />

            <Box p="3">
              <Box d="flex" alignItems="baseline">
                <Box mt="1" mr="1" fontWeight="semibold" as="h4" lineHeight="tight" isTruncated>
                  Wearables Fitness and Activity
                </Box>
                <Badge borderRadius="full" px="2" colorScheme="blue">
                  {" "}
                  Coming Soon
                </Badge>
              </Box>
              <Button size="sm" mt="3" mr="3" colorScheme="teal" variant="outline" onClick={() => handleLearnMoreProg("wfa")}>
                Learn More
              </Button>
              <Button size="sm" disabled={true} mt="3" colorScheme="teal" onClick={() => window.open("")}>
                Join Now
              </Button>
            </Box>
          </Box>
        </Wrap>
      </Stack>

      {learnMoreProd && (
        <Modal size={modelSize} isOpen={isProgressModalOpen} onClose={onProgressModalClose} closeOnEsc={false} closeOnOverlayClick={false}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{progInfoMeta[learnMoreProd].name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Stack spacing="5">
                <Text>{progInfoMeta[learnMoreProd].desc}</Text>
                <Stack>
                  <Text color="gray" as="b">
                    Delivered Via:
                  </Text>{" "}
                  <p>{progInfoMeta[learnMoreProd].medium}</p>
                </Stack>
                <Stack>
                  <Text color="gray" as="b">
                    Data Collected:
                  </Text>{" "}
                  <p>{progInfoMeta[learnMoreProd].data}</p>
                </Stack>
                <Stack>
                  <Text color="gray" as="b">
                    App Outcome:
                  </Text>{" "}
                  <p>{progInfoMeta[learnMoreProd].outcome}</p>
                </Stack>
                <Stack>
                  <Text color="gray" as="b">
                    Target Buyers:
                  </Text>{" "}
                  <p>{progInfoMeta[learnMoreProd].targetBuyer}</p>
                </Stack>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button size="sm" mr={3} colorScheme="teal" variant="outline" onClick={onProgressModalClose}>
                Close
              </Button>
              <Button disabled={!progInfoMeta[learnMoreProd].canJoin} size="sm" colorScheme="teal" onClick={() => window.open(`${progInfoMeta[learnMoreProd].url}`)}>
                Join Now
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Stack>
  );
}
