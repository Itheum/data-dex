import React, { useState, useEffect } from 'react';
import { useMoralis, useMoralisQuery, useNewMoralisObject } from 'react-moralis';
import { Box, Stack } from '@chakra-ui/layout';
import { CheckCircleIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Skeleton, CloseButton, Button, Link, Spinner, Progress,
  Alert, AlertIcon, AlertTitle,
  Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  Text, HStack, 
  useToast, useDisclosure, 
} from '@chakra-ui/react';
import ShortAddress from './ShortAddress';
import { TERMS, ABIS } from './util';
import { ddexContractAddress, mydaContractAddress } from './secrets';

const txConfirmationsNeeded = 4;

export default function() {
  const toast = useToast();
  const { web3 } = useMoralis();
  const { user } = useMoralis();
  const { data: dataPacks, error: errorDataPackGet, isLoading } = useMoralisQuery("DataPack", query =>
    query.ascending("createdAt")
  );
  const { isSaving, error: errorOrderSave, save: saveDataOrder } = useNewMoralisObject('DataOrder');
  const [reasonToBuy, setReasonToBuy] = useState('');
  const [currBuyObject, setCurrBuyObject] = useState(null);
  const [buyProgress, setbuyProgress] = useState({s1: 1, s2: 0, s3: 0, s4: 0});

  // eth tx state
  const [txConfirmation, setTxConfirmation] = useState(0);
  const [txHash, setTxHash] = useState(null);
  const [txError, setTxError] = useState(null);

  const { isOpen: isProgressModalOpen, onOpen: onProgressModalOpen, onClose: onProgressModalClose } = useDisclosure();

  useEffect(async () => {
    if (txError) {
      console.error(txError);
    }

    if (txHash && txConfirmation === txConfirmationsNeeded) {
      alert('AUTHORISED');
    }
    
  }, [txConfirmation, txHash, txError]);

  const buyOrderSubmit = objectId => {
    const dataPack = dataPacks.find(i => i.id === objectId);
    console.log('🚀 ~ buyOrderSubmit ~ dataPack', dataPack);

    setCurrBuyObject({
      dataPackId: objectId,
      dataHash: dataPack.get('dataHash'),
      cost: TERMS.find(i => i.id === dataPack.get('termsOfUseId')).coin
    });
  }

  useEffect(() => {
    if (currBuyObject) {
      onProgressModalOpen();

      ddexVerifyData(currBuyObject.dataPackId, currBuyObject.dataHash);
    }
  }, [currBuyObject]);

  function onCloseCleanUp() {
    setCurrBuyObject(null);
    setReasonToBuy('');
    onProgressModalClose();
  }

  const handleAllowanceCoodination = async() => {
    const isAllowed = await tokenCheckAllowance();
    console.log('🚀 ~ ddexContract.methods.verifyData ~ isAllowed', isAllowed);

    if (isAllowed) {
      setbuyProgress({...buyProgress, s3: 1});
    } else {
      tokenAuthorise(currBuyObject.cost);
    }
  }

  const ddexVerifyData = async(dataPackId, dataHash) => {
    const ddexContract = new web3.eth.Contract(ABIS.ddex, ddexContractAddress);

    ddexContract.methods.verifyData(dataPackId, dataHash).call(function(err, res){
      console.log('res', res);
      setbuyProgress({...buyProgress, s2: 1});

      handleAllowanceCoodination();
    });
  }

  const ddexBuyDataPack = async(dataPackId, dataHash) => {
    const ddexContract = new web3.eth.Contract(ABIS.ddex, ddexContractAddress);
    
    ddexContract.methods.buyDataPack(dataPackId, dataHash).send({from: user.get('ethAddress')})
      .on('transactionHash', function(hash) {
        console.log('transactionHash', hash);

        setTxHash(hash);
      })
      .on('receipt', function(receipt){
        console.log('receipt', receipt);
      })
      .on('confirmation', function(confirmationNumber, receipt){
        console.log('confirmation');
        console.log(confirmationNumber);

        setTxConfirmation(confirmationNumber);
      })
      .on('error', function(error, receipt) {
        console.log('error');
        console.log(receipt);
        console.log(error);

        setTxError(error);
      });
  }

  const tokenCheckAllowance = async() => {
    const tokenContract = new web3.eth.Contract(ABIS.token, mydaContractAddress);
    let isAllowed = false;

    try {
      isAllowed = await tokenContract.methods.allowance(user.get('ethAddress'), '1').call();
      console.log('🚀 ~ tokenCheckAllowance ~ val', isAllowed);
    } catch(e) {
      console.log('🚀 ~ tokenCheckAllowance ~ e', e);
    }

    return isAllowed;
  }

  const tokenAuthorise = async(amount) => {
    const tokenContract = new web3.eth.Contract(ABIS.token, mydaContractAddress);

    tokenContract.methods.approve(ddexContractAddress, amount).send({from: user.get('ethAddress')})
      .on('transactionHash', function(hash) {
        console.log('transactionHash', hash);

        setTxHash(hash);
      })
      .on('receipt', function(receipt){
        console.log('receipt', receipt);
      })
      .on('confirmation', function(confirmationNumber, receipt){
        console.log('confirmation');
        console.log(confirmationNumber);

        setTxConfirmation(confirmationNumber);
      })
      .on('error', function(error, receipt) {
        console.log('error');
        console.log(receipt);
        console.log(error);

        setTxError(error);
      });
  }

  return (
    <Stack spacing={5}>
      <Box></Box>
      {errorDataPackGet && 
        <Alert status="error">
          <Box flex="1">
            <AlertIcon />
            <AlertTitle>{errorDataPackGet.message}</AlertTitle>
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" />
        </Alert>
      }
      {errorOrderSave && 
        <Alert status="error">
          <Box flex="1">
            <AlertIcon />
            <AlertTitle>{errorOrderSave.message}</AlertTitle>
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" />
        </Alert>
      }
      {(isLoading || dataPacks.length === 0) && <Stack>
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack> || 
        <Box>
          <Table variant="simple">
            <TableCaption>The following data packs are available for purchase</TableCaption>
            <Thead>
              <Tr>
                <Th>Data Pack ID</Th>
                <Th>Seller Address</Th>
                <Th>Data Preview</Th>
                <Th>Data Hash</Th>
                <Th>Terms of use</Th>
                <Th>Cost</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {dataPacks.filter(i => (i.get('sellerEthAddress') !== user.get('ethAddress'))).map((item) => <Tr key={item.id}>
                <Td>{item.id}</Td>
                <Td><ShortAddress address={item.get('sellerEthAddress')} /></Td>
                <Td>{item.get('dataPreview')}</Td>
                <Td><ShortAddress address={item.get('dataHash')} /></Td>
                <Td>{item.get('termsOfUseId') && TERMS.find(i => i.id === item.get('termsOfUseId')).val}</Td>
                <Td>{item.get('termsOfUseId') && TERMS.find(i => i.id === item.get('termsOfUseId')).coin} MYDA</Td>
                <Td><Button isLoading={false} colorScheme="green" onClick={() => buyOrderSubmit(item.id)}>Buy</Button></Td>
              </Tr>)}
            </Tbody>
            <Tfoot>
              <Tr>
              <Th>Data Pack ID</Th>
              <Th>Seller Address</Th>
              <Th>Data Preview</Th>
              <Th>Data Hash</Th>
              <Th>Terms of use</Th>
              <Th>Cost</Th>
              <Th>Actions</Th>
              </Tr>
            </Tfoot>
          </Table>
        
          <Modal
            isOpen={isProgressModalOpen}
            onClose={onCloseCleanUp} isCentered
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Buy Progress</ModalHeader>
              <ModalBody pb={6}>
                <Stack spacing={5}>
                  <HStack>
                    {!buyProgress.s1 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                    <Text>Verifying data on blockchain</Text>
                  </HStack>

                  <HStack>
                    {!buyProgress.s2 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                    <Text>Authorising purchase for {currBuyObject && currBuyObject.cost} MYDA</Text>
                  </HStack>

                  <HStack>
                    {!buyProgress.s3 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                    <Text>Making purchase</Text>
                  </HStack>

                  <HStack>
                    {!buyProgress.s4 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                    <Text>Finalising sale</Text>
                  </HStack>

                  {txHash && <Stack>
                    <Progress colorScheme="green" size="sm" value={(100 / txConfirmationsNeeded) * txConfirmation} />

                    <HStack>
                      <Text>Transaction </Text>
                      <ShortAddress address={txHash} />
                      <Link href={`https://ropsten.etherscan.io/tx/${txHash}`} isExternal> View <ExternalLinkIcon mx="2px" /></Link>
                    </HStack>                    
                  </Stack>}

                  {txError && 
                    <Alert status="error">
                      <Box flex="1">
                        <AlertIcon />
                        {txError.message && <AlertTitle>{txError.message}</AlertTitle>}
                      </Box>
                      <CloseButton position="absolute" right="8px" top="8px" />
                    </Alert>
                  }
                </Stack>
              </ModalBody>
            </ModalContent>
          </Modal>
        </Box>}
    </Stack>
  );
};
