import React, { useContext, useState, useEffect } from 'react';
import { useMoralis, useMoralisCloudFunction } from 'react-moralis';
import { Box, Stack } from '@chakra-ui/layout';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Button, Link, Progress, Badge,
  Alert, AlertIcon, AlertTitle, AlertDescription, Spacer,
  Text, HStack, Heading,
  useToast
} from '@chakra-ui/react';
import ShortAddress from './ShortAddress';
import { config } from './util';
import { ABIS, CHAIN_TX_VIEWER, CHAIN_TOKEN_SYMBOL } from './util';
import { ChainMetaContext } from './App';

export default function({setMenuItem, onRefreshBalance, onItheumAccount, itheumAccount}) {
  const chainMeta = useContext(ChainMetaContext);
  const toast = useToast();
  const { web3 } = useMoralis();
  const { user } = useMoralis();

  const {
    error: errCfTestData,
    isLoading: loadingCfTestData,
    fetch: doCfTestData,
    data: dataCfTestData
  } = useMoralisCloudFunction("loadTestData", {}, { autoFetch: false });

  const [faucetWorking, setFaucetWorking] = useState(false);

  // eth tx state
  const [txConfirmationFaucet, setTxConfirmationFaucet] = useState(0);
  const [txHashFaucet, setTxHashFaucet] = useState(null);
  const [txErrorFaucet, setTxErrorFaucet] = useState(null);

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
  useEffect(async () => {
    if (txErrorFaucet) {
      console.error(txErrorFaucet);
      setFaucetWorking(false);
    } else {
      if (txHashFaucet && txConfirmationFaucet === config.txConfirmationsNeededLrg) {
        console.log('FAUCETTED');
        
        toast({
          title: `Congrats! the faucet has sent you some ${CHAIN_TOKEN_SYMBOL(chainMeta.networkId)}`,          
          status: "success",
          duration: 6000,
          isClosable: true,
        });

        resetFaucetUiState();
        onRefreshBalance();
      }
    }
  }, [txConfirmationFaucet, txHashFaucet, txErrorFaucet]);

  const web3_tokenFaucet = async() => {
    setFaucetWorking(true);

    const tokenContract = new web3.eth.Contract(ABIS.token, chainMeta.contracts.myda);

    const decimals = 18;
    const mydaInPrecision = web3.utils.toBN("0x"+(50*10**decimals).toString(16));

    tokenContract.methods.faucet(user.get('ethAddress'), mydaInPrecision).send({from: user.get('ethAddress')})
      .on('transactionHash', function(hash) {
        console.log('Faucet transactionHash', hash);

        setTxHashFaucet(hash);
      })
      .on('receipt', function(receipt){
        console.log('Faucet receipt', receipt);
      })
      .on('confirmation', function(confirmationNumber, receipt){
        console.log('Faucet confirmation');
        console.log(confirmationNumber);

        setTxConfirmationFaucet(confirmationNumber);
      })
      .on('error', function(error, receipt) {
        console.log('Faucet error');
        console.log(receipt);
        console.log(error);

        setTxErrorFaucet(error);
      });
  }

  const resetFaucetUiState = () => {
    setFaucetWorking(false);
    setTxConfirmationFaucet(0);
    setTxHashFaucet(null);
    setTxErrorFaucet(null);
  }

  return (
    <Stack spacing={5}>
      <Heading size="lg">Home</Heading>

      <HStack align="top" spacing={10}>
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
            
            {!itheumAccount && <Button isLoading={loadingCfTestData} colorScheme="green" variant="outline" onClick={doCfTestData}>Load Test Data</Button>}

            {itheumAccount && 
              <Button colorScheme="green" variant="outline" onClick={() => setMenuItem(2)}>Sell My Data</Button>
            }
          </Stack>
        </Box>
        
        <Box maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
          <Stack p="5" h="360">
            <Heading size="md">{CHAIN_TOKEN_SYMBOL(chainMeta.networkId)} Faucet</Heading>
            <Text>Get some free {CHAIN_TOKEN_SYMBOL(chainMeta.networkId)} tokens to try DEX features</Text>
          
            {txHashFaucet && <Stack>
              <Progress colorScheme="green" size="sm" value={(100 / config.txConfirmationsNeededLrg) * txConfirmationFaucet} />

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
              </Alert>
            }

            <Spacer />
            <Button isLoading={faucetWorking} colorScheme="green" variant="outline" onClick={web3_tokenFaucet}>Send me 50 {CHAIN_TOKEN_SYMBOL(chainMeta.networkId)}</Button>
          </Stack>
        </Box>

      </HStack>
    </Stack>
  );
};
