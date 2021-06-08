import React, { useState, useEffect } from 'react';
import { useMoralis, useMoralisQuery, useNewMoralisObject, useMoralisCloudFunction } from 'react-moralis';
import { Box, Stack } from '@chakra-ui/layout';
import { CheckCircleIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Skeleton, CloseButton, Button, Link, Spinner, Progress,
  Alert, AlertIcon, AlertTitle, AlertDescription,
  Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  Text, HStack, Input, Heading,
  useToast, useDisclosure, 
} from '@chakra-ui/react';
import ShortAddress from './ShortAddress';
import { config, sleep, dataTemplates, TERMS, ABIS } from './util';
import { ddexContractAddress, mydaContractAddress } from './secrets';

export default function({setMenuItem, onRefreshBalance, onItheumAccount, itheumAccount}) {
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
      // console.log('🚀 ~ function ~ dataCfTestData', dataCfTestData);

      const response = JSON.parse(decodeURIComponent((atob(dataCfTestData))));
      console.log('🚀 ~ useEffect ~ response', response);

      toast({
        title: "Congrats! an itheum test account has been linked",          
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
          title: "Congrats! the faucet has sent you some MYDA",
          description: "You can now sell your data on the DEX",         
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

    const tokenContract = new web3.eth.Contract(ABIS.token, mydaContractAddress);

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
          <Stack p={5}>
            <Heading size="md">Your Linked Itheum Account</Heading>
            {!itheumAccount && <Alert status="error">
              <Stack>
                <AlertIcon />
                <AlertTitle mr={2}>Sorry! You don't seem to have a live platform account</AlertTitle>
                <AlertDescription>But dont fret; you can still test the Data Dex by temporarily linking to a test data account below.</AlertDescription>
              </Stack>
            </Alert>}

            {!itheumAccount && <Button isLoading={loadingCfTestData} colorScheme="green" variant="outline" onClick={doCfTestData}>Load Test Data</Button>}

            {itheumAccount && <Stack>
              <Text>Welcome {`${itheumAccount.firstName} ${itheumAccount.lastName}`}</Text>
              <Button colorScheme="green" variant="outline" onClick={() => setMenuItem(2)}>Sell My Data</Button>
            </Stack>}
          </Stack>
        </Box>
        
        <Box maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
          <Stack p={5}>
            <Heading size="md">MYDA Faucet</Heading>
            <Text>Get some free MYDA tokens to try DEX features</Text>
          </Stack>
        
          <Stack p={5}>
            <Text mb="8px">Your Eth Address</Text>
            <Input isDisabled value={user.get('ethAddress')} />
            <Button isLoading={faucetWorking} colorScheme="green" variant="outline" onClick={web3_tokenFaucet}>Send me 50 MYDA</Button>
          </Stack>

          {txHashFaucet && <Stack p={5}>
            <Progress colorScheme="green" size="sm" value={(100 / config.txConfirmationsNeededLrg) * txConfirmationFaucet} />

            <HStack>
              <Text>Transaction </Text>
              <ShortAddress address={txHashFaucet} />
              <Link href={`https://ropsten.etherscan.io/tx/${txHashFaucet}`} isExternal> View <ExternalLinkIcon mx="2px" /></Link>
            </HStack>                    
          </Stack>}

          {txErrorFaucet && 
            <Alert status="error">
              <AlertIcon />
              {txErrorFaucet.message && <AlertTitle>{txErrorFaucet.message}</AlertTitle>}
            </Alert>
          }
        </Box>
      </HStack>
    </Stack>
  );
};
