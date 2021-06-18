import moment from 'moment';
import { useDropzone } from 'react-dropzone';
import { useContext, useMemo, useEffect, useState, useCallback } from 'react';
import { useMoralis, useNewMoralisObject, useMoralisCloudFunction, useMoralisFile } from 'react-moralis';
import { Heading, Box, Stack } from '@chakra-ui/layout';
import { CheckCircleIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Button, Input, Text, HStack, Radio, RadioGroup, Spinner, Progress,
  Alert, AlertIcon, AlertTitle, CloseButton, Link, Code, CircularProgress,
  Image, Badge, Wrap, Collapse,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, 
  useToast, useDisclosure
} from '@chakra-ui/react';

import { config, dataTemplates } from './util';
import { TERMS, ABIS, CHAIN_TX_VIEWER, CHAIN_TOKEN_SYMBOL } from './util';
import { tempCloudApiKey } from './secrets';
import ShortAddress from './ShortAddress';
import { ChainMetaContext } from './App';

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out'
};

const activeStyle = {
  borderColor: '#2196f3'
};

const acceptStyle = {
  borderColor: '#00e676'
};

const rejectStyle = {
  borderColor: '#ff1744'
};

export default function({itheumAccount}) {
  const chainMeta = useContext(ChainMetaContext);
  const { user } = useMoralis();
  const { web3, enableWeb3, isWeb3Enabled, isWeb3EnableLoading, web3EnableError } = useMoralis();
  const toast = useToast();
  const [sellerEthAddress, setSellerEthAddress] = useState(user.get('ethAddress'));
  const [sellerDataPreview, setSellerDataPreview] = useState('');
  const [sellerData, setSellerData] = useState('');
  const [isArbirData, setIsArbirData] = useState(false);
  const [termsOfUseId, setTermsOfUseId] = useState('2');
  const [saveProgress, setSaveProgress] = useState({s1: 1, s2: 0, s3: 0, s4: 0});
  const { isOpen: isProgressModalOpen, onOpen: onProgressModalOpen, onClose: onProgressModalClose } = useDisclosure();
  const { isOpen: isDrawerOpen, onOpen: onOpenDrawer, onClose: onCloseDrawer } = useDisclosure();
  const [currSellObject, setCurrSellObject] = useState(null);
  const [fetchDataLoading, setFetchDataLoading] = useState(true);
  const [showCode, setShowCode] = useState(false);

  // eth tx state
  const [txConfirmation, setTxConfirmation] = useState(0);
  const [txReceipt, setTxReceipt] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [txError, setTxError] = useState(null);

  const getDataForSale = programId => {
    onOpenDrawer();

    if (programId) {
      const selObj = {...itheumAccount.programsAllocation.find(i => i.program === programId), ...itheumAccount._lookups.programs[programId]};
      setCurrSellObject(selObj);

      fetchData(selObj);
    } else {
      setIsArbirData(true);
    }
  }

  const fetchData = async selObj => {
    const myHeaders = new Headers();
    myHeaders.append("authorization", tempCloudApiKey);

    const requestOptions = {
      method: 'GET',
      headers: myHeaders
    };

    const res = await fetch(`https://itheumapi.com/readings/${selObj.shortId}/${selObj.type}/range?fromTs=${selObj.fromTs}&toTs=${selObj.toTs}`, requestOptions);
    const data = await res.json();

    if (data && data.length > 0) {
      setSellerDataPreview(`${data.length} datapoints from the ${selObj.programName} 
program collected from ${moment(selObj.fromTs).format(config.dateStr)} to ${moment(selObj.toTs).format(config.dateStr)}`);
      setSellerData(JSON.stringify(data));
    }

    setFetchDataLoading(false);
  }

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
          termsOfUseId,
          txNetworkId: chainMeta.networkId
        };

        const newPack = await saveDataPack(newDataPack);

        setSavedDataPackMoralis(newPack);
      }
    }

    if (errCfHashData) { // there was an error
      console.error('errCfHashData', errCfHashData);
    }

  }, [dataCfHashData, errCfHashData]);

  useEffect(async () => {
    if (savedDataPackMoralis && savedDataPackMoralis.id && savedDataPackMoralis.get('dataHash')) {
      web3_ddexAdvertiseForSale(savedDataPackMoralis.id, savedDataPackMoralis.get('dataHash'));
    }
  }, [savedDataPackMoralis]);

  useEffect(async () => {
    if (txError) {
      console.error(txError);
    // } else if (txHash && (txReceipt && txReceipt.status) || (txConfirmation === config.txConfirmationsNeededSml)) {
    } else if (txHash && txConfirmation === config.txConfirmationsNeededSml) {
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

  const web3_ddexAdvertiseForSale = async(dataPackId, dataHash) => {
    const ddexContract = new web3.eth.Contract(ABIS.ddex, chainMeta.contracts.ddex);

    ddexContract.methods.advertiseForSale(dataPackId, dataHash).send({from: user.get('ethAddress')})
      .on('transactionHash', function(hash){
        console.log('transactionHash', hash);

        setTxHash(hash);
      })
      .on('receipt', function(receipt){
        console.log('receipt', receipt);

        setTxReceipt(receipt);
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

    // reset data state
    setSellerDataPreview('');
    setSellerData('');
    setIsArbirData(false);
    setTermsOfUseId('2');
    setSaveProgress({s1: 1, s2: 0, s3: 0, s4: 0});

    onProgressModalClose();
    closeDrawer();
  }

  function closeDrawer() {
    setCurrSellObject(null);
    setFetchDataLoading(true);
    onCloseDrawer();
  }

  const handleCodeShowToggle = () => setShowCode(!showCode);

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()

      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = (e) => {
        const resStr = reader.result
        setSellerData(resStr);
      }
      reader.readAsText(file)
    })
    
  }, [])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({onDrop});

  const style = useMemo(() => ({
    ...baseStyle,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [
    isDragActive,
    isDragReject,
    isDragAccept
  ]);

  return (
    <Stack spacing={5}>
      <Heading size="lg">Sell Data</Heading>

      {(itheumAccount && itheumAccount.programsAllocation.length > 0) && 
        <Wrap shouldWrapChildren={true} wrap="wrap" spacing={5}>
          {itheumAccount.programsAllocation.map(item => (
            <Box key={item.program} maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
              <Image src={`https://itheum-static.s3-ap-southeast-2.amazonaws.com/dex-${itheumAccount._lookups.programs[item.program].img}.png`} alt="" />

              <Box p="6">
                <Box d="flex" alignItems="baseline">
                  <Badge borderRadius="full" px="2" colorScheme="teal"> New</Badge>
                  <Box
                    mt="1"
                    ml="2"
                    fontWeight="semibold"
                    as="h4"
                    lineHeight="tight"
                    isTruncated>
                    {itheumAccount._lookups.programs[item.program].programName}
                  </Box>
                </Box>
                <Button mt="3" colorScheme="green" variant="outline" onClick={() => getDataForSale(item.program)}>Sell Program Data</Button>
            </Box>
            
            </Box>
          ))}          
        </Wrap>}
       
        <Wrap shouldWrapChildren={true} wrap="wrap" spacing={5}>
          <Box maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
            <Image src="https://itheum-static.s3-ap-southeast-2.amazonaws.com/dex-any.png" alt="" />

            <Box p="6">
              <Box d="flex" alignItems="baseline">
                <Box
                  mt="1"
                  fontWeight="semibold"
                  as="h4"
                  lineHeight="tight"
                  isTruncated>
                  Sell Any Arbitrary Data Set
                </Box>
              </Box>
              <Button mt="3" colorScheme="green" variant="outline" onClick={() => getDataForSale()}>Sell Data</Button>
            </Box>     
        </Box>

        <Box maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
            <Image src="https://itheum-static.s3-ap-southeast-2.amazonaws.com/dex-any-fb.png" alt="" />

            <Box p="6">
              <Box d="flex" alignItems="baseline">
                <Box
                  mt="1"
                  fontWeight="semibold"
                  as="h4"
                  lineHeight="tight"
                  isTruncated>
                  Sell My Facebook Data
                </Box>
              </Box>
              <Button mt="3" colorScheme="green" variant="outline" onClick={() => getDataForSale()}>Sell Data</Button>
            </Box>     
        </Box>
      </Wrap>

      <Drawer onClose={closeDrawer} isOpen={isDrawerOpen} size="xl" closeOnEsc={false} closeOnOverlayClick={false}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <HStack spacing="5">
              <CloseButton size="lg" onClick={closeDrawer} />
              {currSellObject && <Stack><Text fontSize="2xl">Sell data from your <Text color="teal" fontSize="2xl">{currSellObject.programName}</Text> program</Text></Stack>}
            </HStack>
          </DrawerHeader>
          <DrawerBody>                        
            {(fetchDataLoading && !isArbirData) && <CircularProgress isIndeterminate color="teal" size="100" thickness="5px" /> ||
            
            <Stack spacing={5} mt="5">
              <Text fontWeight="bold">Data Payload Preview/Summary:</Text>                                         
              <Input placeholder="Data Preview" value={sellerDataPreview} onChange={(event) => setSellerDataPreview(event.currentTarget.value)} />
                
              <Text fontWeight="bold">Data Payload for Sale:</Text>
              
              {isArbirData && <>
              <Box {...getRootProps({style})}>
                <input {...getInputProps()} />
                <Text>Drag 'n' drop a .json file here, or click to select a file</Text>
              </Box>
              </>}
              
              {sellerData && <>
              <Collapse startingHeight={150} in={showCode}>
                <Code>{sellerData}</Code>
              </Collapse>

              <Button onClick={handleCodeShowToggle} mt="1rem">
                Show {showCode ? "Less" : "More"}
              </Button></>}
              
              <Stack mt="10" spacing="5">
                  <Text fontWeight="bold">Terms of Use:</Text>
                  <Stack>
                    <RadioGroup value={termsOfUseId} onChange={setTermsOfUseId}>
                      <Stack spacing={5}>
                        {TERMS.map((term) => {
                          return (<Radio key={term.id} colorScheme="red" value={term.id}>
                            {term.val}
                          </Radio>)
                        })}
                      </Stack>
                    </RadioGroup>
                  </Stack>
                </Stack>

              <Text fontSize="xl" fontWeight="bold">Estimated Earnings:
                <Badge ml="1" fontSize="0.8em" colorScheme="green">2 {CHAIN_TOKEN_SYMBOL(chainMeta.networkId)}</Badge>
              </Text>

              <Button mt="5"colorScheme="teal" isLoading={(loadingFileSave || loadingCfHashData || isSaving)} onClick={() => sellOrderSubmit(sellerEthAddress, sellerDataPreview)}>Place for Sale</Button>
            </Stack>}

            <Modal
              isOpen={isProgressModalOpen}
              onClose={closeProgressModal}
              closeOnEsc={false} closeOnOverlayClick={false}
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
                      {/* <Progress colorScheme="green" fontSize="sm" value={(txReceipt && txReceipt.status) ? 100 : (100 / config.txConfirmationsNeededSml) * txConfirmation} /> */}
                      <Progress colorScheme="green" fontSize="sm" value={(100 / config.txConfirmationsNeededSml) * txConfirmation} />

                      <HStack>
                        <Text>Transaction </Text>
                        <ShortAddress address={txHash} />
                        <Link href={`${CHAIN_TX_VIEWER[chainMeta.networkId]}${txHash}`} isExternal> <ExternalLinkIcon mx="2px" /></Link>
                      </HStack>

                      {txError && 
                        <Alert status="error">
                          <AlertIcon />
                          {txError.message && <AlertTitle>{txError.message}</AlertTitle>}
                          <CloseButton position="absolute" right="8px" top="8px" onClick={closeProgressModal} />
                        </Alert>
                      }                      
                    </Stack>}
                  
                    {errDataPackSave && 
                      <Alert status="error">
                        <Box flex="1">
                          <AlertIcon />
                          {errDataPackSave.message && <AlertTitle>{errDataPackSave.message}</AlertTitle>}
                        </Box>
                      </Alert>
                    }

                    {errCfHashData && 
                      <Alert status="error">
                        <Box flex="1">
                          <AlertIcon />
                          {errCfHashData.message && <AlertTitle>{errCfHashData.message}</AlertTitle>}
                        </Box>
                      </Alert>
                    }

                    {errFileSave && 
                      <Alert status="error">
                        <Box flex="1">
                          <AlertIcon />
                          {errFileSave.message && <AlertTitle>{errFileSave.message}</AlertTitle>}
                        </Box>
                      </Alert>
                    }
                  </Stack>
                </ModalBody>
              </ModalContent>
            </Modal>
            
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Stack>
  );
};
