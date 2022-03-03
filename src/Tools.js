import React, { useContext, useState, useEffect } from 'react';
import { useMoralis, useMoralisCloudFunction } from 'react-moralis';
import { Box, Stack } from '@chakra-ui/layout';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Button, Link, Progress, Badge,
  Alert, AlertIcon, AlertTitle, AlertDescription, Spacer,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter,
  Text, HStack, Heading, CloseButton, Wrap, Image, 
  useToast, useDisclosure
} from '@chakra-ui/react';
import ShortAddress from './UtilComps/ShortAddress';
import { progInfoMeta, config, sleep } from './libs/util';
import { ABIS, CHAIN_TX_VIEWER, CHAIN_TOKEN_SYMBOL } from './libs/util';
import { ChainMetaContext } from './libs/contexts';
import imgProgDefi from './img/prog-defi.png';
import imgProgRhc from './img/prog-rhc.png';
import imgProgWfh from './img/prog-wfh.png';

export default function({onRfMount, setMenuItem, onRefreshBalance, onItheumAccount, itheumAccount}) {
  const chainMeta = useContext(ChainMetaContext);
  const toast = useToast();
  const { web3: web3Provider, Moralis: {web3Library: ethers} } = useMoralis();
  const { user } = useMoralis();
  const { isOpen: isProgressModalOpen, onOpen: onProgressModalOpen, onClose: onProgressModalClose } = useDisclosure();

  const {
    error: errCfTestData,
    isLoading: loadingCfTestData,
    fetch: doCfTestData,
    data: dataCfTestData
  } = useMoralisCloudFunction("loadTestData", {}, { autoFetch: false });

  const [faucetWorking, setFaucetWorking] = useState(false);
  const [learnMoreProd, setLearnMoreProg] = useState(null);

  // eth tx state
  const [txConfirmationFaucet, setTxConfirmationFaucet] = useState(0);
  const [txHashFaucet, setTxHashFaucet] = useState(null);
  const [txErrorFaucet, setTxErrorFaucet] = useState(null);

  useEffect(() => {
    console.log('MOUNT Tools');
  }, []);

  // test data
  useEffect(() => {
    if (dataCfTestData && dataCfTestData.length > 0) {
      const response = JSON.parse(decodeURIComponent((atob(dataCfTestData))));

      toast({
        title: "Congrats! an itheum test account has been linked",
        description: "You can now sell your data on the DEX",
        status: "success",
        duration: 6000,
        isClosable: true,
      });

      onItheumAccount(response);
    }
  }, [dataCfTestData]);

  // Faucet
  useEffect(() => {
    if (txErrorFaucet) {
      setFaucetWorking(false);
    } else {
      if (txHashFaucet && txConfirmationFaucet === config.txConfirmationsNeededLrg) {
        toast({
          title: `Congrats! the faucet has sent you some ${CHAIN_TOKEN_SYMBOL(chainMeta.networkId)}`,          
          status: "success",
          duration: 6000,
          isClosable: true,
        });

        resetFauceState();
        onRefreshBalance();
      }
    }
  }, [txConfirmationFaucet, txHashFaucet, txErrorFaucet]);

  const web3_tokenFaucet = async() => {
    setFaucetWorking(true);

    const web3Signer = web3Provider.getSigner();
    const tokenContract = new ethers.Contract(chainMeta.contracts.myda, ABIS.token, web3Signer);

    const decimals = 18;
    const mydaInPrecision = ethers.utils.parseUnits('50.0', decimals).toHexString();

    try {
      const txResponse = await tokenContract.faucet(user.get('ethAddress'), mydaInPrecision);
      
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
    } catch(e) {
      setTxErrorFaucet(e);
    }
  }

  function resetFauceState() {
    setFaucetWorking(false);
    setTxConfirmationFaucet(0);
    setTxHashFaucet(null);
    setTxErrorFaucet(null);
  }

  const handleLearnMoreProg = progCode => {
    setLearnMoreProg(progCode);
    onProgressModalOpen();
  }

  return (
    <Stack spacing={5}>
      <Heading size="lg">Home</Heading>

      <Wrap shouldWrapChildren={true} wrap="wrap" spacing={3}>
        <Box maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
          <Stack p="5" h="360">
            {!itheumAccount && <Heading size="md">Your Linked Itheum Account</Heading>}
            {!itheumAccount && <Alert status="error" variant="solid">
              <Stack>
                <AlertIcon />
                <AlertTitle>Sorry! You don't seem to have a <Link href="https://itheum.com" isExternal>itheum.com</Link> platform account</AlertTitle>
                <AlertDescription>But don't fret; you can still test the Data DEX by temporarily linking to a test data account below.</AlertDescription>
              </Stack>
            </Alert>}
            
            {itheumAccount && 
              <Stack>
                <Text fontSize="xl">Welcome {`${itheumAccount.firstName} ${itheumAccount.lastName}`}</Text>
                <Text fontSize="sm">You have data available to sell from the following programs you are participating in... </Text>
                {itheumAccount.programsAllocation.map(item => (
                  <Stack direction="row" key={item.program}>
                    <Badge borderRadius="full" px="2" colorScheme="teal">{itheumAccount._lookups.programs[item.program].programName}</Badge>
                  </Stack>
                  ))}
              </Stack>
            }

            <Spacer />
            
            {!itheumAccount && <Button isLoading={loadingCfTestData} colorScheme="teal" variant="outline" onClick={doCfTestData}>Load Test Data</Button>}

            {itheumAccount && 
              <Button colorScheme="teal" variant="outline" onClick={() => setMenuItem(2)}>Sell My Data</Button>
            }
          </Stack>
        </Box>
        
        <Box maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
          <Stack p="5" h="360">
            <Heading size="md">{CHAIN_TOKEN_SYMBOL(chainMeta.networkId)} Faucet</Heading>
            <Text>Get some free {CHAIN_TOKEN_SYMBOL(chainMeta.networkId)} tokens to try DEX features</Text>
          
            {txHashFaucet && <Stack>
              <Progress colorScheme="teal" size="sm" value={(100 / config.txConfirmationsNeededLrg) * txConfirmationFaucet} />

              <HStack>
                <Text>Transaction </Text>
                <ShortAddress address={txHashFaucet} />
                <Link href={`${CHAIN_TX_VIEWER[chainMeta.networkId]}${txHashFaucet}`} isExternal> <ExternalLinkIcon mx="2px" /></Link>
              </HStack>                    
            </Stack>}

            {txErrorFaucet && 
              <Alert status="error">
                <AlertIcon />
                {txErrorFaucet.message && <AlertTitle>{txErrorFaucet.message}</AlertTitle>}
                <CloseButton position="absolute" right="8px" top="8px" onClick={resetFauceState} />
              </Alert>
            }

            <Spacer />
            <Button isLoading={faucetWorking} colorScheme="teal" variant="outline" onClick={web3_tokenFaucet}>Send me 50 {CHAIN_TOKEN_SYMBOL(chainMeta.networkId)}</Button>
          </Stack>
        </Box>

        <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
          <Stack p="5" h="360">
            <Heading size="md">Join an Itheum App</Heading>
            <Text>Join a community built personal data collection app and earn {CHAIN_TOKEN_SYMBOL(chainMeta.networkId)} when you sell your data</Text>
            <Wrap shouldWrapChildren={true} wrap="wrap" spacing={5}>
              <Box maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
                <Image src={imgProgRhc} />

                <Box p="3">
                  <Box d="flex" alignItems="baseline">
                    <Box
                      mt="1"
                      mr="1"
                      fontWeight="semibold"
                      as="h4"
                      lineHeight="tight"
                      isTruncated>
                      Red Heart Challenge
                    </Box>
                    <Badge borderRadius="full" px="2" colorScheme="teal"> Live</Badge>
                  </Box>
                  <Button size="sm" mt="3" mr="3" colorScheme="teal" variant="outline" onClick={() => (handleLearnMoreProg('rhc'))}>Learn More</Button>
                  <Button size="sm" mt="3" colorScheme="teal" onClick={() => (window.open(`https://itheum.com/redheartchallenge?web3Uid=${user.id}`))}>Join Now</Button>
                </Box>
              </Box>

              <Box maxW="container.sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
                <Image src={imgProgDefi} />

                <Box p="3">
                  <Box d="flex" alignItems="baseline">
                    <Box
                      mt="1"
                      mr="1"
                      fontWeight="semibold"
                      as="h4"
                      lineHeight="tight"
                      isTruncated>
                      Global DeFi Census
                    </Box>
                    <Badge borderRadius="full" px="2" colorScheme="blue"> Coming Soon</Badge>
                  </Box>
                  <Button size="sm" mt="3" mr="3" colorScheme="teal" variant="outline" onClick={() => (handleLearnMoreProg('gdc'))}>Learn More</Button>
                  <Button size="sm" disabled="true" mt="3" colorScheme="teal" onClick={() => (window.open(''))}>Join Now</Button>
                </Box>
              </Box>

              <Box maxW="container.sm" borderWidth="1px" borderRadius="lg" overflow="hidden" w="300px">
                <Image src={imgProgWfh} />

                <Box p="3">
                  <Box d="flex" alignItems="baseline">
                    <Box
                      mt="1"
                      mr="1"
                      fontWeight="semibold"
                      as="h4"
                      lineHeight="tight"
                      isTruncated>
                      Wearables Fitness and Activity
                    </Box>
                    <Badge borderRadius="full" px="2" colorScheme="blue"> Coming Soon</Badge>
                  </Box>
                  <Button size="sm" mt="3" mr="3" colorScheme="teal" variant="outline" onClick={() => (handleLearnMoreProg('wfa'))}>Learn More</Button>
                  <Button size="sm" disabled="true" mt="3" colorScheme="teal" onClick={() => (window.open(''))}>Join Now</Button>
                </Box>
              </Box>
            </Wrap>
          </Stack>
        </Box>        
      </Wrap>

      {learnMoreProd && <Modal size="xl"
        isOpen={isProgressModalOpen}
        onClose={onProgressModalClose}
        closeOnEsc={false} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{progInfoMeta[learnMoreProd].name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack spacing="5">
            <Text>{progInfoMeta[learnMoreProd].desc}</Text>
              <Stack><Text color="gray" as="b">Delivered Via:</Text> <p>{progInfoMeta[learnMoreProd].medium}</p></Stack>
              <Stack><Text color="gray" as="b">Data Collected:</Text> <p>{progInfoMeta[learnMoreProd].data}</p></Stack>
              <Stack><Text color="gray" as="b">App Outcome:</Text> <p>{progInfoMeta[learnMoreProd].outcome}</p></Stack>
              <Stack><Text color="gray" as="b">Target Buyers:</Text> <p>{progInfoMeta[learnMoreProd].targetBuyer}</p></Stack>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" mr={3} colorScheme="teal" variant="outline" onClick={onProgressModalClose}>Close</Button>
            <Button size="sm" colorScheme="teal" onClick={() => (window.open(`${progInfoMeta[learnMoreProd].url}?web3Uid=${user.id}`))}>Join Now</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>}
    </Stack>
  );
};
