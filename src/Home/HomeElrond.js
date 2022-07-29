import React, { useState, useEffect } from "react";
import { Box, Stack } from "@chakra-ui/layout";
import { 
  Button, Badge, Spacer, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter, 
  Text, HStack, Heading,  Wrap, Image, WrapItem, Spinner, useToast, useDisclosure } from "@chakra-ui/react";
import { WarningTwoIcon } from '@chakra-ui/icons';
import moment from "moment";
import { progInfoMeta, uxConfig, debugui } from "libs/util";
import { CHAIN_TOKEN_SYMBOL, CLAIM_TYPES, MENU, SUPPORTED_CHAINS } from "libs/util";
import imgProgGaPa from "img/prog-gaming.jpg";
import imgProgRhc from "img/prog-rhc.png";
import imgProgWfh from "img/prog-wfh.png";
import ClaimModalElrond from "ClaimModel/ClaimModalElrond";
import { useUser } from "store/UserContext";
import { useChainMeta } from "store/ChainMetaContext";
import ChainSupportedComponent from "UtilComps/ChainSupportedComponent";
import { FaucetContract } from "Elrond/faucet";
import { useGetAccountInfo, useGetPendingTransactions } from "@elrondnetwork/dapp-core";

let elrondFaucetContract = null;

export default function({ onRfMount }) {
  const { address: elrondAddress } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();

  const { chainMeta: _chainMeta, setChainMeta } = useChainMeta();
  const { isOpen: isProgressModalOpen, onOpen: onProgressModalOpen, onClose: onProgressModalClose } = useDisclosure();
  const { user: _user } = useUser();

  const [learnMoreProd, setLearnMoreProg] = useState(null);
  const [elrondFaucetTime, setElrondFaucetTime] = useState(0);

  useEffect(() => {
    if (_chainMeta?.networkId && _user?.isElrondAuthenticated) {
      if (SUPPORTED_CHAINS.includes(_chainMeta.networkId)) {
        elrondFaucetContract = new FaucetContract(_chainMeta.networkId);
      }
    }
  }, [_chainMeta]);

  // S: Faucet
  useEffect(() => {
    if (elrondAddress && elrondFaucetContract) {
      elrondFaucetContract.getFaucetTime(elrondAddress).then((res) => {
        setElrondFaucetTime(res);
      });
    }
  }, [elrondAddress, hasPendingTransactions, elrondFaucetContract]);

  const handleOnChainFaucet = async () => {
    if (elrondAddress) {
      elrondFaucetContract.sendActivateFaucetTransaction();
    }
  };
  // E: Faucet

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
    value1: _user.claimBalanceValues?.[0],
    tag2: "Deposited On",
    value2: moment(_user?.claimBalanceDates?.[0]).format(uxConfig.dateStrTm),
    claimType: CLAIM_TYPES.REWARDS,
  };

  const { isOpen: isAirdropsOpen, onOpen: onAirdropsOpen, onClose: onAirdropClose } = useDisclosure();

  const airdropsModalData = {
    isOpen: isAirdropsOpen,
    onClose: () => {
      onAirdropClose();
    },
    title: "Airdrops",
    tag1: "Total Available",
    value1: _user?.claimBalanceValues?.[1],
    tag2: "Deposited On",
    value2: moment(_user?.claimBalanceDates?.[1]).format(uxConfig.dateStrTm),
    claimType: CLAIM_TYPES.AIRDROPS,
  };

  const { isOpen: isAllocationsOpen, onOpen: onAllocationsOpen, onClose: onAllocationsClose } = useDisclosure();

  const allocationsModalData = {
    isOpen: isAllocationsOpen,
    onClose: () => {
      onAllocationsClose();
    },
    title: "Allocations",
    tag1: "Total Available",
    value1: _user?.claimBalanceValues?.[2],
    tag2: "Deposited On",
    value2: moment(_user?.claimBalanceDates?.[2]).format(uxConfig.dateStrTm),
    claimType: CLAIM_TYPES.ALLOCATIONS,
  };
  // E: claims related logic

  debugui(`_chainMeta.networkId ${_chainMeta.networkId}`);

  return (
    <Stack>
      <Heading size="lg">Home</Heading>

      <Wrap>
        <ChainSupportedComponent feature={MENU.FAUCET}>
          <WrapItem maxW="sm" borderWidth="1px" borderRadius="lg">
            <Stack p="5" h="360">
              <Heading size="md">{CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)} Faucet</Heading>
              <Text fontSize="sm" pb={5}>
                Get some free {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)} tokens to try DEX features
              </Text>

              <Spacer />

              <Button colorScheme="teal" variant="outline" onClick={handleOnChainFaucet} disabled={elrondFaucetTime + 120000 > new Date().getTime()}>
                Send me 10 {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)}
              </Button>
            </Stack>
          </WrapItem>
        </ChainSupportedComponent>

        <ChainSupportedComponent feature={MENU.CLAIMS}>
          <WrapItem maxW="sm" borderWidth="1px" borderRadius="lg">
            <Stack p="5" h="360">
              <Heading size="md">My Claims</Heading>
              <Spacer />
              <HStack spacing={50}>
                <Text>Rewards</Text>
                <Button disabled={_user?.claimBalanceValues?.[0] === "-1" || _user?.claimBalanceValues?.[0] === "-2" || !_user?.claimBalanceValues?.[0] > 0} colorScheme="teal" variant="outline" w="70px" onClick={onRewardsOpen}>
                  {(_user?.claimBalanceValues?.[0] !== "-1" && _user?.claimBalanceValues?.[0] !== "-2") ? 
                      _user?.claimBalanceValues?.[0] : _user?.claimBalanceValues?.[0] !== "-2" ? 
                        <Spinner size="xs" /> : <WarningTwoIcon />
                  }
                </Button>
                <ClaimModalElrond {...rewardsModalData} />
              </HStack>
              <Spacer />
              <HStack spacing={50}>
                <Text>Airdrops</Text>
                <Button disabled={_user?.claimBalanceValues?.[1] === "-1" || _user?.claimBalanceValues?.[1] === "-2" || !_user?.claimBalanceValues?.[1] > 0} colorScheme="teal" variant="outline" w="70px" onClick={onAirdropsOpen}>
                  {(_user?.claimBalanceValues?.[1] !== "-1" && _user?.claimBalanceValues?.[1] !== "-2") ? 
                      _user?.claimBalanceValues?.[1] : _user?.claimBalanceValues?.[1] !== "-2" ? 
                        <Spinner size="xs" /> : <WarningTwoIcon />
                  }
                </Button>
                <ClaimModalElrond {...airdropsModalData} />
              </HStack>
              <Spacer />
              <HStack spacing={30}>
                <Text>Allocations</Text>
                <Button disabled={_user?.claimBalanceValues?.[2] === "-1" || _user?.claimBalanceValues?.[2] === "-2" || !_user?.claimBalanceValues?.[2] > 0} colorScheme="teal" variant="outline" w="70px" onClick={onAllocationsOpen}>
                  {(_user?.claimBalanceValues?.[2] !== "-1" && _user?.claimBalanceValues?.[2] !== "-2") ? 
                      _user?.claimBalanceValues?.[2] : _user?.claimBalanceValues?.[2] !== "-2" ? 
                        <Spinner size="xs" /> : <WarningTwoIcon />
                  }
                </Button>
                <ClaimModalElrond {...allocationsModalData} />
              </HStack>

              <Spacer />
            </Stack>
          </WrapItem>
        </ChainSupportedComponent>
      </Wrap>

      <Stack p="5" h="360">
        <Heading size="md">App Marketplace</Heading>
        <Text fontSize="md">Join a community built app and earn {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)} when you trade your data</Text>
        <Wrap shouldWrapChildren={true} wrap="wrap" spacing={5}>
          <Box maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
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

          <Box maxW="container.sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
            <Image src={imgProgGaPa} />

            <Box p="3">
              <Box d="flex" alignItems="baseline">
                <Box mt="1" mr="1" fontWeight="semibold" as="h4" lineHeight="tight" isTruncated>
                  Gamer Passport
                </Box>
                <Badge borderRadius="full" px="2" colorScheme="blue">
                  {" "}
                  Coming Soon
                </Badge>
              </Box>
              <Button size="sm" mt="3" mr="3" colorScheme="teal" variant="outline" onClick={() => handleLearnMoreProg("gdc")}>
                Learn More
              </Button>
              <Button size="sm" disabled={true} mt="3" colorScheme="teal" onClick={() => window.open("")}>
                Join Now
              </Button>
            </Box>
          </Box>

          <Box maxW="container.sm" borderWidth="1px" borderRadius="lg" overflow="hidden" w="300px">
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
        <Modal size="xl" isOpen={isProgressModalOpen} onClose={onProgressModalClose} closeOnEsc={false} closeOnOverlayClick={false}>
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
              <Button size="sm" colorScheme="teal" onClick={() => window.open(`${progInfoMeta[learnMoreProd].url}`)}>
                Join Now
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Stack>
  );
}
