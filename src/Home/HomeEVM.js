import React, { useState, useEffect } from 'react';
import { useMoralis, useMoralisCloudFunction } from 'react-moralis';
import { Box, Stack } from '@chakra-ui/layout';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { 
  Button, Link, Progress, Badge, Alert, AlertIcon, AlertTitle, AlertDescription, 
  Spacer, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, 
  ModalFooter, Text, HStack, Heading, CloseButton, Wrap, Image, 
  WrapItem, Spinner, useToast, useDisclosure, useBreakpointValue } from '@chakra-ui/react';
import moment from 'moment';
import ShortAddress from 'UtilComps/ShortAddress';
import { progInfoMeta, uxConfig, sleep, noChainSupport } from 'libs/util';
import { CHAIN_TX_VIEWER, CHAIN_TOKEN_SYMBOL, CLAIM_TYPES, MENU, SUPPORTED_CHAINS } from 'libs/util';
import { ABIS } from 'EVM/ABIs';
import imgProgGaPa from 'img/prog-gaming.jpg';
import imgProgRhc from 'img/prog-rhc.png';
import imgProgWfh from 'img/prog-wfh.png';
import myNFMe from 'img/my-nfme.png';
import ClaimModalEVM from 'ClaimModel/ClaimModalEVM';
import { useUser } from 'store/UserContext';
import { useChainMeta } from 'store/ChainMetaContext';
import ChainSupportedInput from 'UtilComps/ChainSupportedInput';
import { useNavigate } from 'react-router-dom';
import ChainSupportedComponent from 'UtilComps/ChainSupportedComponent';

export default function({ onRfMount, setMenuItem, onRefreshTokenBalance, onItheumAccount, itheumAccount }) {
  const toast = useToast();
  const { isOpen: isProgressModalOpen, onOpen: onProgressModalOpen, onClose: onProgressModalClose } = useDisclosure();
  const navigate = useNavigate();
  const { chainMeta: _chainMeta } = useChainMeta();
  const { user: _user } = useUser();
  const { user, isWeb3Enabled, Moralis: { web3Library: ethers } } = useMoralis();
  const { web3: web3Provider } = useMoralis();
  const { error: errCfTestData, isLoading: loadingCfTestData, fetch: doCfTestData, data: dataCfTestData } = useMoralisCloudFunction('loadTestData', {}, { autoFetch: false });

  const [faucetWorking, setFaucetWorking] = useState(false);
  const [learnMoreProd, setLearnMoreProg] = useState(null);
  const [txConfirmationFaucet, setTxConfirmationFaucet] = useState(0);
  const [txHashFaucet, setTxHashFaucet] = useState(null);
  const [txErrorFaucet, setTxErrorFaucet] = useState(null);
  const [claimsBalances, setClaimsBalances] = useState({
    claimBalanceValues: ['-1', '-1', '-1'], // -1 is loading, -2 is error
    claimBalanceDates: [0, 0, 0]
  });

  // test data
  useEffect(() => {
    if (dataCfTestData && dataCfTestData.length > 0) {
      const response = JSON.parse(decodeURIComponent(atob(dataCfTestData)));

      toast({
        title: 'Congrats! an itheum test account has been linked',
        description: 'You can now advertise your data on the Data DEX',
        status: 'success',
        duration: 6000,
        isClosable: true,
      });

      onItheumAccount(response);
    }
  }, [dataCfTestData]);

  // S: Faucet
  useEffect(() => {
    if (txErrorFaucet) {
      setFaucetWorking(false);
    } else {
      if (txHashFaucet && txConfirmationFaucet === uxConfig.txConfirmationsNeededLrg) {
        toast({
          title: `Congrats! the faucet has sent you some ${CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)}`,
          status: 'success',
          duration: 6000,
          isClosable: true,
        });

        resetFauceState();
        onRefreshTokenBalance();
      }
    }
  }, [txConfirmationFaucet, txHashFaucet, txErrorFaucet]);

  const web3_tokenFaucet = async () => {
    setFaucetWorking(true);

    const web3Signer = web3Provider.getSigner();
    const tokenContract = new ethers.Contract(_chainMeta.contracts.itheumToken, ABIS.token, web3Signer);

    const decimals = 18;
    const tokenInPrecision = ethers.utils.parseUnits('50.0', decimals).toHexString();

    try {
      const txResponse = await tokenContract.faucet(user.get('ethAddress'), tokenInPrecision);

      // show a nice loading animation to user
      setTxHashFaucet(txResponse.hash);

      await sleep(2);
      setTxConfirmationFaucet(0.5);

      // wait for 1 confirmation from ethers
      const txReceipt = await txResponse.wait();
      setTxConfirmationFaucet(1);
      await sleep(2);

      if (txReceipt.status) {
        setTxConfirmationFaucet(2);
      } else {
        const txErr = new Error('Token Contract Error on method faucet');
        console.error(txErr);

        setTxErrorFaucet(txErr);
      }
    } catch (e) {
      setTxErrorFaucet(e);
    }
  };

  function resetFauceState() {
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

  // S: Claims
  useEffect(() => {
    // this will trigger during component load/page load, so let's get the latest claims balances
    // ... we need to listed to _chainMeta event as well as it may get set after moralis responds
    if (_chainMeta?.networkId && user && isWeb3Enabled) {
      if (!noChainSupport(MENU.CLAIMS, _chainMeta.networkId)) { // only load this if chain support CLAIMS
        web3_evmClaimsBalancesUpdate();
      }
    }
  }, [user, isWeb3Enabled, _chainMeta]);

  const web3_evmClaimsBalancesUpdate = async () => {
    if (SUPPORTED_CHAINS.includes(_chainMeta.networkId)) {
      const walletAddress = user.get('ethAddress');
      const contract = new ethers.Contract(_chainMeta.contracts.claims, ABIS.claims, web3Provider);

      const keys = Object.keys(CLAIM_TYPES);

      const values = keys.map((el) => {
        return CLAIM_TYPES[el];
      });

      // queue all smart contract calls
      const hexDataPromiseArray = values.map(async (el) => {
        let a = await contract.deposits(walletAddress, el);
        return a;
      });

      try {
        const claimBalanceResponse = (await Promise.all(hexDataPromiseArray)).map((el) => {
          const date = new Date(parseInt(el.lastDeposited._hex.toString(), 16) * 1000);
          const value = parseInt(el.amount._hex.toString(), 16) / 10 ** 18;
          return { values: value, dates: date };
        });

        const valuesArray = claimBalanceResponse.map((el) => {
          return el['values'];
        });

        const datesArray = claimBalanceResponse.map((el) => {
          return el['dates'];
        });

        setClaimsBalances({
          claimBalanceValues: valuesArray,
          claimBalanceDates: datesArray
        });
      } catch (e) {
        console.error(e);
        toast({
          id: 'er3',
          title: 'ER3: Could not get your claims information from the EVM blockchain.',
          status: 'error',
          isClosable: true,
          duration: null
        });
      }
    }
  };
  // E: Claims

  const handleLearnMoreProg = (progCode) => {
    setLearnMoreProg(progCode);
    onProgressModalOpen();
  };

  // S: claims related logic
  const { isOpen: isRewardsOpen, onOpen: onRewardsOpen, onClose: onRewardsClose } = useDisclosure();

  const rewardsModalData = {
    isOpen: isRewardsOpen,
    onClose: (refreshTokenBalances) => {
      onRewardsClose();
      if (refreshTokenBalances) {
        onRefreshTokenBalance();
      }
    },
    title: 'Rewards',
    tag1: 'Total Available',
    value1: claimsBalances.claimBalanceValues[0],
    tag2: 'Last Deposited on',
    value2: moment(claimsBalances.claimBalanceDates[0]).format(uxConfig.dateStrTm),
    claimType: CLAIM_TYPES.REWARDS,
    onRefreshClaimsBalance: web3_evmClaimsBalancesUpdate
  };

  const { isOpen: isAirdropsOpen, onOpen: onAirdropsOpen, onClose: onAirdropClose } = useDisclosure();

  const airdropsModalData = {
    isOpen: isAirdropsOpen,
    onClose: (refreshTokenBalances) => {
      onAirdropClose();
      if (refreshTokenBalances) {
        onRefreshTokenBalance();
      }
    },
    title: 'Airdrops',
    tag1: 'Total Available',
    value1: claimsBalances.claimBalanceValues[1],
    tag2: 'Last Deposited on',
    value2: moment(claimsBalances.claimBalanceDates[1]).format(uxConfig.dateStrTm),
    claimType: CLAIM_TYPES.AIRDROPS,
    onRefreshClaimsBalance: web3_evmClaimsBalancesUpdate
  };

  const { isOpen: isAllocationsOpen, onOpen: onAllocationsOpen, onClose: onAllocationsClose } = useDisclosure();

  const allocationsModalData = {
    isOpen: isAllocationsOpen,
    onClose: (refreshTokenBalances) => {
      onAllocationsClose();
      if (refreshTokenBalances) {
        onRefreshTokenBalance();
      }
    },
    title: 'Allocations',
    tag1: 'Total Available',
    value1: claimsBalances.claimBalanceValues[2],
    tag2: 'Last Deposited on',
    value2: moment(claimsBalances.claimBalanceDates[2]).format(uxConfig.dateStrTm),
    claimType: CLAIM_TYPES.ALLOCATIONS,
    onRefreshClaimsBalance: web3_evmClaimsBalancesUpdate
  };
  // E: claims related logic

  const modelSize = useBreakpointValue({ base: 'xs', md: 'xl' });

  return (
    <Stack>
      <Heading size="lg">Home</Heading>

      <Wrap>
        <WrapItem maxW="sm" borderWidth="1px" borderRadius="lg">
          <Stack p="5" h="360">
            {!itheumAccount && <Heading size="md">Your Linked Itheum Account</Heading>}
            {!itheumAccount && (
              <Alert>
                <Stack>
                  <AlertTitle fontSize="md">
                    <AlertIcon mb={2} /> Sorry! You don't seem to have a{' '}
                    <Link href="https://itheum.com" isExternal>
                      itheum.com
                    </Link>{' '}
                    Data CAT account
                  </AlertTitle>
                  <AlertDescription fontSize="md">But don't fret; you can still test the Data DEX by temporarily linking to a test data account below.</AlertDescription>
                </Stack>
              </Alert>
            )}

            {itheumAccount && (
              <Stack>
                <Text fontSize="xl">Welcome {`${itheumAccount.firstName} ${itheumAccount.lastName}`}</Text>
                <Text fontSize="sm">You have data available to trade from the following programs you are participating in... </Text>
                {itheumAccount.programsAllocation.map((item) => (
                  <Stack direction="row" key={item.program}>
                    <Badge borderRadius="full" px="2" colorScheme="teal">
                      {itheumAccount._lookups.programs[item.program].programName}
                    </Badge>
                  </Stack>
                ))}
              </Stack>
            )}

            <Spacer />

            {!itheumAccount && (
              <Button isLoading={loadingCfTestData} colorScheme="teal" variant="outline" onClick={doCfTestData}>
                Load Test Data
              </Button>
            )}

            {itheumAccount && (
              <Button
                colorScheme="teal"
                variant="outline"
                onClick={() => {
                  setMenuItem(2);
                  navigate('/selldata');
                }}
              >
                Trade My Data
              </Button>
            )}
          </Stack>
        </WrapItem>

        <ChainSupportedComponent feature={MENU.FAUCET}>
          <WrapItem maxW="sm" borderWidth="1px" borderRadius="lg">
            <Stack p="5" h="360">
              <Heading size="md">{CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)} Faucet</Heading>
              <Text fontSize="sm" pb={5}>
                Get some free {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)} tokens to try DEX features
              </Text>

              {txHashFaucet && (
                <Stack>
                  <Progress colorScheme="teal" size="sm" value={(100 / uxConfig.txConfirmationsNeededLrg) * txConfirmationFaucet} />

                  <HStack>
                    <Text fontSize="sm">Transaction </Text>
                    <ShortAddress address={txHashFaucet} />
                    <Link href={`${CHAIN_TX_VIEWER[_chainMeta.networkId]}${txHashFaucet}`} isExternal>
                      {' '}
                      <ExternalLinkIcon mx="2px" />
                    </Link>
                  </HStack>
                </Stack>
              )}

              {txErrorFaucet && (
                <Alert status="error">
                  <AlertIcon />
                  {txErrorFaucet.message && <AlertTitle fontSize="md">{txErrorFaucet.message}</AlertTitle>}
                  <CloseButton position="absolute" right="8px" top="8px" onClick={resetFauceState} />
                </Alert>
              )}

              <Spacer />

              <ChainSupportedInput feature={MENU.FAUCET}>
                <Button isLoading={faucetWorking} colorScheme="teal" variant="outline" onClick={handleOnChainFaucet}>
                  Send me 50 {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)}
                </Button>
              </ChainSupportedInput>
            </Stack>
          </WrapItem>
        </ChainSupportedComponent>

        <WrapItem maxW="sm" borderWidth="1px" borderRadius="lg">
          <Stack p="5" h="360" bgImage={myNFMe} bgSize="cover" bgPosition="top" borderRadius="lg">
            <Heading size="md" align="center">NFMe ID Avatar</Heading>                  
            <Spacer />
            <Button disabled colorScheme="teal">Mint & Own NFT</Button>
            <Text fontSize="sm" align="center">Coming Soon</Text>
          </Stack>
        </WrapItem>

        <ChainSupportedComponent feature={MENU.CLAIMS}>
          <WrapItem maxW="sm" borderWidth="1px" borderRadius="lg">
            <Stack p="5" h="360">
              <Heading size="md">My Claims</Heading>

              <Spacer />
              <HStack spacing={50}>
                <Text>Rewards</Text>
                <Button disabled={claimsBalances.claimBalanceValues[0] === '-1' || !claimsBalances.claimBalanceValues[0] > 0} colorScheme="teal" variant="outline" w="70px" onClick={onRewardsOpen}>
                  {claimsBalances.claimBalanceValues[0] !== '-1' ? claimsBalances.claimBalanceValues[0] : <Spinner size="xs" />}
                </Button>
                <ClaimModalEVM {...rewardsModalData} />
              </HStack>

              <Spacer />
              <HStack spacing={50}>
                <Text>Airdrops</Text>
                <Button disabled={claimsBalances.claimBalanceValues[1] === '-1' || !claimsBalances.claimBalanceValues[1] > 0} colorScheme="teal" variant="outline" w="70px" onClick={onAirdropsOpen}>
                  {claimsBalances.claimBalanceValues[1] !== '-1' ? claimsBalances.claimBalanceValues[1] : <Spinner size="xs" />}
                </Button>
                <ClaimModalEVM {...airdropsModalData} />
              </HStack>
              <Spacer />

              {claimsBalances.claimBalanceValues[2] > 0 && 
                <Box h="40px">
                  <HStack spacing={30}>
                <Text>Allocations</Text>
                <Button disabled={claimsBalances.claimBalanceValues[2] === '-1' || !claimsBalances.claimBalanceValues[2] > 0} colorScheme="teal" variant="outline" w="70px" onClick={onAllocationsOpen}>
                  {claimsBalances.claimBalanceValues[2] !== '-1' ? claimsBalances.claimBalanceValues[2] : <Spinner size="xs" />}
                </Button>
                <ClaimModalEVM {...allocationsModalData} />
                  </HStack>
                </Box> 
              || <Box h="40px" />}

              <Spacer />
            </Stack>
          </WrapItem>
        </ChainSupportedComponent>
      </Wrap>

      <Stack p="5" h="360">
        <Heading size="md">App Marketplace</Heading>
        <Text fontSize="md">Join a community built app and earn {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)} when you trade your data</Text>
        <Wrap shouldWrapChildren={true} wrap="wrap" spacing={5}>
          <Box maxW="container.sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
            <Image src={imgProgGaPa} />

            <Box p="3">
              <Box d="flex" alignItems="baseline">
                <Box mt="1" mr="1" fontWeight="semibold" as="h4" lineHeight="tight" isTruncated>
                  Gamer Passport
                </Box>
                <Badge borderRadius="full" px="2" colorScheme="teal">
                  {' '}
                  Live
                </Badge>
              </Box>
              <Button size="sm" mt="3" mr="3" colorScheme="teal" variant="outline" onClick={() => handleLearnMoreProg('gdc')}>
                Learn More
              </Button>
              <Button size="sm" mt="3" colorScheme="teal" onClick={() => window.open('https://itheum.medium.com/do-you-want-to-be-part-of-the-gamer-passport-alpha-release-4ae98b93e7ae')}>
                Join Now
              </Button>
            </Box>
          </Box>
          
          <Box maxW="container.sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
            <Image src={imgProgRhc} />

            <Box p="3">
              <Box d="flex" alignItems="baseline">
                <Box mt="1" mr="1" fontWeight="semibold" as="h4" lineHeight="tight" isTruncated>
                  Red Heart Challenge
                </Box>
                <Badge borderRadius="full" px="2" colorScheme="teal">
                  {' '}
                  Live
                </Badge>
              </Box>
              <Button size="sm" mt="3" mr="3" colorScheme="teal" variant="outline" onClick={() => handleLearnMoreProg('rhc')}>
                Learn More
              </Button>
              <Button size="sm" mt="3" colorScheme="teal" onClick={() => window.open(`https://itheum.com/redheartchallenge?dexUserId=${user.id}`)}>
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
                  {' '}
                  Coming Soon
                </Badge>
              </Box>
              <Button size="sm" mt="3" mr="3" colorScheme="teal" variant="outline" onClick={() => handleLearnMoreProg('wfa')}>
                Learn More
              </Button>
              <Button size="sm" disabled={true} mt="3" colorScheme="teal" onClick={() => window.open('')}>
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
                  </Text>{' '}
                  <p>{progInfoMeta[learnMoreProd].medium}</p>
                </Stack>
                <Stack>
                  <Text color="gray" as="b">
                    Data Collected:
                  </Text>{' '}
                  <p>{progInfoMeta[learnMoreProd].data}</p>
                </Stack>
                <Stack>
                  <Text color="gray" as="b">
                    App Outcome:
                  </Text>{' '}
                  <p>{progInfoMeta[learnMoreProd].outcome}</p>
                </Stack>
                <Stack>
                  <Text color="gray" as="b">
                    Target Buyers:
                  </Text>{' '}
                  <p>{progInfoMeta[learnMoreProd].targetBuyer}</p>
                </Stack>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button size="sm" mr={3} colorScheme="teal" variant="outline" onClick={onProgressModalClose}>
                Close
              </Button>
              <Button disabled={true} size="sm" colorScheme="teal" onClick={() => window.open(`${progInfoMeta[learnMoreProd].url}?dexUserId=${user.id}`)}>
                Join Now
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Stack>
  );
}
