import React, { useState, useEffect, useContext } from 'react';
import { useMoralis, useMoralisQuery, useNewMoralisObject } from 'react-moralis';
import { Box, Stack } from '@chakra-ui/layout';
import { CheckCircleIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Skeleton, CloseButton, Button, Link, Spinner, Progress,
  Alert, AlertIcon, AlertTitle, Heading,
  Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  Text, HStack, 
  useToast, useDisclosure, 
} from '@chakra-ui/react';
import ShortAddress from './UtilComps/ShortAddress';
import { config, dataTemplates, sleep } from './libs/util';
import { TERMS, ABIS, CHAIN_TX_VIEWER, CHAIN_TOKEN_SYMBOL } from './libs/util';
import { ChainMetaContext } from './libs/contexts';

export default function({onRfMount, onRefreshBalance}) {
  const chainMeta = useContext(ChainMetaContext);
  const toast = useToast();
  const { web3 } = useMoralis();
  const { user } = useMoralis();
  const { data: dataPacks, error: errorDataPackGet, isLoading } = useMoralisQuery("DataPack", query =>
    query.descending("createdAt") &&
    query.notEqualTo("txHash", null) &&
    query.equalTo("txNetworkId", chainMeta.networkId)
  );
  const { isSaving, error: errorOrderSave, save: saveDataOrder } = useNewMoralisObject('DataOrder');
  const [currBuyObject, setCurrBuyObject] = useState(null);
  const [buyProgress, setbuyProgress] = useState({s0: 0, s1: 0, s2: 0, s3: 0, s4: 0});
  const [buyProgressErr, setbuyProgressErr] = useState(null);
  const [otherUserDataSets, setOtherUserDataSets] = useState([]);

  // eth tx state
  const [txConfirmationAllowance, setTxConfirmationAllowance] = useState(0);
  const [txHashAllowance, setTxHashAllowance] = useState(null);
  const [txReceiptAllowance, setTxReceiptAllowance] = useState(null);
  const [txErrorAllowance, setTxErrorAllowance] = useState(null);
  const [txConfirmationTransfer, setTxConfirmationTransfer] = useState(0);
  const [txHashTransfer, setTxHashTransfer] = useState(null);
  const [txReceiptTransfer, setTxReceiptTransfer] = useState(null);
  const [txErrorTransfer, setTxErrorTransfer] = useState(null);
  const { isOpen: isProgressModalOpen, onOpen: onProgressModalOpen, onClose: onProgressModalClose } = useDisclosure();

  useEffect(() => {
    if (user && user.get('ethAddress') && dataPacks.length > 0) {
      setOtherUserDataSets(dataPacks.filter(i => (i.get('sellerEthAddress') !== user.get('ethAddress'))));
    }
  }, [dataPacks]);

  useEffect(async () => {
    if (txErrorAllowance) {
      console.error(txErrorAllowance);
    } else if (txHashAllowance && (txConfirmationAllowance === config.txConfirmationsNeededLrg)) {
      console.log('AUTHORISED');

      setbuyProgress(prevBuyProgress => ({...prevBuyProgress, s2: 1}));

      web3_ddexBuyDataPack(currBuyObject.dataPackId, currBuyObject.cost);
    }
  }, [txConfirmationAllowance, txHashAllowance, txErrorAllowance]);

  useEffect(async () => {
    if (txErrorTransfer) {
      console.error(txErrorTransfer);
    } else if (txHashTransfer && (txConfirmationTransfer === config.txConfirmationsNeededLrg)) {
      console.log('TRANSFERRED');

      setbuyProgress(prevBuyProgress => ({...prevBuyProgress, s3: 1}));

      finaliseSale();
    }
    
  }, [txConfirmationTransfer, txHashTransfer, txErrorTransfer]);

  useEffect(async() => {
    if (currBuyObject) {
      onProgressModalOpen();

      const isVerified = await web3_ddexVerifyData(currBuyObject.dataPackId, currBuyObject.dataHash);

      if (isVerified) {
        setbuyProgress(prevBuyProgress => ({...prevBuyProgress, s0: 1}));

        handleMinRequirementsCheck();
      } else {
        setbuyProgressErr('The data your are trying to purchase seems compromised (based on blockchain check)');
      }
    }
  }, [currBuyObject]);

  const buyOrderSubmit = objectId => {
    const dataPack = dataPacks.find(i => i.id === objectId);

    /*
      0) check if user has enough MYDA
      1) set the currBuyObject to state, "monitor" useEffect[currBuyObject] for next step
        2) web3_ddexVerifyData: call dex contract to verify data. if verified then call handleAllowanceCheck for next step
      3) handleAllowanceCheck checks if allowance will cover cost of transaction
        3.1) if NOT allowed then it web3_tokenApprove, "monitor" useEffect[txConfirmationAllowance] for next step, which is web3_ddexBuyDataPack
        3.2) if allowed then goes to next step, which is web3_ddexBuyDataPack
      4) "monitor" useEffect[txConfirmationTransfer] for next step, which is finaliseSale
      5) done... close off
    */

    setCurrBuyObject({
      dataPackId: objectId,
      dataHash: dataPack.get('dataHash'),
      dataFileUrl: dataPack.get('dataFile').url(),
      cost: TERMS.find(i => i.id === dataPack.get('termsOfUseId')).coin
    });
  }

  const web3_ddexVerifyData = async(dataPackId, dataHash) => {
    const ddexContract = new web3.eth.Contract(ABIS.ddex, chainMeta.contracts.ddex);
    let isVerified = false;

    try {
      isVerified = await ddexContract.methods.verifyData(dataPackId, dataHash).call();
    } catch(e) {
      console.log('🚀 ~ web3_ddexVerifyData ~ e', e);
    }

    return isVerified;
  }
  
  const handleMinRequirementsCheck = async() => {
    const isEligible = await web3_tokenBalanceOf();

    if (isEligible) {
      setbuyProgress(prevBuyProgress => ({...prevBuyProgress, s1: 1}));
      handleAllowanceCheck();
    } else {
      setbuyProgressErr(`Do you have enough ${CHAIN_TOKEN_SYMBOL(chainMeta.networkId)} for this?`);
    }
  }
  
  const handleAllowanceCheck = async() => {
    const isAllowed = await web3_tokenCheckAllowance();

    if (isAllowed) {
      setbuyProgress(prevBuyProgress => ({...prevBuyProgress, s2: 1}));

      web3_ddexBuyDataPack(currBuyObject.dataPackId, currBuyObject.cost);
    } else {
      web3_tokenApprove(currBuyObject.cost);
    }
  }

  const web3_tokenBalanceOf = async() => {
    const tokenContract = new web3.eth.Contract(ABIS.token, chainMeta.contracts.myda);
    let isEligible = false;
    
    try {
      const mydaBalance = await tokenContract.methods.balanceOf(user.get('ethAddress')).call();

      if (parseInt(mydaBalance, 10) >= currBuyObject.cost) {
        isEligible = true;
      }
    } catch(e) {
      console.log('🚀 ~ web3_tokenBalanceOf ~ e', e);
    }

    return isEligible;
  }

  const web3_tokenCheckAllowance = async() => {
    const tokenContract = new web3.eth.Contract(ABIS.token, chainMeta.contracts.myda);
    let isAllowed = false;
    
    const decimals = 18;
    const feeInMyda = currBuyObject.cost;
    const mydaInPrecision = web3.utils.toBN("0x"+(feeInMyda*10**decimals).toString(16));

    try {
      const allowedAmount = await tokenContract.methods.allowance(user.get('ethAddress'), chainMeta.contracts.ddex).call();

      if (allowedAmount >= mydaInPrecision) {
        isAllowed = true;
      }
    } catch(e) {
      console.log('🚀 ~ web3_tokenCheckAllowance ~ e', e);
    }

    return isAllowed;
  }

  const web3_ddexBuyDataPack = async(dataPackId, feeInMyda) => {
    const ddexContract = new web3.eth.Contract(ABIS.ddex, chainMeta.contracts.ddex);

    const decimals = 18;
    const mydaInPrecision = web3.utils.toBN("0x"+(feeInMyda*10**decimals).toString(16));

    const receipt = await ddexContract.methods.buyDataPack(dataPackId, mydaInPrecision).send({from: user.get('ethAddress')});

    // show a nice loading animation to user
    setTxHashTransfer(receipt.transactionHash);
    await sleep(2);
    setTxConfirmationTransfer(0.5);
    await sleep(2);
    setTxConfirmationTransfer(1);
    await sleep(2);

    if (receipt.status === true) {
      setTxConfirmationTransfer(2);
    } else {
      const txErr = new Error('Contract Error on method buyDataPack');
      console.error(txErr);
      
      setTxErrorTransfer(txErr);
    }
    
    // ddexContract.methods.buyDataPack(dataPackId, mydaInPrecision).send({from: user.get('ethAddress')})
    //   .on('transactionHash', function(hash) {
    //     console.log('Transfer transactionHash', hash);

    //     setTxHashTransfer(hash);
    //   })
    //   .on('receipt', function(receipt){
    //     console.log('Transfer receipt', receipt);

    //     setTxReceiptTransfer(receipt);
    //   })
    //   .on('confirmation', function(confirmationNumber, receipt){
    //     console.log('Transfer confirmation');
    //     console.log(confirmationNumber);

    //     setTxConfirmationTransfer(confirmationNumber);
    //   })
    //   .on('error', function(error, receipt) {
    //     console.log('Transfer error');
    //     console.log(receipt);
    //     console.log(error);

    //     setTxErrorTransfer(error);
    //   });
  }
  
  const web3_tokenApprove = async(feeInMyda) => {
    const tokenContract = new web3.eth.Contract(ABIS.token, chainMeta.contracts.myda);

    const decimals = 18;
    const mydaInPrecision = web3.utils.toBN("0x"+(feeInMyda*10**decimals).toString(16));

    const receipt = await tokenContract.methods.approve(chainMeta.contracts.ddex, mydaInPrecision).send({from: user.get('ethAddress')});

    // show a nice loading animation to user
    setTxHashAllowance(receipt.transactionHash);
    await sleep(2);
    setTxConfirmationAllowance(0.5);
    await sleep(2);
    setTxConfirmationAllowance(1);
    await sleep(2);

    if (receipt.status === true) {
      setTxConfirmationAllowance(2);
    } else {
      const txErr = new Error('Contract Error on method approve');
      console.error(txErr);
      
      setTxErrorAllowance(txErr);
    }

    // tokenContract.methods.approve(chainMeta.contracts.ddex, mydaInPrecision).send({from: user.get('ethAddress')})
    //   .on('transactionHash', function(hash) {
    //     console.log('Allowance transactionHash', hash);

    //     setTxHashAllowance(hash);
    //   })
    //   .on('receipt', function(receipt){
    //     console.log('Allowance receipt', receipt);

    //     setTxReceiptAllowance(receipt);
    //   })
    //   .on('confirmation', function(confirmationNumber, receipt){
    //     console.log('Allowance confirmation');
    //     console.log(confirmationNumber);

    //     setTxConfirmationAllowance(confirmationNumber);
    //   })
    //   .on('error', function(error, receipt) {
    //     console.log('Allowance error');
    //     console.log(receipt);
    //     console.log(error);

    //     setTxErrorAllowance(error);
    //   });
  }

  const finaliseSale = async() => {
    const newDataOrder = {...dataTemplates.dataOrder,
      dataPackId: currBuyObject.dataPackId,
      buyerEthAddress: user.get('ethAddress'),
      pricePaid: currBuyObject.cost,
      dataFileUrl: currBuyObject.dataFileUrl,
      dataHash: currBuyObject.dataHash,
      txHash: txHashTransfer,
      txNetworkId: chainMeta.networkId
    };

    await saveDataOrder(newDataOrder);

    setbuyProgress(prevBuyProgress => ({...prevBuyProgress, s4: 1}));

    toast({
      title: "Congrats! you have purchased rights to use the data pack",
      description: "Head over to the 'Purchased Data' tab to access the data",
      status: "success",
      duration: 4000,
      isClosable: true,
    });

    onCloseCleanUp();
  }

  function onCloseCleanUp() {
    onRfMount();
  }

  return (
    <Stack spacing={5}>
      <Heading size="lg">Buy Data</Heading>
      <Heading size="xs" opacity=".7">Browse, View and Buy Data Packs direct from your peers</Heading>

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
      {otherUserDataSets.length === 0 &&
        <Stack w="1000px">
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Box />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
        </Stack> || 
        <Box>
          <Table variant="simple" mt="3">
            <TableCaption>The following data packs are available for purchase</TableCaption>
            <Thead>
              <Tr>
                <Th>Data Pack ID</Th>
                <Th>Seller Address</Th>
                <Th>Data Preview</Th>
                <Th>Data Hash</Th>
                <Th>Terms of use</Th>
                <Th>Cost</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
            {otherUserDataSets.map((item) => <Tr key={item.id}>
              <Td><ShortAddress address={item.id} /></Td>
              <Td><ShortAddress address={item.get('sellerEthAddress')} /></Td>
              <Td><Text fontSize="sm">{item.get('dataPreview')}</Text></Td>
              <Td><ShortAddress address={item.get('dataHash')} /></Td>
              <Td><Text fontSize="sm">{item.get('termsOfUseId') && TERMS.find(i => i.id === item.get('termsOfUseId')).val}</Text></Td>
              <Td><Text fontSize="sm">{item.get('termsOfUseId') && TERMS.find(i => i.id === item.get('termsOfUseId')).coin} {CHAIN_TOKEN_SYMBOL(chainMeta.networkId)}</Text></Td>
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
                <Th></Th>
              </Tr>
            </Tfoot>
          </Table>        
        </Box>
      }

        <Modal
            isOpen={isProgressModalOpen}
            onClose={onCloseCleanUp}
            closeOnEsc={false} closeOnOverlayClick={false}
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Buy Progress</ModalHeader>
              <ModalBody pb={6}>
                <Stack spacing={5}>
                  <HStack>
                    {!buyProgress.s0 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                    <Text>Verifying data integrity on blockchain</Text>
                  </HStack>

                  <HStack>
                    {!buyProgress.s1 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                    <Text>Checking purchase requirements</Text>
                  </HStack>

                  <HStack>
                    {!buyProgress.s2 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                    <Text>Authorising purchase for {currBuyObject && currBuyObject.cost} {CHAIN_TOKEN_SYMBOL(chainMeta.networkId)}</Text>
                  </HStack>

                  {txHashAllowance && <Stack>
                    <Progress colorScheme="green" size="sm" value={(100 / config.txConfirmationsNeededLrg) * txConfirmationAllowance} />

                    <HStack>
                      <Text>Transaction </Text>
                      <ShortAddress address={txHashAllowance} />
                      <Link href={`${CHAIN_TX_VIEWER[chainMeta.networkId]}${txHashAllowance}`} isExternal> <ExternalLinkIcon mx="2px" /></Link>
                    </HStack>                    
                  </Stack>}

                  <HStack>
                    {!buyProgress.s3 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                    <Text>Making purchase</Text>
                  </HStack>

                  {txHashTransfer && <Stack>
                    <Progress colorScheme="green" size="sm" value={(100 / config.txConfirmationsNeededLrg) * txConfirmationTransfer} />

                    <HStack>
                      <Text>Transaction </Text>
                      <ShortAddress address={txHashTransfer} />
                      <Link href={`${CHAIN_TX_VIEWER[chainMeta.networkId]}${txHashTransfer}`} isExternal> <ExternalLinkIcon mx="2px" /></Link>
                    </HStack>                    
                  </Stack>}

                  <HStack>
                    {!buyProgress.s4 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                    <Text>Finalising sale</Text>
                  </HStack>                  

                  {txErrorAllowance && 
                    <Alert status="error">
                      <AlertIcon />
                      {txErrorAllowance.message && <AlertTitle>{txErrorAllowance.message}</AlertTitle>}
                      <CloseButton position="absolute" right="8px" top="8px" onClick={onCloseCleanUp} />
                    </Alert>
                  }

                  {txErrorTransfer && 
                    <Alert status="error">
                      <AlertIcon />
                      {txErrorTransfer.message && <AlertTitle>{txErrorTransfer.message}</AlertTitle>}
                      <CloseButton position="absolute" right="8px" top="8px" onClick={onCloseCleanUp} />
                    </Alert>
                  }

                  {buyProgressErr && 
                    <Alert status="error">
                      <AlertIcon />
                      <AlertTitle>{buyProgressErr}</AlertTitle>
                      <CloseButton position="absolute" right="8px" top="8px" onClick={onCloseCleanUp} />
                    </Alert>
                  }
                </Stack>
              </ModalBody>
            </ModalContent>
          </Modal>
    </Stack>
  );
};
