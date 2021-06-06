import React, { useState, useEffect } from 'react';
import { useMoralis, useMoralisQuery, useNewMoralisObject } from 'react-moralis';
import { Box, Stack } from '@chakra-ui/layout';
import { CheckCircleIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Skeleton, CloseButton, Button, Link, Spinner, Progress,
  Alert, AlertIcon, AlertTitle,
  Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  Text, HStack, Input, Heading,
  useToast, useDisclosure, 
} from '@chakra-ui/react';
import ShortAddress from './ShortAddress';
import { config, sleep, dataTemplates, TERMS, ABIS } from './util';
import { ddexContractAddress, mydaContractAddress } from './secrets';

export default function({onRefreshBalance}) {
  const toast = useToast();
  const { web3 } = useMoralis();
  const { user } = useMoralis();

  const [faucetWorking, setFaucetWorking] = useState(false);

  // eth tx state
  const [txConfirmationFaucet, setTxConfirmationFaucet] = useState(0);
  const [txHashFaucet, setTxHashFaucet] = useState(null);
  const [txErrorFaucet, setTxErrorFaucet] = useState(null);

  useEffect(async () => {
    if (txErrorFaucet) {
      console.error(txErrorFaucet);
      setFaucetWorking(false);
    } else {
      if (txHashFaucet && txConfirmationFaucet === config.txConfirmationsNeededLrg) {
        console.log('FAUCETTED');
        
        toast({
          title: "Congrats! the faucet has sent you some MYDA",          
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
      <Box></Box>

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
    </Stack>
  );
};
