import React, { useContext, useState, useEffect } from "react";
import { useMoralis, useMoralisCloudFunction } from "react-moralis";
import { Box, Stack } from "@chakra-ui/layout";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Button,
  Link,
  Progress,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spacer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Text,
  HStack,
  VStack,
  Heading,
  CloseButton,
  Wrap,
  Image,
  WrapItem,
  useToast,
  useDisclosure,Spinner
} from "@chakra-ui/react";
import ShortAddress from "./UtilComps/ShortAddress";
import { progInfoMeta, config, sleep } from "./libs/util";
import { ABIS, CHAIN_TX_VIEWER, CHAIN_TOKEN_SYMBOL } from "./libs/util";
import { ChainMetaContext } from "./libs/contexts";
import imgProgGaPa from "./img/prog-gaming.jpg";
import imgProgRhc from "./img/prog-rhc.png";
import imgProgWfh from "./img/prog-wfh.png";
import ClaimModal from "./UtilComps/ClaimModal";
import {claimsContractAddress_Matic} from "./libs/contactAddresses"
import { useUser } from "./store/UserContext";

export default function ({
  onRfMount,
  setMenuItem,
  onRefreshBalance,
  onItheumAccount,
  itheumAccount,
}) {
  const chainMeta = useContext(ChainMetaContext);
  const toast = useToast();
  const {
    web3: web3Provider,
    Moralis: { web3Library: ethers },
  } = useMoralis();

  const { user } = useMoralis();

  const {
    isOpen: isProgressModalOpen,
    onOpen: onProgressModalOpen,
    onClose: onProgressModalClose,
  } = useDisclosure();

  const {
    error: errCfTestData,
    isLoading: loadingCfTestData,
    fetch: doCfTestData,
    data: dataCfTestData,
  } = useMoralisCloudFunction("loadTestData", {}, { autoFetch: false });

  const [faucetWorking, setFaucetWorking] = useState(false);
  const [claimWorking, setClaimWorking] = useState(false);
  const [learnMoreProd, setLearnMoreProg] = useState(null);

  // eth tx state
  const [txConfirmationFaucet, setTxConfirmationFaucet] = useState(0);
  const [txHashFaucet, setTxHashFaucet] = useState(null);
  const [txErrorFaucet, setTxErrorFaucet] = useState(null);
  const [txConfirmationClaim, setTxConfirmationClaim] = useState(0);
  const [txHashClaim, setTxHashClaim] = useState(null);
  const [txErrorClaim, setTxErrorClaim] = useState(null);

  useEffect(() => {
    console.log("MOUNT Tools");
  }, []);

  // test data
  useEffect(() => {
    if (dataCfTestData && dataCfTestData.length > 0) {
      const response = JSON.parse(decodeURIComponent(atob(dataCfTestData)));

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

  // Claim
  useEffect(() => {
    if (txErrorClaim) {
      setClaimWorking(false);
    } else {
      if (
        txHashClaim &&
        txConfirmationClaim === config.txConfirmationsNeededLrg
      ) {
        toast({
          title: `Congrats! the faucet has sent you some ${CHAIN_TOKEN_SYMBOL(
            chainMeta.networkId
          )}`,
          status: "success",
          duration: 6000,
          isClosable: true,
        });

        resetClaimState();
        onRefreshBalance();
      }
    }
  }, [txConfirmationClaim, txHashClaim, txErrorClaim]);
  
  // Faucet
  useEffect(() => {
    if (txErrorFaucet) {
      setFaucetWorking(false);
    } else {
      if (
        txHashFaucet &&
        txConfirmationFaucet === config.txConfirmationsNeededLrg
      ) {
        toast({
          title: `Congrats! the faucet has sent you some ${CHAIN_TOKEN_SYMBOL(
            chainMeta.networkId
          )}`,
          status: "success",
          duration: 6000,
          isClosable: true,
        });

        resetFauceState();
        onRefreshBalance();
      }
    }
  }, [txConfirmationFaucet, txHashFaucet, txErrorFaucet]);

  const handleClick =() => {
     web3_claims()}


  const web3_tokenFaucet = async () => {
    setFaucetWorking(true);

    const web3Signer = web3Provider.getSigner();

    const tokenContract = new ethers.Contract(
      chainMeta.contracts.myda,
      ABIS.token,
      web3Signer
    );

    const decimals = 18;
    const mydaInPrecision = ethers.utils
      .parseUnits("50.0", decimals)
      .toHexString();

    try {
      const txResponse = await tokenContract.faucet(
        user.get("ethAddress"),
        mydaInPrecision
      );

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
        const txErr = new Error("Token Contract Error on method faucet");
        console.error(txErr);

        setTxErrorFaucet(txErr);
      }
    } catch (e) {
      setTxErrorFaucet(e);
    }
  };

  const web3_claims = async (ntype) => {
    setClaimWorking(true);

    const web3Signer = web3Provider.getSigner();
    const walletAddress = user.get("ethAddress");

    const tokenContract = new ethers.Contract(
      "0x985A5c96663C9c44d46Ea061f4b7E50118180F8d",
      ABIS.claims,
      web3Signer
    );

    try {

      const txResponse = await tokenContract.claimDeposit(ntype)

      // show a nice loading animation to user
      setTxHashClaim(txResponse.hash);
      console.log("🚀 ~ file: Tools.js ~ line 224 ~ constweb3_claims= ~ txResponse.hash", txResponse.hash)

      await sleep(2);
      setTxConfirmationClaim(0.5);

      // wait for 1 confirmation from ethers
      const txReceipt = await txResponse.wait();
      console.log("🚀 ~ file: Tools.js ~ line 231 ~ constweb3_claims= ~ txReceipt", txReceipt)
      setTxConfirmationClaim(1);
      await sleep(2);

      if (txReceipt.status) {
        setTxConfirmationClaim(2);
      } else {
        const txErr = new Error("Token Contract Error on method faucet");
        console.error(txErr)
        setTxErrorClaim(txErr);
      }
    } catch (e) {
      setTxErrorClaim(e);
    }
  };
  
  function resetClaimState() {
    setClaimWorking(false);
    setTxConfirmationClaim(0);
    setTxHashClaim(null);
    setTxErrorClaim(null);
  }
  function resetFauceState() {
    setFaucetWorking(false);
    setTxConfirmationFaucet(0);
    setTxHashFaucet(null);
    setTxErrorFaucet(null);
  }

  const handleLearnMoreProg = (progCode) => {
    setLearnMoreProg(progCode);
    onProgressModalOpen();
  };
  
  // useEffect(() => {
  //   const __ =web3_claims();
  // },[])
  
  const {user:_user} = useUser();

  const {isOpen: isRewardsOpen, onOpen: onRewardsOpen, onClose: onRewardsClose}=useDisclosure()
  
  const rewardsModalData = {
    isOpen: isRewardsOpen,
    onClose: onRewardsClose,
    title: "My Claimable Rewards",
    tag1:"Total Available",
    value1:_user?.claimBalanceValues[0],
    tag2: "Deposited On",
    value2: _user?.claimBalanceDates[0].toString(),
    n: 1,

    
  }
  const {isOpen: isAirdropsOpen, onOpen: onAirdropsOpen, onClose: onAirdropClose}=useDisclosure()
  
  const airdropsModalData = {
    isOpen: isAirdropsOpen,
    onClose: onAirdropClose,
    title: "My Claimable Airdrops",
    tag1:"Total Available",
    value1:_user?.claimBalanceValues[1],
    tag2: "Deposited On",
    value2:  _user?.claimBalanceDates[1].toString(),
    n:2
  }
  const {isOpen: isAllocationsOpen, onOpen: onAllocationsOpen, onClose: onAllocationsClose}=useDisclosure()
  
  const allocationsModalData = {
    isOpen: isAllocationsOpen,
    onClose: onAllocationsClose,
    title: "My Claimable Allocations",
    tag1:"Total Available",
    value1:_user?.claimBalanceValues[2],
    tag2: "Deposited On",
    value2:  _user?.claimBalanceDates[2].toString(),
    n:3
   
  }


 



  return (
<>
    <button onClick={handleClick}>Claim</button>
    <Stack>
      <Heading size="lg">Home</Heading>

      <Wrap>
        <WrapItem maxW="sm" borderWidth="1px" borderRadius="lg">
          <Stack p="5" h="360">
            {!itheumAccount && (
              <Heading size="md">Your Linked Itheum Account</Heading>
            )}
            {!itheumAccount && (
              <Alert status="warning" variant="solid">
                <Stack>
                  <AlertTitle fontSize="md">
                    <AlertIcon mb={2} /> Sorry! You don't seem to have a{" "}
                    <Link href="https://itheum.com" isExternal>
                      itheum.com
                    </Link>{" "}
                    platform account
                  </AlertTitle>
                  <AlertDescription fontSize="md">
                    But don't fret; you can still test the Data DEX by
                    temporarily linking to a test data account below.
                  </AlertDescription>
                </Stack>
              </Alert>
            )}

            {itheumAccount && (
              <Stack>
                <Text fontSize="xl">
                  Welcome{" "}
                  {`${itheumAccount.firstName} ${itheumAccount.lastName}`}
                </Text>
                <Text fontSize="sm">
                  You have data available to sell from the following programs
                  you are participating in...{" "}
                </Text>
                {itheumAccount.programsAllocation.map((item) => (
                  <Stack direction="row" key={item.program}>
                    <Badge borderRadius="full" px="2" colorScheme="teal">
                      {
                        itheumAccount._lookups.programs[item.program]
                          .programName
                      }
                    </Badge> fontSize={"3xl"}
                  </Stack>
                ))}
              </Stack>
            )}

            <Spacer />

            {!itheumAccount && (
              <Button
                isLoading={loadingCfTestData}
                colorScheme="teal"
                variant="outline"
                onClick={doCfTestData}
              >
                Load Test Data
              </Button>
            )}

            {itheumAccount && (
              <Button
                colorScheme="teal"
                variant="outline"
                onClick={() => setMenuItem(2)}
              >
                Trade My Data
              </Button>
            )}
          </Stack>
        </WrapItem>

        <WrapItem maxW="sm" borderWidth="1px" borderRadius="lg">
          <Stack p="5" h="360">
            <Heading size="md">
              {CHAIN_TOKEN_SYMBOL(chainMeta.networkId)} Faucet
            </Heading>
            <Text fontSize="sm">
              Get some free {CHAIN_TOKEN_SYMBOL(chainMeta.networkId)} tokens to
              try DEX features
            </Text>

            {txHashFaucet && (
              <Stack>
                <Progress
                  colorScheme="teal"
                  size="sm"
                  value={
                    (100 / config.txConfirmationsNeededLrg) *
                    txConfirmationFaucet
                  }
                />

                <HStack>
                  <Text fontSize="sm">Transaction </Text>
                  <ShortAddress address={txHashFaucet} />
                  <Link
                    href={`${
                      CHAIN_TX_VIEWER[chainMeta.networkId]
                    }${txHashFaucet}`}
                    isExternal
                  >
                    {" "}
                    <ExternalLinkIcon mx="2px" />
                  </Link>
                </HStack>
              </Stack>
            )}

            {txErrorFaucet && (
              <Alert status="error">
                <AlertIcon />
                {txErrorFaucet.message && (
                  <AlertTitle>{txErrorFaucet.message}</AlertTitle>
                )}
                <CloseButton
                  position="absolute"
                  right="8px"
                  top="8px"
                  onClick={resetFauceState}
                />
              </Alert>
            )}

            <Spacer />
            <Button
              isLoading={faucetWorking}
              colorScheme="teal"
              variant="outline"
              onClick={web3_tokenFaucet}
            >
              Send me 50 {CHAIN_TOKEN_SYMBOL(chainMeta.networkId)}
            </Button>
          </Stack>
        </WrapItem>


{/* //ClaimModal */}


        <WrapItem maxW="sm" borderWidth="1px" borderRadius="lg">
          <Stack p="10" pt="5" h="360">
            <Heading size="md" alignSelf={"center"}>My Claims</Heading>
            <VStack spacing={20} ></VStack>
            <Spacer />
            <HStack spacing={50}>
              <Text fontSize={"2xl"}>Rewards</Text>
              <Button colorScheme="teal" variant="outline" onClick={onRewardsOpen}>{_user?.claimBalanceValues[0] !== "a" ? _user?.claimBalanceValues[0] : <Spinner size='xs' /> }</Button>
              <ClaimModal {...rewardsModalData} />
            </HStack>
            <Spacer />
            <HStack spacing={50}>
              <Text fontSize={"2xl"}>Airdrops</Text>

              <Button colorScheme="teal" variant="outline" onClick={onAirdropsOpen} >{_user?.claimBalanceValues[1] !== "a" ? _user?.claimBalanceValues[1] : <Spinner size='xs' />}</Button>
              <ClaimModal {...airdropsModalData}/>
            </HStack>
            <Spacer />
            <HStack spacing={30}>
              <Text fontSize={"2xl"}>Allocations</Text>
              <Button colorScheme="teal" variant="outline" onClick={onAllocationsOpen} >{_user?.claimBalanceValues[2] !== "a" ? _user?.claimBalanceValues[2] : <Spinner size='xs' /> }</Button>
              <ClaimModal {...allocationsModalData}/>
            </HStack>

{txHashClaim && (
              <Stack>
                <Progress
                  colorScheme="teal"
                  size="sm"
                  value={
                    (100 / config.txConfirmationsNeededLrg) *
                    txConfirmationClaim
                  }
                />

                <HStack>
                  <Text fontSize="sm">Transaction </Text>
                  <ShortAddress address={txHashClaim} />
                  <Link
                    href={`${
                      CHAIN_TX_VIEWER[chainMeta.networkId]
                    }${txHashClaim}`}
                    isExternal
                  >
                    {" "}
                    <ExternalLinkIcon mx="2px" />
                  </Link>
                </HStack>
              </Stack>
            )}

            {txErrorFaucet && (
              <Alert status="error">
                <AlertIcon />
                {txErrorFaucet.message && (
                  <AlertTitle>{txErrorClaim.message}</AlertTitle>
                )}
                <CloseButton
                  position="absolute"
                  right="8px"
                  top="8px"
                  onClick={resetClaimState}
                />
              </Alert>
            )}
            <Spacer />
          </Stack>
        </WrapItem>
      </Wrap>

      <Stack p="5" h="360">
        <Heading size="md">App Marketplace</Heading>
        <Text fontSize="md">
          Join a community built app and earn{" "}
          {CHAIN_TOKEN_SYMBOL(chainMeta.networkId)} when you trade your data
        </Text>
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
                  isTruncated
                >
                  Red Heart Challenge
                </Box>
                <Badge borderRadius="full" px="2" colorScheme="teal">
                  {" "}
                  Live
                </Badge>
              </Box>
              <Button
                size="sm"
                mt="3"
                mr="3"
                colorScheme="teal"
                variant="outline"
                onClick={() => handleLearnMoreProg("rhc")}
              >
                Learn More
              </Button>
              <Button
                size="sm"
                mt="3"
                colorScheme="teal"
                onClick={() =>
                  window.open(
                    `https://itheum.com/redheartchallenge?dexUserId=${user.id}`
                  )
                }
              >
                Join Now
              </Button>
            </Box>
          </Box>

          <Box
            maxW="container.sm"
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
          >
            <Image src={imgProgGaPa} />

            <Box p="3">
              <Box d="flex" alignItems="baseline">
                <Box
                  mt="1"
                  mr="1"
                  fontWeight="semibold"
                  as="h4"
                  lineHeight="tight"
                  isTruncated
                >
                  Gamer Passport
                </Box>
                <Badge borderRadius="full" px="2" colorScheme="blue">
                  {" "}
                  Coming Soon
                </Badge>
              </Box>
              <Button
                size="sm"
                mt="3"
                mr="3"
                colorScheme="teal"
                variant="outline"
                onClick={() => handleLearnMoreProg("gdc")}
              >
                Learn More
              </Button>
              <Button
                size="sm"
                disabled="true"
                mt="3"
                colorScheme="teal"
                onClick={() => window.open("")}
              >
                Join Now
              </Button>
            </Box>
          </Box>

          <Box
            maxW="container.sm"
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            w="300px"
          >
            <Image src={imgProgWfh} />

            <Box p="3">
              <Box d="flex" alignItems="baseline">
                <Box
                  mt="1"
                  mr="1"
                  fontWeight="semibold"
                  as="h4"
                  lineHeight="tight"
                  isTruncated
                >
                  Wearables Fitness and Activity
                </Box>
                <Badge borderRadius="full" px="2" colorScheme="blue">
                  {" "}
                  Coming Soon
                </Badge>
              </Box>
              <Button
                size="sm"
                mt="3"
                mr="3"
                colorScheme="teal"
                variant="outline"
                onClick={() => handleLearnMoreProg("wfa")}
              >
                Learn More
              </Button>
              <Button
                size="sm"
                disabled="true"
                mt="3"
                colorScheme="teal"
                onClick={() => window.open("")}
              >
                Join Now
              </Button>
            </Box>
          </Box>
        </Wrap>
      </Stack>

      {learnMoreProd && (
        <Modal
          size="xl"
          isOpen={isProgressModalOpen}
          onClose={onProgressModalClose}
          closeOnEsc={false}
          closeOnOverlayClick={false}
        >
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
              <Button
                size="sm"
                mr={3}
                colorScheme="teal"
                variant="outline"
                onClick={onProgressModalClose}
              >
                Close
              </Button>
              <Button
                size="sm"
                colorScheme="teal"
                onClick={() =>
                  window.open(
                    `${progInfoMeta[learnMoreProd].url}?dexUserId=${user.id}`
                  )
                }
              >
                Join Now
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Stack>
    </>
  );
}
