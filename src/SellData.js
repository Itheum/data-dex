import { useEffect, useState } from 'react';
import { useMoralis, useNewMoralisObject, useMoralisCloudFunction, useMoralisFile } from 'react-moralis';
import { Heading, Box, Stack } from '@chakra-ui/layout';
import { CheckCircleIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Button, Input, Text, HStack, Radio, RadioGroup, Spinner, Progress,
  Alert, AlertIcon, AlertTitle, CloseButton, Link,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  useToast, useDisclosure
} from '@chakra-ui/react';

import { dataTemplates, TERMS, ABIS } from './util';
import { ddexContractAddress } from './secrets';
import ShortAddress from './ShortAddress';

const txConfirmationsNeeded = 4;

export default function() {
  const { user } = useMoralis();
  const { web3, enableWeb3, isWeb3Enabled, isWeb3EnableLoading, web3EnableError } = useMoralis();
  const toast = useToast();
  const [sellerEthAddress, setSellerEthAddress] = useState(user.get('ethAddress'));
  const [sellerDataPreview, setSellerDataPreview] = useState('');
  const [sellerData, setSellerData] = useState('');
  const [termsOfUseId, setTermsOfUseId] = useState('2');
  const [saveProgress, setSaveProgress] = useState({s1: 1, s2: 0, s3: 0, s4: 0});
  const { isOpen: isProgressModalOpen, onOpen: onProgressModalOpen, onClose: onProgressModalClose } = useDisclosure();

  // eth tx state
  const [txConfirmation, setTxConfirmation] = useState(0);
  const [txHash, setTxHash] = useState(null);
  const [txError, setTxError] = useState(null);

  const { 
    error: errDataPackSave,
    isSaving,
    save: saveDataPack } = useNewMoralisObject('DataPack');

  const [savedDataPackMoralis, setSavedDataPackMoralis] = useState(null);

  const {
    error: errCfHashData,
    isLoading: loadingCfHashData,
    fetch: doCfHashData,
    data: dataCfHashData
  } = useMoralisCloudFunction("saveSellerDataToFile", { sellerData }, { autoFetch: false });

  const {
    error: errFileSave,
    isUploading: loadingFileSave,
    moralisFile: dataFileSave,
    saveFile,
  } = useMoralisFile();

  useEffect(async () => {
    if (dataFileSave && !loadingFileSave) {
      setSaveProgress({...saveProgress, s2: 1});
      await doCfHashData(); // get the hash of the file
    }
  }, [dataFileSave, errFileSave, loadingFileSave]);

  useEffect(async () => {
    // if 1st time, then these vars come as []
    if (!Array.isArray(dataCfHashData)) {
      setSaveProgress({...saveProgress, s3: 1});

      const {dataHash} = dataCfHashData;

      if (dataHash) {
        // create the datapack object
        const newDataPack = {...dataTemplates.dataPack, 
          dataPreview: sellerDataPreview,
          sellerEthAddress: user.get('ethAddress'),
          dataHash,
          dataFile: dataFileSave,
          termsOfUseId       
        };

        const newPack = await saveDataPack(newDataPack);

        setSavedDataPackMoralis(newPack);

        if (!errDataPackSave) {}
      }
    }

    if (errCfHashData) { // there was an error
      console.error('errCfHashData', errCfHashData);
    }

  }, [dataCfHashData, errCfHashData]);

  useEffect(async () => {
    if (savedDataPackMoralis && savedDataPackMoralis.id && savedDataPackMoralis.get('dataHash')) {
      ddexAdvertiseForSale(savedDataPackMoralis.id, savedDataPackMoralis.get('dataHash'));
    }
  }, [savedDataPackMoralis]);

  useEffect(async () => {
    if (txError) {
      console.error(txError);
    }

    if (txHash && txConfirmation === txConfirmationsNeeded) {
      savedDataPackMoralis.set('txHash', txHash);

      await savedDataPackMoralis.save();
      
      closeProgressModal();
    }
    
  }, [txConfirmation, txHash, txError]);

  const sellOrderSubmit = async () => {
    if (!sellerDataPreview || sellerDataPreview === '') {
      alert('You need to provide some dataPreview!');      
    } else {
      try {
        onProgressModalOpen();

        JSON.parse(sellerData); // valid JSON check?

        /*
          1) Save the file and get a Moralis File Ref - Y
          2) Get a sha256 hash for the data  - Y
          3) Save the Data Pack in Moralis and get the new datapackID
          4) Save to blockchain and get transactionHash (txHash), wait until 6 confirmations (show in UI)
          5) Update the Data Pack in Moralis with the transactionHash - DONE
        */

        await saveFile("sellerDatafile.json", {base64 : btoa(sellerData)});

        return;
      } catch(e) {
        alert('You need to provide some valid JSON for data!');
        return;
      }      
    }
  }

  const ddexAdvertiseForSale = async(dataPackId, dataHash) => {
    const ddexContract = new web3.eth.Contract(ABIS.ddex, ddexContractAddress);

    ddexContract.methods.advertiseForSale(dataPackId, dataHash).send({from: user.get('ethAddress')})
      .on('transactionHash', function(hash){
        console.log('transactionHash', hash);

        setTxHash(hash);
      })
      .on('receipt', function(receipt){
        console.log('receipt', receipt);
      })
      .on('confirmation', function(confirmationNumber, receipt){
        // https://ethereum.stackexchange.com/questions/51492/why-does-a-transaction-trigger-12-or-24-confirmation-events
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

  function closeProgressModal() {
    toast({
      title: "Data sent for sale",
      status: "success",
      duration: 4000,
      isClosable: true,
    });

    setSellerDataPreview('');
    onProgressModalClose();
  }

  return (
    <Stack spacing={5}>
      <Box></Box>
      {errDataPackSave && 
        <Alert status="error">
          <Box flex="1">
            <AlertIcon />
            {errDataPackSave.message && <AlertTitle>{errDataPackSave.message}</AlertTitle>}
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" />
        </Alert>
      }
      {errCfHashData && 
        <Alert status="error">
          <Box flex="1">
            <AlertIcon />
            {errCfHashData.message && <AlertTitle>{errCfHashData.message}</AlertTitle>}
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" />
        </Alert>
      }
      {errFileSave && 
        <Alert status="error">
          <Box flex="1">
            <AlertIcon />
            {errFileSave.message && <AlertTitle>{errFileSave.message}</AlertTitle>}
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" />
        </Alert>
      }
      <Input isDisabled placeholder="Seller Eth Address" value={sellerEthAddress} onChange={(event) => setSellerEthAddress(event.currentTarget.value)} />
      <Input placeholder="Data Preview" value={sellerDataPreview} onChange={(event) => setSellerDataPreview(event.currentTarget.value)} />
      <Input placeholder="Data" value={sellerData} onChange={(event) => setSellerData(event.currentTarget.value)} />
      <Text>{`{"foo": "bar"}`}</Text>
      
      <Stack>
        <Text>Terms of Use</Text>
        <HStack>
          <RadioGroup value={termsOfUseId} onChange={setTermsOfUseId}>
            <Stack spacing={5} direction="row">
              {TERMS.map((term) => {
                return (<Radio colorScheme="red" value={term.id}>
                  {term.val}
                </Radio>)
              })}
            </Stack>
          </RadioGroup>
        </HStack>
      </Stack>

      <Button isLoading={(loadingFileSave || loadingCfHashData || isSaving)} onClick={() => sellOrderSubmit(sellerEthAddress, sellerDataPreview)}>Place for Sale</Button>

      <Box>
        <br />
        {web3EnableError && <Heading>{web3EnableError}</Heading>}
        <Button onClick={() => ddexAdvertiseForSale('foo', 'bar')}>Contract Test</Button>
      </Box>

      <Modal
        isOpen={isProgressModalOpen}
        onClose={closeProgressModal}
        closeOnEsc={false} closeOnOverlayClick={false} isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sell Progress</ModalHeader>
          <ModalBody pb={6}>
            <Stack spacing={5}>
              <HStack>
                {!saveProgress.s1 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                <Text>Building data file</Text>
              </HStack>

              <HStack>
                {!saveProgress.s2 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                <Text>Generating tamper-proof data signature</Text>
              </HStack>

              <HStack>
                {!saveProgress.s3 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                <Text>Saving to storage</Text>
              </HStack>

              <HStack>
                {!saveProgress.s4 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                <Text>Advertising for sale on blockchain</Text>
              </HStack>

              {txHash && <Stack>
                <Progress colorScheme="green" size="sm" value={(100 / txConfirmationsNeeded) * txConfirmation} />

                <HStack>
                  <Text>Transaction </Text>
                  <ShortAddress address={txHash} />
                  <Link href={`https://ropsten.etherscan.io/tx/${txHash}`} isExternal> View <ExternalLinkIcon mx="2px" /></Link>
                </HStack>

                {txError && 
                  <Alert status="error">
                    <Box flex="1">
                      <AlertIcon />
                      {txError.message && <AlertTitle>{txError.message}</AlertTitle>}
                    </Box>
                    <CloseButton position="absolute" right="8px" top="8px" />
                  </Alert>
                }
              </Stack>}
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Stack>
  );
};

