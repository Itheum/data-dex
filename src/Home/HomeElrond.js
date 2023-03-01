import React, { useState, useEffect } from 'react';
import { Box, Stack } from '@chakra-ui/layout';
import { 
  Button, Spacer, Text, HStack, Heading, Wrap, Spinner,
  useToast, useDisclosure, Tooltip } from '@chakra-ui/react';
import { WarningTwoIcon } from '@chakra-ui/icons';
import moment from 'moment';
import { uxConfig, debugui } from 'libs/util';
import { CHAIN_TOKEN_SYMBOL, CLAIM_TYPES, MENU, SUPPORTED_CHAINS } from 'libs/util';
import myNFMe from 'img/my-nfme.png';
import ClaimModalElrond from 'ClaimModel/ClaimModalElrond';
import { useUser } from 'store/UserContext';
import { useChainMeta } from 'store/ChainMetaContext';
import ChainSupportedComponent from 'UtilComps/ChainSupportedComponent';
import AppMarketplace from 'Home/AppMarketplace';
import { FaucetContract } from 'Elrond/faucet';
import { ClaimsContract } from 'Elrond/claims';
import { useGetAccountInfo, useGetLoginInfo } from '@multiversx/sdk-dapp/hooks/account';
import { useGetPendingTransactions } from '@multiversx/sdk-dapp/hooks/transactions';
import { formatNumberRoundFloor } from 'libs/util';

let elrondFaucetContract = null;
let elrondClaimsContract = null;

export default function HomeElrond({ onRfMount }) {
  const toast = useToast();
  const { chainMeta: _chainMeta } = useChainMeta();
  const { user: _user } = useUser();
  const { address: elrondAddress } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { isLoggedIn: isElrondLoggedIn } = useGetLoginInfo();
  
  const [isOnChainInteractionDisabled, setIsOnChainInteractionDisabled] = useState(false);
  const [isElrondFaucetDisabled, setIsElrondFaucetDisabled] = useState(false);
  const [claimsBalances, setClaimsBalances] = useState({
    claimBalanceValues: ['-1', '-1', '-1'], // -1 is loading, -2 is error
    claimBalanceDates: [0, 0, 0]
  });
  const [claimContractPauseValue, setClaimContractPauseValue] = useState(false);

  useEffect(() => {
    if (_chainMeta?.networkId && _user?.isElrondAuthenticated) {
      if (SUPPORTED_CHAINS.includes(_chainMeta.networkId)) {
        try {
          elrondFaucetContract = new FaucetContract(_chainMeta.networkId);
        } catch(e) {
          console.log(e);
        }
        elrondClaimsContract = new ClaimsContract(_chainMeta.networkId);
      }
    }
  }, [_chainMeta]);

  // S: Faucet
  useEffect(() => {
    // hasPendingTransactions will fire with false during init and then move from true to false each time a TX is done... 
    // ... so if it's 'false' we need check and prevent faucet from being used too often
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
      elrondFaucetContract.sendActivateFaucetTransaction(elrondAddress);
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
  const elrondClaimsBalancesUpdate = async() => {
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
            claimBalanceValues.push(claim.amount / Math.pow(10, 18));
            claimBalanceDates.push(claim.date);
          });
        } else if (claims.error) {
          claimBalanceValues.push('-2', '-2', '-2'); // errors
          
          if (!toast.isActive('er2')) {
            toast({
              id: 'er2',
              title: 'ER2: Could not get your claims information from the multiversX blockchain.',
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
  }

  useEffect(() => {
    // check if claims contract is paused, freeze ui so user does not waste gas
    if (elrondClaimsContract && !hasPendingTransactions) {
      getAndSetElrondClaimsIsPaused();
    }
  }, [elrondAddress]);

  const getAndSetElrondClaimsIsPaused = async() => {
    if (elrondAddress && isElrondLoggedIn) {
      const isPaused = await elrondClaimsContract.isClaimsContractPaused();
      setClaimContractPauseValue(isPaused);
      return isPaused;
    }
  }
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

  const shouldClaimButtonBeDisabled = (claimTypeIndex) => {
    return claimContractPauseValue || 
        isOnChainInteractionDisabled || 
          claimsBalances.claimBalanceValues[claimTypeIndex] === '-1' || claimsBalances.claimBalanceValues[claimTypeIndex] === '-2' || !claimsBalances.claimBalanceValues[claimTypeIndex] > 0
  }

  // S: claims related logic
  const { isOpen: isRewardsOpen, onOpen: onRewardsOpen, onClose: onRewardsClose } = useDisclosure();

  const rewardsModalData = {
    isOpen: isRewardsOpen,
    onClose: () => {
      onRewardsClose();
    },
    title: 'Rewards',
    tag1: 'Total Available',
    value1: claimsBalances.claimBalanceValues[0],
    tag2: 'Last Deposited on',
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
    title: 'Airdrops',
    tag1: 'Total Available',
    value1: claimsBalances.claimBalanceValues[1],
    tag2: 'Last Deposited on',
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
    title: 'Allocations',
    tag1: 'Total Available',
    value1: claimsBalances.claimBalanceValues[2],
    tag2: 'Last Deposited on',
    value2: moment(claimsBalances.claimBalanceDates[2]).format(uxConfig.dateStrTm),
    claimType: CLAIM_TYPES.ALLOCATIONS,
    elrondClaimsContract
  };
  // E: claims related logic

  debugui(`_chainMeta.networkId ${_chainMeta.networkId}`);

  const tileBoxMdW = '310px';
  const tileBoxH = '360px';

  return (
    <Stack>
      <Heading size="lg">Home</Heading>

      <Stack>
        <Wrap pt="5" shouldWrapChildren={true} wrap="wrap" spacing={5}>
          <ChainSupportedComponent feature={MENU.FAUCET}>
            <Box maxW="container.sm" w={tileBoxMdW} borderWidth="1px" borderRadius="lg">
              <Stack p="5" h={tileBoxH}>
                <Heading size="md">{CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)} Faucet</Heading>
                <Text fontSize="sm" pb={5}>
                  Get some free {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)} tokens to try DEX features
                </Text>

                <Spacer />

                <Button colorScheme="teal" variant="outline" onClick={handleOnChainFaucet} disabled={isElrondFaucetDisabled}>
                  Send me 50 {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)}
                </Button>
              </Stack>
            </Box>
          </ChainSupportedComponent>

          <Box maxW="container.sm" borderWidth="1px" borderRadius="lg" w={tileBoxMdW}>
            <Stack p="5" h={tileBoxH} bgImage={myNFMe} bgSize="cover" bgPosition="top" borderRadius="lg">
              <Heading size="md" align="center">NFMe ID Avatar</Heading>                  
              <Spacer />
              <Button disabled colorScheme="teal">Mint & Own NFT</Button>
              <Text fontSize="sm" align="center">Coming Soon</Text>
            </Stack>
          </Box>

          <ChainSupportedComponent feature={MENU.CLAIMS}>
            <Box maxW="container.sm" borderWidth="1px" borderRadius="lg" w={[tileBoxMdW, 'initial']}>
              <Stack p="5" h={tileBoxH}>
                <Heading size="md">My Claims</Heading>
                
                <Spacer />
                <HStack spacing={50}>
                  <Text>Rewards</Text>
                  <Tooltip colorScheme="teal" hasArrow label="The claims contract is currently paused" isDisabled={!claimContractPauseValue}>
                    <Button isDisabled={shouldClaimButtonBeDisabled(0)} colorScheme="teal" variant="outline" w="70px" onClick={onRewardsOpen}>
                    {(claimsBalances.claimBalanceValues[0] !== '-1' && claimsBalances.claimBalanceValues[0] !== '-2') ? 
                        formatNumberRoundFloor(claimsBalances.claimBalanceValues[0]) : claimsBalances.claimBalanceValues[0] !== '-2' ? 
                          <Spinner size="xs" /> : <WarningTwoIcon />
                    }
                    </Button>
                  </Tooltip>

                  <ClaimModalElrond {...rewardsModalData} />
                </HStack>
                
                <Spacer />
                <HStack spacing={50}>
                  <Text>Airdrops</Text>
                  <Tooltip colorScheme="teal" hasArrow label="The claims contract is currently paused" isDisabled={!claimContractPauseValue}>
                    <Button isDisabled={shouldClaimButtonBeDisabled(1)} colorScheme="teal" variant="outline" w="70px" onClick={onAirdropsOpen}>
                    {(claimsBalances.claimBalanceValues[1] !== '-1' && claimsBalances.claimBalanceValues[1] !== '-2') ? 
                        formatNumberRoundFloor(claimsBalances.claimBalanceValues[1]) : claimsBalances.claimBalanceValues[1] !== '-2' ? 
                          <Spinner size="xs" /> : <WarningTwoIcon />
                    }
                    </Button>
                  </Tooltip>

                  <ClaimModalElrond {...airdropsModalData} />
                </HStack>
                <Spacer />
                
                {claimsBalances.claimBalanceValues[2] > 0 && 
                  <Box h="40px">
                    <HStack spacing={30}>
                      <Text>Allocations</Text>
                      <Tooltip colorScheme="teal" hasArrow label="The claims contract is currently paused" isDisabled={!claimContractPauseValue}>
                        <Button isDisabled={shouldClaimButtonBeDisabled(2)} colorScheme="teal" variant="outline" w="70px" onClick={onAllocationsOpen}>
                          {(claimsBalances.claimBalanceValues[2] !== '-1' && claimsBalances.claimBalanceValues[2] !== '-2') ? 
                              formatNumberRoundFloor(claimsBalances.claimBalanceValues[2]) : claimsBalances.claimBalanceValues[2] !== '-2' ? 
                                <Spinner size="xs" /> : <WarningTwoIcon />
                          }
                        </Button>
                      </Tooltip>
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

      <AppMarketplace />

    </Stack>
  );
}
