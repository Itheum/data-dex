import { useEffect, useState } from 'react';
import { useMoralis, useNewMoralisObject, useMoralisCloudFunction, useMoralisFile } from 'react-moralis';
import { Heading, Box, Stack } from '@chakra-ui/layout';
import { CheckCircleIcon, SpinnerIcon } from '@chakra-ui/icons';
import {
  Button, Input, Text, HStack, Radio, RadioGroup, Spinner,
  Alert, AlertIcon, AlertTitle, CloseButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  useToast, useDisclosure
} from '@chakra-ui/react';

import { dataTemplates, TERMS } from './util';

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

  const { 
    error: errDataPackSave,
    isSaving,
    save: saveDataPack } = useNewMoralisObject('DataPack');

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
    
        console.log(newDataPack);

        await saveDataPack(newDataPack);

        if (!errDataPackSave) {
          // setSaveProgress({...saveProgress, s4: 1});

          toast({
            title: "Data sent for sale",
            status: "success",
            duration: 4000,
            isClosable: true,
          });

          setSellerDataPreview(''); 
        }
      }
    }

    if (errCfHashData) { // there was an error
      console.error('errCfHashData', errCfHashData);
    }

  }, [dataCfHashData, errCfHashData]);

  const sellOrderSubmit = async () => {
    if (!sellerDataPreview || sellerDataPreview === '') {
      alert('You need to provide some dataPreview!')
    } else {
      try {
        onProgressModalOpen();

        JSON.parse(sellerData); // valid JSON check?
        console.log('🚀 ~ sellOrderSubmit ~ sellerData', sellerData);

        /*
          1) Save the file and get a Moralis File Ref - Y
          2) Get a sha256 hash for the data  - Y
          3) Save the Data Pack in Moralis
          4) Save to blockchain and get transactionHash (txHash), wait until 6 confirmations (show in UI)
        */

        await saveFile("sellerDatafile.json", {base64 : btoa(sellerData)});

        return;
      } catch(e) {
        alert('You need to provide some valid JSON for data!');
        return;
      }      
    }
  }

  const testContract = async() => {
    const abi = [
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "firstName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "lastName",
            "type": "string"
          }
        ],
        "name": "addPlayer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "playerAddress",
            "type": "address"
          }
        ],
        "name": "getPlayerLevel",
        "outputs": [
          {
            "internalType": "enum myGame.Level",
            "name": "",
            "type": "uint8"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "playerCount",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "players",
        "outputs": [
          {
            "internalType": "address",
            "name": "myAddress",
            "type": "address"
          },
          {
            "internalType": "enum myGame.Level",
            "name": "playerLevel",
            "type": "uint8"
          },
          {
            "internalType": "string",
            "name": "firstName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "lastName",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];

    const contract = new web3.eth.Contract(abi, '0x8648db3364225eFaBC10644E6fD76ba9EB921a5B');
    console.log('🚀 ~ testContract ~ contract', contract);
    
    // contract.methods.playerCount().call(function(err, res){
    //   console.log('res', res);
    // });

    contract.methods.addPlayer("Alex", "Jones").send({from: user.get('ethAddress')})
      .on('transactionHash', function(hash){
          console.log('transactionHash', hash);
      })
      .on('receipt', function(receipt){
        console.log('receipt', receipt);
      })
      .on('confirmation', function(confirmationNumber, receipt){
        // https://ethereum.stackexchange.com/questions/51492/why-does-a-transaction-trigger-12-or-24-confirmation-events
        console.log('confirmation');
        console.log(confirmationNumber);
        console.log(receipt);
      })
      .on('error', function(error, receipt) {
        console.log('error');
        console.log(receipt);
        console.log(error);
      });
  }

  function onCloseCleanUp() {
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
        <Button onClick={() => testContract()}>Contract Test</Button>
      </Box>

      <Modal
        isOpen={isProgressModalOpen}
        onClose={onCloseCleanUp}
        closeOnEsc={false} closeOnOverlayClick={true}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Progress</ModalHeader>
          <ModalBody pb={6}>
            <Stack spacing={5}>
              <HStack>
                {!saveProgress.s1 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                <Text>Storing data file</Text>
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
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Stack>
  );
};

