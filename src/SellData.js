import moment from 'moment';
import { useDropzone } from 'react-dropzone';
import { useContext, useMemo, useEffect, useState, useCallback } from 'react';
import { useMoralis, useNewMoralisObject, useMoralisCloudFunction, useMoralisFile } from 'react-moralis';
import { Heading, Box, Stack } from '@chakra-ui/layout';
import { CheckCircleIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Button, Input, Text, HStack, Radio, RadioGroup, Spinner, Progress,
  Alert, AlertIcon, AlertTitle, CloseButton, Link, Code, CircularProgress,
  Image, Badge, Wrap, Collapse, Flex, Textarea, Tooltip,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  useToast, useDisclosure
} from '@chakra-ui/react';
import { FaUncharted } from "react-icons/fa";
import { AiOutlinePicture } from "react-icons/ai";
import { GiVintageRobot } from "react-icons/gi";
import { MdOutlinePattern } from "react-icons/md";

import { config, dataTemplates, sleep } from './libs/util';
import { TERMS, ABIS, CHAIN_TX_VIEWER, CHAIN_TOKEN_SYMBOL } from './libs/util';
import ShortAddress from './UtilComps/ShortAddress';
import IconButton from './UtilComps/IconButton';
import { ChainMetaContext } from './libs/contexts';
import { log } from 'async';

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

export default function({onRfMount, itheumAccount}) {
  const chainMeta = useContext(ChainMetaContext);
  const { user } = useMoralis();
  const { web3, enableWeb3, isWeb3Enabled, isWeb3EnableLoading, web3EnableError } = useMoralis();
  const toast = useToast();
  const [sellerDataPreview, setSellerDataPreview] = useState('');
  const [sellerDataNFTDesc, setSellerDataNFTDesc] = useState('');
  const [dataNFTCopies, setDataNFTCopies] = useState(1);
  const [dataNFTRoyalty, setDataNFTRoyalty] = useState(0);
  const [dataNFTFeeInMyda, setDataNFTFeeInMyda] = useState(0);
  const [sellerData, setSellerData] = useState('');
  const [isArbirData, setIsArbirData] = useState(false);
  const [termsOfUseId, setTermsOfUseId] = useState('2');
  const [saveProgress, setSaveProgress] = useState({s1: 0, s2: 0, s3: 0, s4: 0});
  const [saveProgressNFT, setSaveProgressNFT] = useState({n1: 0, n2: 0, n3: 0});
  const { isOpen: isProgressModalOpen, onOpen: onProgressModalOpen, onClose: onProgressModalClose } = useDisclosure();
  const { isOpen: isDrawerOpen, onOpen: onOpenDrawer, onClose: onCloseDrawer } = useDisclosure();
  const [currSellObject, setCurrSellObject] = useState(null);
  const [fetchDataLoading, setFetchDataLoading] = useState(true);
  const [showCode, setShowCode] = useState(false);
  const [drawerInMintNFT, setDrawerInMintNFT] = useState(false);
  const [NFTArtStyle, setNFTArtStyle] = useState(1);
  const [dataNFTImg, setDataNFTImg] = useState(null);
  const [newNFTId, setNewNFTId] = useState(null);

  // eth tx state
  const [txConfirmation, setTxConfirmation] = useState(0);
  const [txHash, setTxHash] = useState(null);
  const [txError, setTxError] = useState(null);
  const [txNFTConfirmation, setTxNFTConfirmation] = useState(0);
  const [txNFTHash, setTxNFTHash] = useState(null);
  const [txNFTError, setTxNFTError] = useState(null);


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
    myHeaders.append("authorization", process.env.REACT_APP_ENV_ITHEUMAPI_M2M_KEY);

    const requestOptions = {
      method: 'GET',
      headers: myHeaders
    };

    const res = await fetch(`https://itheumapi.com/readings/${selObj.shortId}/${selObj.type}/range?fromTs=${selObj.fromTs}&toTs=${selObj.toTs}`, requestOptions);
    const data = await res.json();

    if (data && data.length > 0) {
      const previewStr = `${data.length} datapoints from the ${selObj.programName} program collected from ${moment(selObj.fromTs).format(config.dateStr)} to ${moment(selObj.toTs).format(config.dateStr)}`;
      
      setSellerDataPreview(previewStr);
      setSellerDataNFTDesc(previewStr)
      setSellerData(JSON.stringify(data));
    }

    setFetchDataLoading(false);
  }

  const { 
    error: errDataPackSave,
    isSaving,
    save: saveDataPack } = useNewMoralisObject('DataPack');

  const { 
    error: errDataNFTSave,
    save: saveDataNFT } = useNewMoralisObject('DataNFT');

  const [savedDataPackMoralis, setSavedDataPackMoralis] = useState(null);
  const [savedDataNFTMoralis, setSavedDataNFTMoralis] = useState(null);

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

  const {
    error: errNFTMetaDataFile,
    isUploading: loadingNFTMetaDataFile,
    moralisFile: NFTMetaDataFile,
    saveFile: saveNFTMetaDataFile,
  } = useMoralisFile();

  useEffect(() => {
    console.log('MOUNT Sell');
  }, []);

  useEffect(async () => {
    if (dataFileSave && !loadingFileSave) {
      setSaveProgress(prevSaveProgress => ({...prevSaveProgress, s1: 1}));

      await doCfHashData(); // get the hash of the file
    }
  }, [dataFileSave, errFileSave, loadingFileSave]);

  useEffect(async () => {
    if (NFTMetaDataFile && !loadingNFTMetaDataFile) {
      setSaveProgressNFT(prevSaveProgress => ({...prevSaveProgress, n1: 1}));

      await web3_dnftCreateNFT(NFTMetaDataFile.url());
    }
  }, [NFTMetaDataFile, loadingNFTMetaDataFile]);

  useEffect(() => {
    async function updateNFTMoralisObject() {      
      savedDataNFTMoralis.set('metaDataFile', NFTMetaDataFile.url());
      savedDataNFTMoralis.set('txNFTId', newNFTId);
      savedDataNFTMoralis.set('txHash', txNFTHash);
      savedDataNFTMoralis.set('nftImgUrl', dataNFTImg);

      await savedDataNFTMoralis.save();
      
      setSaveProgressNFT(prevSaveProgress => ({...prevSaveProgress, n3: 1}));

      sleep(3);
      closeProgressModal();
    }

    if (newNFTId) {
      updateNFTMoralisObject();
    }
  }, [newNFTId]);

  useEffect(async () => {
    // if 1st time, then these vars come as [] or null
    if (dataCfHashData && !Array.isArray(dataCfHashData)) {
      setSaveProgress(prevSaveProgress => ({...prevSaveProgress, s2: 1}));

      const {dataHash} = dataCfHashData;

      if (dataHash) {
        if (!drawerInMintNFT) {
          // create the datapack object
          const newDataPack = {...dataTemplates.dataPack, 
            dataPreview: sellerDataPreview,
            sellerEthAddress: user.get('ethAddress'),
            dataHash,
            dataFile: dataFileSave,
            termsOfUseId,
            txNetworkId: chainMeta.networkId
          };

          // if core programID is available then link it
          if (currSellObject) {
            newDataPack.fromProgramId = currSellObject.program;
          }

          const newPack = await saveDataPack(newDataPack);

          setSavedDataPackMoralis(newPack);
        } else {
          // create the dataNFT object
          const newDataNFT = {...dataTemplates.dataNFT, 
            dataPreview: sellerDataNFTDesc,
            nftName: sellerDataPreview,
            feeInMyda: dataNFTFeeInMyda,
            sellerEthAddress: user.get('ethAddress'),
            dataHash,
            dataFile: dataFileSave,
            termsOfUseId,
            txNetworkId: chainMeta.networkId,
            txNFTContract: chainMeta.contracts.dnft
          };

          // if core programID is available then link it
          if (currSellObject) {
            newDataNFT.fromProgramId = currSellObject.program;
          }

          const newMoralisNFT = await saveDataNFT(newDataNFT);

          setSavedDataNFTMoralis(newMoralisNFT);
        }        
      }
    }

    if (errCfHashData) { // there was an error
      console.error('errCfHashData', errCfHashData);
    }

  }, [dataCfHashData, errCfHashData]);

  useEffect(async () => {
    if (savedDataPackMoralis && savedDataPackMoralis.id && savedDataPackMoralis.get('dataHash')) {
      setSaveProgress(prevSaveProgress => ({...prevSaveProgress, s3: 1}));

      web3_ddexAdvertiseForSale(savedDataPackMoralis.id, savedDataPackMoralis.get('dataHash'));
    }
  }, [savedDataPackMoralis]);

  // data NFT object saved to moralis
  useEffect(async () => {
    if (savedDataNFTMoralis && savedDataNFTMoralis.id && savedDataNFTMoralis.get('dataHash')) {      
      // gen art demo
      let NFTImgUrl = 'https://drive.google.com/uc?export=view&id=114eTkKdArNbp0wNJpuKS4j0m0AYENej4';

      // ... or robot
      if (NFTArtStyle === 1) {
        NFTImgUrl = `https://itheumapi.com/bespoke/ddex/generateNFTArt?hash=${savedDataNFTMoralis.get('dataHash')}`;
      }

      setDataNFTImg(NFTImgUrl);

      const newNFTMetaDataFile = {...dataTemplates.dataNFTMetaDataFile, 
        name: sellerDataPreview,
        description: sellerDataNFTDesc,
        image: NFTImgUrl,
        external_url: `https://datadex.itheum.com/datanfts/marketplace/${savedDataNFTMoralis.id}`
      };

      newNFTMetaDataFile.properties.data_dex_nft_id = savedDataNFTMoralis.id;

      await saveNFTMetaDataFile("metadata.json", {base64 : btoa(JSON.stringify(newNFTMetaDataFile))});
    }
  }, [savedDataNFTMoralis]);

  useEffect(async () => {
    if (txError) {
      console.error(txError);
    } else if (txHash && txConfirmation === config.txConfirmationsNeededLrg) {
      savedDataPackMoralis.set('txHash', txHash);      

      await savedDataPackMoralis.save();
      
      setSaveProgress(prevSaveProgress => ({...prevSaveProgress, s4: 1}));

      sleep(3);
      closeProgressModal();
    }
    
  }, [txConfirmation, txHash, txError]);

  function validateBaseInput() {
    if (!sellerDataPreview || sellerDataPreview === '') {
      alert('You need to provide some data preview or NFT title!');
      return false;
    } else {
      try {
        JSON.parse(sellerData); // valid JSON check?
        return true;
      } catch(e) {
        alert('You need to provide some valid JSON for data!');
        return false;
      }
    }    
  }

  const dataPackSellSubmit = async () => {
    if (!sellerDataPreview || sellerDataPreview === '') {
      alert('You need to provide some dataPreview!');      
    } else {
      try {
        JSON.parse(sellerData); // valid JSON check?
        
        onProgressModalOpen();

        /*
          1) Save the file and get a Moralis File Ref (s1)
          2) Get a sha256 hash for the data (s2)
          3) Save the Data Pack in Moralis and get the new datapackID (s3)
          4) Save to blockchain and get transactionHash (txHash), wait until 1 confirmations (show in UI)
          5) Update the Data Pack in Moralis with the transactionHash (s4)
        */

        await saveFile("sellerDatafile.json", {base64 : btoa(sellerData)});

        return;
      } catch(e) {
        alert('You need to provide some valid JSON for data!');
        return;
      }      
    }
  }

  const dataNFTSellSubmit = async () => {
    if (validateBaseInput()) {
      if (!sellerDataNFTDesc) {
        alert('You need to provide some NFT Description!');
        return;
      }

      /*
        1) Save the file and get a Moralis File Ref (s1)
        2) Get a sha256 hash for the data and generate the robot img URL (s2)
        2.1) Save the Data NFT in Moralis and get the new moralis dataNFTId
        3) Save the NFT Meta file to IPFS (use moralis file for now) and get the uri (n1)
        3) Call the NFT contract with meta file URI and get the new NFT ID (n2)
        4) Save a new Data NFT object in Moralis with all details of Data Pack + NFTId, Meta file URI and NFT contract address and NFT mint hash (n3)
      */

      onProgressModalOpen();

      await saveFile("sellerDatafile.json", {base64 : btoa(sellerData)});
    }
  }

  const web3_ddexAdvertiseForSale = async(dataPackId, dataHash) => {
    const ddexContract = new web3.eth.Contract(ABIS.ddex, chainMeta.contracts.ddex);

    const receipt = await ddexContract.methods.advertiseForSale(dataPackId, dataHash).send({from: user.get('ethAddress')});

    // show a nice loading animation to user
    setTxHash(receipt.transactionHash);
    await sleep(2);
    setTxConfirmation(0.5);
    await sleep(2);
    setTxConfirmation(1);
    await sleep(2);

    if (receipt.status === true) {
      setTxConfirmation(2);
    } else {
      const txErr = new Error('Contract Error on method advertiseForSale');
      console.error(txErr);
      
      setTxError(txErr);
    }

    // ddexContract.methods.advertiseForSale(dataPackId, dataHash).send({from: user.get('ethAddress')})
    //   .on('transactionHash', function(hash){
    //     console.log('transactionHash', hash);

    //     setTxHash(hash);
    //   })
    //   .on('receipt', function(receipt){
    //     console.log('receipt', receipt);

    //     // setTxReceipt(receipt);
    //   })
    //   .on('confirmation', function(confirmationNumber, receipt){
    //     // https://ethereum.stackexchange.com/questions/51492/why-does-a-transaction-trigger-12-or-24-confirmation-events
    //     console.log('confirmation');
    //     console.log(confirmationNumber);

    //     setTxConfirmation(confirmationNumber);
    //   })
    //   .on('error', function(error, receipt) {
    //     console.log('error');
    //     console.log(receipt);
    //     console.log(error);

    //     setTxError(error);
    //   });
  }

  const web3_dnftCreateNFT = async(metaDataFileUri) => {
    const dnftContract = new web3.eth.Contract(ABIS.dNFT, chainMeta.contracts.dnft);

    const receipt = await dnftContract.methods.createDataNFT(metaDataFileUri).send({from: user.get('ethAddress')});

    // show a nice loading animation to user
    setTxNFTHash(receipt.transactionHash);
    await sleep(2);
    setTxNFTConfirmation(0.5);
    await sleep(2);
    setTxNFTConfirmation(1);
    await sleep(2);

    if (receipt.status === true) {
      setSaveProgressNFT(prevSaveProgress => ({...prevSaveProgress, n2: 1}));

      setTxNFTConfirmation(2);

      await sleep(5);

      setNewNFTId(receipt.events.Transfer.returnValues.tokenId);
    } else {
      const txErr = new Error('NFT Contract Error on method createDataNFT');
      console.error(txErr);
      
      setTxNFTError(txErr);
    }
  }

  function closeProgressModal() {
    toast({
      title: "Data sent for sale",
      status: "success",
      duration: 4000,
      isClosable: true,
    });

    onProgressModalClose();
    onCloseDrawer();

    // remount the component
    onRfMount();
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
      <Heading size="xs" opacity=".7">Sell your personal data direct-to-buyer (peer-to-peer) or as Data NFTs across many NFT Marketplaces</Heading>

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
                <Button mt="3" colorScheme="teal" variant="outline" onClick={() => getDataForSale(item.program)}>Sell Program Data</Button>
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
              <Button mt="3" colorScheme="teal" variant="outline" onClick={() => getDataForSale()}>Sell Data</Button>
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
              <Button mt="3" colorScheme="teal" variant="outline" onClick={() => getDataForSale()}>Sell Data</Button>
            </Box>     
        </Box>
      </Wrap>

      <Drawer onClose={onRfMount} isOpen={isDrawerOpen} size="xl" closeOnEsc={false} closeOnOverlayClick={false}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <HStack spacing="5">
              <CloseButton size="lg" onClick={onRfMount} />
              {currSellObject && <Stack><Text fontSize="2xl">Sell data from your <Text color="teal" fontSize="2xl">{currSellObject.programName}</Text> program</Text></Stack>}
            </HStack>
          </DrawerHeader>
          <DrawerBody>
            {(fetchDataLoading && !isArbirData) && <CircularProgress isIndeterminate color="teal" size="100" thickness="5px" /> ||
          
            <Stack spacing={5} mt="5">

              <Text fontWeight="bold">Sale Type</Text>
              
              {/* <RadioGroup value={drawerInMintNFT} onChange={() => setDrawerInMintNFT(!drawerInMintNFT)}>
                <Stack>
                  <Radio value={false}>Data Pack (Unlimited Supply / No Resale / No Royalty)</Radio>
                  <Radio value={true}>Data NFT (Limited Edition / Resale allowed with Royalty)</Radio>
                </Stack>
              </RadioGroup> */}

              <HStack>
                <IconButton
                  icon={<FaUncharted size="2.5rem" />}
                  l1="Data Pack"
                  l2="(Unlimited Supply / No Resale / No Royalty)"
                  selected={!drawerInMintNFT}
                  onclickFunc={() => setDrawerInMintNFT(false)} />

                <IconButton
                  icon={<AiOutlinePicture size="2.5rem" />}
                  l1="Data NFT"
                  l2="(Limited Edition / Resale allowed with Royalty)"
                  selected={drawerInMintNFT}
                  onclickFunc={() => setDrawerInMintNFT(true)} />
              </HStack>

              <Text fontWeight="bold">{!drawerInMintNFT && 'Data Payload Preview/Summary:' || 'NFT Title'}</Text>
              <Input placeholder="Data Preview" value={sellerDataPreview} onChange={(event) => setSellerDataPreview(event.currentTarget.value)} />

              {drawerInMintNFT && <>
                <Text fontWeight="bold">NFT Description</Text>
                <Textarea placeholder="Enter a detailed NFT description here" value={sellerDataNFTDesc} onChange={(event) => setSellerDataNFTDesc(event.currentTarget.value)} />
              
                <Text fontWeight="bold">Price (in {CHAIN_TOKEN_SYMBOL(chainMeta.networkId)})</Text>
                <NumberInput size="md"  maxW={24} step={1} defaultValue={0} min={0} max={10} value={dataNFTFeeInMyda} onChange={(valueString) => setDataNFTFeeInMyda(parseInt(valueString))}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text colorScheme="gray" fontSize="sm">Data NFTs can be sold in {CHAIN_TOKEN_SYMBOL(chainMeta.networkId)} or ETH -  
                  <Tooltip label={`If you sell your Data NFT in the Itheum Data NFT marketplace you can sell it in ${CHAIN_TOKEN_SYMBOL(chainMeta.networkId)}. You can also sell it in ETH by using the OpenSea marketplace. Unsure what to do? Set a ${CHAIN_TOKEN_SYMBOL(chainMeta.networkId)} price for now.`} aria-label="A tooltip"> [Tell me more]
                  </Tooltip>
                </Text>

                <Text fontWeight="bold">Number of copies (Coming soon...)</Text>
                <NumberInput isDisabled={true} size="md"  maxW={24} step={1} defaultValue={1} min={1} max={20} value={dataNFTCopies} onChange={(valueString) => setDataNFTCopies(parseInt(valueString))}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text colorScheme="gray" fontSize="sm">Limit the quality to increase value (rarity) - suggested: less than 10</Text>

                <Text fontWeight="bold">Royalties (Coming soon...)</Text>
                <NumberInput isDisabled={true} size="md"  maxW={24} step={10} defaultValue={0} min={0} max={30} value={dataNFTRoyalty} onChange={(valueString) => setDataNFTRoyalty(parseInt(valueString))}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text colorScheme="gray" fontSize="sm">Suggested: 0%, 10%, 20%, 30%</Text>

                <Text fontWeight="bold">Generative Art Style</Text>
                <HStack>
                  <IconButton
                    icon={<GiVintageRobot size="2.5rem" />}
                    l1="Character Collectible"
                    l2="(Algorithmic character generation)"
                    selected={NFTArtStyle === 1}
                    onclickFunc={() => setNFTArtStyle(1)} />

                  <IconButton
                    icon={<MdOutlinePattern size="2.5rem" />}
                    l1="Art Collectible"
                    l2="(Algorithmic artistic generation)"
                    selected={NFTArtStyle === 2}
                    onclickFunc={() => setNFTArtStyle(2)} />
                </HStack>
              </>}

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

              {!drawerInMintNFT && <Text fontSize="xl" fontWeight="bold">Estimated Earnings:
                <Badge ml="1" fontSize="0.8em" colorScheme="teal">2 {CHAIN_TOKEN_SYMBOL(chainMeta.networkId)}</Badge>
              </Text>}              

              <Flex>
                {!drawerInMintNFT && <Button mt="5" mr="5" colorScheme="teal" isLoading={isProgressModalOpen} onClick={dataPackSellSubmit}>Place for Sale as Data Pack</Button>}
                {drawerInMintNFT && <Button mt="5" colorScheme="teal" isLoading={isProgressModalOpen} onClick={dataNFTSellSubmit}>Mint and Sell as NFT</Button>}
              </Flex>
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
                      <Text>Generating unique tamper-proof data signature {drawerInMintNFT && 'and your unique NFT character'}</Text>
                    </HStack>

                    {dataNFTImg && <>
                      <Image
                        boxSize="200px"
                        height="auto"
                        src={dataNFTImg}
                      />
                      <Text fontSize="xs">This character was created using the unique data signature (it's one of a kind!) </Text>
                    </>}

                    {!drawerInMintNFT && <>
                      <HStack>
                        {!saveProgress.s3 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                        <Text>Saving to storage</Text>
                      </HStack>
                    
                      <HStack>
                        {!saveProgress.s4 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                        <Text>Advertising for sale on blockchain</Text>
                      </HStack>
                    </>}

                    {txHash && <Stack>                      
                      <Progress colorScheme="teal" fontSize="sm" value={(100 / config.txConfirmationsNeededLrg) * txConfirmation} />

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

                    {drawerInMintNFT && <>
                      <HStack>
                        {!saveProgressNFT.n1 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                        <Text>Generating and saving NFT metadata file to IPFS</Text>
                      </HStack>

                      <HStack>
                        {!saveProgressNFT.n2 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                        <Text>Minting your new data NFT on blockchain</Text>
                      </HStack>

                      {txNFTHash && 
                        <Stack>
                          <Progress colorScheme="teal" fontSize="sm" value={(100 / config.txConfirmationsNeededLrg) * txNFTConfirmation} />

                          <HStack>
                            <Text>Transaction </Text>
                            <ShortAddress address={txNFTHash} />
                            <Link href={`${CHAIN_TX_VIEWER[chainMeta.networkId]}${txNFTHash}`} isExternal> <ExternalLinkIcon mx="2px" /></Link>
                          </HStack>

                          {txNFTError && 
                            <Alert status="error">
                              <AlertIcon />
                              {txNFTError.message && <AlertTitle>{txNFTError.message}</AlertTitle>}
                              <CloseButton position="absolute" right="8px" top="8px" onClick={closeProgressModal} />
                            </Alert>
                          }                      
                        </Stack>}

                      <HStack>
                        {!saveProgressNFT.n3 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                        <Text>Advertising for sale as a Data NFT</Text>
                      </HStack>
                    </>}

                    {errDataPackSave && 
                      <Alert status="error">
                        <Box flex="1">
                          <AlertIcon />
                          {errDataPackSave.message && <AlertTitle>{errDataPackSave.message}</AlertTitle>}
                        </Box>
                      </Alert>
                    }

                    {errDataNFTSave && 
                      <Alert status="error">
                        <Box flex="1">
                          <AlertIcon />
                          {errDataNFTSave.message && <AlertTitle>{errDataNFTSave.message}</AlertTitle>}
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
