import moment from 'moment';
import { useDropzone } from 'react-dropzone';
import { useMemo, useEffect, useState, useCallback } from 'react';
import { useMoralis, useNewMoralisObject, useMoralisCloudFunction, useMoralisFile } from 'react-moralis';
import { Heading, Box, Stack } from '@chakra-ui/layout';
import { CheckCircleIcon, ExternalLinkIcon, TimeIcon } from '@chakra-ui/icons';
import {
  Button, Input, Text, HStack, Radio, RadioGroup, Spinner, Progress, Skeleton, Center,
  Alert, AlertIcon, AlertTitle, AlertDescription, CloseButton, Link, Code, CircularProgress,
  Image, Badge, Wrap, Collapse, Flex, Textarea, Tooltip,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  useToast, useDisclosure
} from '@chakra-ui/react';
import ChainSupportedInput from 'UtilComps/ChainSupportedInput';
import { FaUncharted } from 'react-icons/fa';
import { AiOutlinePicture } from 'react-icons/ai';

import { uxConfig, dataTemplates, sleep } from 'libs/util';
import { TERMS, CHAIN_TX_VIEWER, CHAIN_TOKEN_SYMBOL, MENU } from 'libs/util';
import { ABIS } from 'EVM/ABIs';
import ShortAddress from 'UtilComps/ShortAddress';
import IconButton from 'UtilComps/IconButton';
import { useChainMeta } from 'store/ChainMetaContext';

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

export default function ({ onRfMount, itheumAccount }) {
  const { chainMeta: _chainMeta, setChainMeta } = useChainMeta();
  const { user } = useMoralis();
  const { web3: web3Provider, Moralis: { web3Library: ethers } } = useMoralis();
  const toast = useToast();
  const [sellerDataPreview, setSellerDataPreview] = useState('');
  const [sellerData, setSellerData] = useState('');
  const [isArbirData, setIsArbirData] = useState(false);
  const [termsOfUseId, setTermsOfUseId] = useState('2');
  const [saveProgress, setSaveProgress] = useState({ s1: 0, s2: 0, s3: 0, s4: 0 });
  const [saveProgressNFT, setSaveProgressNFT] = useState({ n1: 0, n2: 0, n3: 0 });
  const { isOpen: isProgressModalOpen, onOpen: onProgressModalOpen, onClose: onProgressModalClose } = useDisclosure();
  const { isOpen: isDrawerOpenTradeFile, onOpen: onOpenDrawerTradeFile, onClose: onCloseDrawerTradeFile } = useDisclosure();
  const { isOpen: isDrawerOpenTradeStream, onOpen: onOpenDrawerTradeStream, onClose: onCloseDrawerTradeStream } = useDisclosure();
  const [currSellObject, setCurrSellObject] = useState(null);
  const [fetchDataLoading, setFetchDataLoading] = useState(true);
  const [showCode, setShowCode] = useState(false);
  const [drawerInMintNFT, setDrawerInMintNFT] = useState(false);
  
  const [isStreamTrade, setIsStreamTrade] = useState(0);

  const [oneNFTImgLoaded, setOneNFTImgLoaded] = useState(false);
  const [newNFTId, setNewNFTId] = useState(null); // newly created token ID from blockchain
  const [dataNFTImg, setDataNFTImg] = useState(null);
  const [dataNFTTitle, setDataNFTTitle] = useState('');
  const [dataNFTDesc, setDataNFTDesc] = useState('');
  const [dataNFTCopies, setDataNFTCopies] = useState(1);
  const [dataNFTRoyalty, setDataNFTRoyalty] = useState(0);
  const [dataNFTFeeInTokens, setDataNFTFeeInTokens] = useState(1);
  const [dataNFTStreamUrl, setDataNFTStreamUrl] = useState('https://itheumapi.com/readingsStream/a7d46790-bc9e-11e8-9158-a1b57f7315ac/70dc6bd0-59b0-11e8-8d54-2d562f6cba54');
  const [dataNFTStreamPreviewUrl, setDataNFTStreamPreviewUrl] = useState('https://itheumapi.com/readingsStream/a7d46790-bc9e-11e8-9158-a1b57f7315ac/70dc6bd0-59b0-11e8-8d54-2d562f6cba54?preview=1');
  const [dataNFTMarshalService, setDataNFTMarshalService] = useState('https://itheumapi.com/ddex/datamarshal/v1/services/generate');
  const [errDataNFTStreamGeneric, setErrDataNFTStreamGeneric] = useState(null);

  // eth tx state
  const [txConfirmation, setTxConfirmation] = useState(0);
  const [txHash, setTxHash] = useState(null);
  const [txError, setTxError] = useState(null);
  const [txNFTConfirmation, setTxNFTConfirmation] = useState(0);
  const [txNFTHash, setTxNFTHash] = useState(null);
  const [txNFTError, setTxNFTError] = useState(null);


  const getDataForSale = (programId, isStreamTrade=false) => {
    if (isStreamTrade) {
      onOpenDrawerTradeStream();
    } else {
      onOpenDrawerTradeFile();
    }

    if (programId) {
      const selObj = { ...itheumAccount.programsAllocation.find(i => i.program === programId), ...itheumAccount._lookups.programs[programId] };
      setCurrSellObject(selObj);

      fetchData(selObj);
    } else {
      setIsArbirData(true);
    }
    
    setIsStreamTrade(isStreamTrade)
  }

  const fetchData = async selObj => {
    const myHeaders = new Headers();
    myHeaders.append('authorization', process.env.REACT_APP_ENV_ITHEUMAPI_M2M_KEY);

    const requestOptions = {
      method: 'GET',
      headers: myHeaders
    };

    const res = await fetch(`https://itheumapi.com/readings/${selObj.shortId}/${selObj.type}/range?fromTs=${selObj.fromTs}&toTs=${selObj.toTs}`, requestOptions);
    const data = await res.json();

    if (data && data.length > 0) {
      const previewStr = `${data.length} datapoints from the ${selObj.programName} program collected from ${moment(selObj.fromTs).format(uxConfig.dateStr)} to ${moment(selObj.toTs).format(uxConfig.dateStr)}`;

      setSellerDataPreview(previewStr);
      setDataNFTDesc(previewStr)
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
  } = useMoralisCloudFunction('saveSellerDataToFile', { sellerData }, { autoFetch: false });

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

  useEffect(async () => {
    if (dataFileSave && !loadingFileSave) {
      setSaveProgress(prevSaveProgress => ({ ...prevSaveProgress, s1: 1 }));

      await doCfHashData(); // get the hash of the file
    }
  }, [dataFileSave, errFileSave, loadingFileSave]);

  useEffect(async () => {
    if (NFTMetaDataFile && !loadingNFTMetaDataFile) {
      setSaveProgressNFT(prevSaveProgress => ({ ...prevSaveProgress, n1: 1 }));

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

      setSaveProgressNFT(prevSaveProgress => ({ ...prevSaveProgress, n3: 1 }));

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
      setSaveProgress(prevSaveProgress => ({ ...prevSaveProgress, s2: 1 }));

      const { dataHash } = dataCfHashData;

      if (dataHash) {
        if (isStreamTrade) {
          // create the dataNFT object
          const newDataNFT = {
            ...dataTemplates.dataNFT,
            type: 'datastream',
            dataPreview: dataNFTStreamPreviewUrl,
            nftName: dataNFTTitle,
            feeInMyda: dataNFTFeeInTokens,
            sellerEthAddress: user.get('ethAddress'),
            dataHash,            
            txNetworkId: _chainMeta.networkId,
            txNFTContract: _chainMeta.contracts.dnft
          };

          const newMoralisNFT = await saveDataNFT(newDataNFT);

          setSavedDataNFTMoralis(newMoralisNFT);
        }
        else if (drawerInMintNFT) {          
           // create the dataNFT object
           const newDataNFT = {
            ...dataTemplates.dataNFT,
            type: 'datapack',
            dataPreview: dataNFTDesc,
            nftName: dataNFTTitle,
            feeInMyda: dataNFTFeeInTokens,
            sellerEthAddress: user.get('ethAddress'),
            dataHash,
            dataFile: dataFileSave,
            termsOfUseId,
            txNetworkId: _chainMeta.networkId,
            txNFTContract: _chainMeta.contracts.dnft
          };

          // if core programID is available then link it
          if (currSellObject) {
            newDataNFT.fromProgramId = currSellObject.program;
          }

          const newMoralisNFT = await saveDataNFT(newDataNFT);

          setSavedDataNFTMoralis(newMoralisNFT);
        } else {
          // create the datapack object
          const newDataPack = {
            ...dataTemplates.dataPack,
            dataPreview: sellerDataPreview,
            sellerEthAddress: user.get('ethAddress'),
            dataHash,
            dataFile: dataFileSave,
            termsOfUseId,
            txNetworkId: _chainMeta.networkId
          };

          // if core programID is available then link it
          if (currSellObject) {
          newDataPack.fromProgramId = currSellObject.program;
          }

          const newPack = await saveDataPack(newDataPack);

          setSavedDataPackMoralis(newPack);
        }
      }
    }

    if (errCfHashData) { // there was an error
      console.error('errCfHashData', errCfHashData);
    }

  }, [dataCfHashData, errCfHashData]);

  useEffect(async () => {
    if (savedDataPackMoralis && savedDataPackMoralis.id && savedDataPackMoralis.get('dataHash')) {
      setSaveProgress(prevSaveProgress => ({ ...prevSaveProgress, s3: 1 }));

      web3_ddexAdvertiseForSale(savedDataPackMoralis.id, savedDataPackMoralis.get('dataHash'));
    }
  }, [savedDataPackMoralis]);

  // Data NFT object saved to moralis
  useEffect(async () => {
    if (savedDataNFTMoralis && savedDataNFTMoralis.id && savedDataNFTMoralis.get('dataHash')) {
      const NFTImgUrl = `https://itheumapi.com/bespoke/ddex/generateNFTArt?hash=${savedDataNFTMoralis.get('dataHash')}`;

      setDataNFTImg(NFTImgUrl);

      const newNFTMetaDataFile = {
        ...dataTemplates.dataNFTMetaDataFile,
        name: dataNFTTitle,
        description: dataNFTDesc,
        image: NFTImgUrl,
        external_url: `https://datadex.itheum.com/datanfts/marketplace/${savedDataNFTMoralis.id}`
      };

      newNFTMetaDataFile.properties.data_dex_nft_id = savedDataNFTMoralis.id;
      newNFTMetaDataFile.properties.data_nft_type = 'datapack';

      if (isStreamTrade) {
        newNFTMetaDataFile.properties.data_nft_type = 'datastream';
        newNFTMetaDataFile.properties.encryption_vector = '';
        newNFTMetaDataFile.properties.stream_url = dataNFTStreamUrl;
        newNFTMetaDataFile.properties.stream_preview_url = dataNFTStreamPreviewUrl;
        newNFTMetaDataFile.properties.data_marshal_service = dataNFTMarshalService;
      }

      await saveNFTMetaDataFile('metadata.json', { base64: btoa(JSON.stringify(newNFTMetaDataFile)) });
    }
  }, [savedDataNFTMoralis]);

  useEffect(async () => {
    if (txError) {
      console.error(txError);
    } else if (txHash && txConfirmation === uxConfig.txConfirmationsNeededLrg) {
      savedDataPackMoralis.set('txHash', txHash);

      await savedDataPackMoralis.save();

      setSaveProgress(prevSaveProgress => ({ ...prevSaveProgress, s4: 1 }));

      sleep(3);
      closeProgressModal();
    }

  }, [txConfirmation, txHash, txError]);

  const dataPackSellSubmit = async () => {
    if (!sellerDataPreview || sellerDataPreview.trim() === '') {
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

        await saveFile('sellerDatafile.json', { base64: btoa(sellerData) });

        return;
      } catch (e) {
        alert('You need to provide some valid JSON for data!');
        return;
      }
    }
  }

  const dataNFTSellSubmit = async () => {
    if (validateBaseInput()) {
      if (isStreamTrade) {
        dataNFTDataStreamAdvertise();
      } else {
        dataNFTDataPackAdvertise();
      }     
    }
  }

  const dataNFTDataPackAdvertise = async () => {
    /*
      1) Save the file and get a Moralis File Ref (s1)
      2) Get a sha256 hash for the data and generate the robot img URL (s2)
        2.1) Save the Data NFT in Moralis and get the new moralis dataNFTId
      3) Save the NFT Meta file to IPFS (use moralis file for now) and get the uri (n1)
      4) Call the NFT contract with meta file URI and get the new NFT ID (n2)
      5) Save a new Data NFT object in Moralis with all details of Data Pack + NFTId, Meta file URI and NFT contract address and NFT mint hash (n3)
    */

    onProgressModalOpen();

    await saveFile('sellerDatafile.json', { base64: btoa(sellerData) });
  }

  const dataNFTDataStreamAdvertise = async () => {
    /*
      1) Call the data marshal and get a encrypted data stream url
      2) Get a sha256 hash for the encrypted data stream url and generate the robot img URL (s2)
        2.1) Save the Data NFT in Moralis and get the new moralis dataNFTId
      3) Save the NFT Meta file to IPFS and get the uri (n1)
      4) Call the NFT contract with meta file URI and get the new NFT ID (n2)
      5) Save a new Data NFT object in Moralis with all details of Data Pack + NFTId, Meta file URI and NFT contract address and NFT mint hash (n3)
    */

    onProgressModalOpen();

    const myHeaders = new Headers();
    myHeaders.append('authorization', process.env.REACT_APP_ENV_ITHEUMAPI_M2M_KEY);
    myHeaders.append('cache-control', 'no-cache');
    myHeaders.append('Content-Type', 'application/json');

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        dataNFTStreamUrl: dataNFTStreamUrl
      })
    };

    const res = await fetch('https://itheumapi.com/ddex/datamarshal/v1/services/generate', requestOptions);
    const data = await res.json();

    if (data && data.encryptedMessage && data.messageHash) {
      setSellerData(data.encryptedMessage); // the data URL is the seller data in this case
      setSaveProgress(prevSaveProgress => ({ ...prevSaveProgress, s1: 1 }));

      await doCfHashData(); // get the hash of the url (sellerData is the url here)
    } else {
      if (data.success === false) {
        setErrDataNFTStreamGeneric(new Error(`${data.error.code}, ${data.error.message}`));
      } else {
        setErrDataNFTStreamGeneric(new Error('Data Marshal responded with an unknown error trying to generate your encrypted links'));
      }
    }
  }

  const web3_ddexAdvertiseForSale = async (dataPackId, dataHash) => {
    const web3Signer = web3Provider.getSigner();
    const ddexContract = new ethers.Contract(_chainMeta.contracts.ddex, ABIS.ddex, web3Signer);

    try {
      const txResponse = await ddexContract.advertiseForSale(dataPackId, dataHash);

      // show a nice loading animation to user
      setTxHash(txResponse.hash);

      await sleep(2);
      setTxConfirmation(0.5);

      // wait for 1 confirmation from ethers
      const txReceipt = await txResponse.wait();
      setTxConfirmation(1);
      await sleep(2);

      if (txReceipt.status) {
        setTxConfirmation(2);
      } else {
        const txErr = new Error('DataDEX Contract Error on method advertiseForSale');
        console.error(txErr);

        setTxError(txErr);
      }
    } catch (e) {
      setTxError(e);
    }
  }

  const web3_dnftCreateNFT = async (metaDataFileUri) => {
    const web3Signer = web3Provider.getSigner();
    const dnftContract = new ethers.Contract(_chainMeta.contracts.dnft, ABIS.dNFT, web3Signer);

    try {
      const txResponse = await dnftContract.createDataNFT(metaDataFileUri);

      // show a nice loading animation to user
      setTxNFTHash(txResponse.hash);

      await sleep(2);
      setTxNFTConfirmation(0.5);

      // wait for 1 confirmation from ethers
      const txReceipt = await txResponse.wait();
      console.log(txReceipt.events);
      setTxConfirmation(1);
      await sleep(2);

      if (txReceipt.status) {
        setSaveProgressNFT(prevSaveProgress => ({ ...prevSaveProgress, n2: 1 }));

        setTxNFTConfirmation(2);

        await sleep(5);

        // get tokenId
        const event = txReceipt.events.find(event => event.event === 'Transfer');
        const [, , tokenId] = event.args;
        setNewNFTId(tokenId.toString());

        // setNewNFTId(receipt.events.Transfer.returnValues.tokenId);
      } else {
        const txErr = new Error('NFT Contract Error on method createDataNFT');
        console.error(txErr);

        setTxNFTError(txErr);
      }
    } catch (e) {
      setTxNFTError(e);
    }
  }

  const closeProgressModal = () => {
    toast({
      title: (drawerInMintNFT || isStreamTrade) ? 
        'Success! Data NFT Minted. Head over to your "Data NFT Wallet" to view your new NFT' : 
        'Success! Data Pack advertised for trade',
      status: 'success',
      isClosable: true,
    });

    onProgressModalClose();
    onCloseDrawerTradeFile();
    onCloseDrawerTradeStream();

    // remount the component (quick way to rest all state to prestine)
    onRfMount();
  }

  const handleCodeShowToggle = () => setShowCode(!showCode);

  function validateBaseInput() {
    if (!dataNFTTitle || dataNFTTitle.trim() === '') {
      alert('You need to provide a NFT title!');
      return false;
    } else if (!dataNFTDesc) {
      alert('You need to provide a NFT Description!');
      return false;
    }

    if (isStreamTrade) {
      if (!dataNFTStreamUrl.includes('https://') || !dataNFTStreamPreviewUrl.includes('https://') || !dataNFTMarshalService.includes('https://')) {
        alert('Your data stream url inputs dont seem to be valid. for e.g. stream URLs / marshal service URLs need to have https:// in it');
        return false;
      } else {
        return true;
      }
    } else {
      // only need to validate json if it's not a stream trade
      try {
        JSON.parse(sellerData); // valid JSON check?
        return true;
      } catch (e) {
        alert('You need to provide some valid JSON for data!');
        return false;
      }
    }
  }

  // S: File upload plugin
  function uploadedFileValidator(file) {
    if (file.size < 100) {
      return {
        code: 'file-too-small',
        message: 'file size needs to be larger than 100 bytes'
      };
    } else if (file.size > 1572864) {
      return {
        code: 'file-too-big',
        message: 'file size needs to be smaller than 1.5MB (megabyte)'
      };
    }

    return null
  }

  function fileValidatorUiError(fileRejections) {
    let errMsg = '';

    if (fileRejections && fileRejections.length > 0) {
      const errors = fileRejections[0].errors;

      errors.map(e => errMsg += `${e.message}, `);
    }

    // remove last , if needed
    if (errMsg.length > 1) {
      errMsg = errMsg.slice(0, -2);
    }

    return errMsg;
  }

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()

      reader.onabort = () => console.log('File reading was aborted')
      reader.onerror = () => console.log('File reading has failed')
      reader.onload = (e) => {
        const resStr = reader.result
        setSellerData(resStr);
      }
      reader.readAsText(file)
    })

  }, [])

  const {
    fileRejections,
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: '.json, application/json',
    multiple: false,
    validator: uploadedFileValidator
  });
  // E: File upload plugin

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
      <Heading size="lg">Trade Data</Heading>
      <Heading size="xs" opacity=".7">Trade your personal data direct-to-buyer (peer-to-peer) or as Data NFTs across many NFT Marketplaces</Heading>

      {(itheumAccount && itheumAccount.programsAllocation.length > 0) &&
        <Wrap shouldWrapChildren={true} wrap="wrap" spacing={5}>
          {itheumAccount.programsAllocation.map(item => (
            <Box key={item.program} maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
              <Image src={`https://itheum-static.s3-ap-southeast-2.amazonaws.com/dex-${itheumAccount._lookups.programs[item.program].img}.png`} alt=""/>

              <Box p="6">
                <Box display="flex" alignItems="baseline">
                  <Badge borderRadius="full" px="2" colorScheme="teal"> New</Badge>
                  <Box
                    mt="1"
                    ml="2"
                    fontWeight="semibold"
                    as="h4"
                    lineHeight="tight"
                    noOfLines={1}>
                    {itheumAccount._lookups.programs[item.program].programName}
                  </Box>
                </Box>
                <Button mt="3" colorScheme="teal" variant="outline" onClick={() => getDataForSale(item.program)}>Trade Program Data</Button>
              </Box>

            </Box>
          ))}
        </Wrap>}

      <Wrap shouldWrapChildren={true} wrap="wrap" spacing={5}>
        <Box maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
          <Image src="https://itheum-static.s3.ap-southeast-2.amazonaws.com/data-stream.png" alt=""/>

          <Box p="6">
            <Box display="flex" alignItems="baseline">
              <Box
                mt="1"
                fontWeight="semibold"
                as="h4"
                lineHeight="tight"
                noOfLines={1}>
                Trade a Data Stream as a Data NFT
              </Box>
            </Box>
            <Button mt="3" colorScheme="teal" variant="outline" onClick={() => getDataForSale(null, 1)}>Advertise Data</Button>
          </Box>
        </Box>

        <Box maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
          <Image src="https://itheum-static.s3-ap-southeast-2.amazonaws.com/dex-any.png" alt=""/>

          <Box p="6">
            <Box display="flex" alignItems="baseline">
              <Box
                mt="1"
                fontWeight="semibold"
                as="h4"
                lineHeight="tight"
                noOfLines={1}>
                Trade Any Arbitrary Data Set
              </Box>
            </Box>
            <Button mt="3" colorScheme="teal" variant="outline" onClick={() => getDataForSale()}>Advertise Data</Button>
          </Box>
        </Box>

        <Box maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
          <Image src="https://itheum-static.s3-ap-southeast-2.amazonaws.com/dex-any-fb.png" alt=""/>

          <Box p="6">
            <Box display="flex" alignItems="baseline">
              <Box
                mt="1"
                fontWeight="semibold"
                as="h4"
                lineHeight="tight"
                noOfLines={1}>
                Trade My Facebook Data
              </Box>
            </Box>
            <Button mt="3" colorScheme="teal" variant="outline" onClick={() => getDataForSale()}>Advertise Data</Button>
          </Box>
        </Box>
      </Wrap>

      <Drawer onClose={onRfMount} isOpen={isDrawerOpenTradeFile} size="xl" closeOnEsc={false} closeOnOverlayClick={false}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <HStack spacing="5">
              <CloseButton size="lg" onClick={onRfMount} />
              {currSellObject && <Stack><Text fontSize="2xl">Trade data from your <Text color="teal" fontSize="2xl">{currSellObject.programName}</Text> program</Text></Stack>}
            </HStack>
          </DrawerHeader>
          <DrawerBody>
            {(fetchDataLoading && !isArbirData) && <CircularProgress isIndeterminate color="teal" size="100" thickness="5px" /> ||

              <Stack spacing={5} mt="5">
                <Text fontWeight="bold">Trade Type</Text>

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

                {drawerInMintNFT && <>
                  <Text fontWeight="bold">NFT Title</Text>
                  <Input placeholder="NFT Title" value={dataNFTTitle} onChange={(event) => setDataNFTTitle(event.currentTarget.value)} />

                  <Text fontWeight="bold">NFT Description</Text>
                  <Textarea placeholder="Enter a detailed NFT description here" value={dataNFTDesc} onChange={(event) => setDataNFTDesc(event.currentTarget.value)} />

                  <Text fontWeight="bold">Price (in {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)})</Text>
                  <NumberInput size="md" maxW={24} step={1} defaultValue={0} min={0} max={10} value={dataNFTFeeInTokens} onChange={(valueString) => setDataNFTFeeInTokens(parseInt(valueString))}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Text colorScheme="gray" fontSize="sm">Data NFTs can be sold in {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)} or ETH -
                    <Tooltip label={`If you trade your Data NFT in the Itheum Data NFT marketplace you cantTrade it in ${CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)}. You can also trade it in ETH by using the OpenSea marketplace. Unsure what to do? Set a ${CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)} price for now.`} aria-label="A tooltip"> [Tell me more]
                    </Tooltip>
                  </Text>

                  <Text fontWeight="bold">Number of copies (Coming soon...)</Text>
                  <NumberInput isDisabled={true} size="md" maxW={24} step={1} defaultValue={1} min={1} max={20} value={dataNFTCopies} onChange={(valueString) => setDataNFTCopies(parseInt(valueString))}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Text colorScheme="gray" fontSize="sm">Limit the quality to increase value (rarity) - suggested: less than 10</Text>

                  <Text fontWeight="bold">Royalties (Coming soon...)</Text>
                  <NumberInput isDisabled={true} size="md" maxW={24} step={10} defaultValue={0} min={0} max={30} value={dataNFTRoyalty} onChange={(valueString) => setDataNFTRoyalty(parseInt(valueString))}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Text colorScheme="gray" fontSize="sm">Suggested: 0%, 10%, 20%, 30%</Text>
                </> || <>
                  <Text fontWeight="bold">{!drawerInMintNFT && 'Data Payload Preview/Summary:' || 'NFT Title'}</Text>
                  <Input placeholder="Data Preview" value={sellerDataPreview} onChange={(event) => setSellerDataPreview(event.currentTarget.value)} />
                </>}

                <HStack>
                  <Text fontWeight="bold">Data Payload for Trade:</Text>
                  <Tooltip label="Only a JSON file with a '.json' extension that is larger than 100 bytes and smaller than 1.5 megabytes is allowed" aria-label="Upload Requirements">
                    <Text fontSize="sm">[Upload Requirements]</Text>
                  </Tooltip>
                </HStack>

                {isArbirData && <>
                  <Box {...getRootProps({ style })}>
                    <input {...getInputProps()} />
                    <Text>Drag 'n' drop a .json file here, or click to select a file</Text>
                  </Box>
                </>}

                {(fileRejections && fileRejections.length > 0) && <Alert status="error">
                  <AlertIcon />
                  {fileValidatorUiError(fileRejections)}
                </Alert>}

                {sellerData && <>
                  <Collapse startingHeight={150} in={showCode}>
                    <Code>{sellerData}</Code>
                  </Collapse>

                  <Button onClick={handleCodeShowToggle} mt="1rem">
                    Show {showCode ? 'Less' : 'More'}
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

                {!drawerInMintNFT && <Text mt="10" fontSize="xl" fontWeight="bold">Estimated Earnings: 2 {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)}
                </Text>}

                <Flex>
                  {!drawerInMintNFT && <ChainSupportedInput feature={MENU.SELL}><Button mt="5" mr="5" colorScheme="teal" isLoading={isProgressModalOpen} onClick={dataPackSellSubmit}>Place for Trade as Data Pack</Button></ChainSupportedInput>}
                  {drawerInMintNFT && <ChainSupportedInput feature={MENU.SELL}><Button mt="5" colorScheme="teal" isLoading={isProgressModalOpen} onClick={dataNFTSellSubmit}>Mint and Trade as NFT</Button></ChainSupportedInput>}
                </Flex>
              </Stack>}

            <Modal
              isOpen={isProgressModalOpen}
              onClose={closeProgressModal}
              closeOnEsc={false} closeOnOverlayClick={false}
            >
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Data Advertising Progress</ModalHeader>
                <ModalBody pb={6}>
                  <Stack spacing={5}>
                    <HStack>
                      {!saveProgress.s1 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                      <Text>Building data file</Text>
                    </HStack>

                    <HStack>
                      {!saveProgress.s2 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                      <Text>Generating unique tamper-proof data signature {drawerInMintNFT && 'and your unique NFT image'}</Text>
                    </HStack>

                    {dataNFTImg && <>
                      <Skeleton isLoaded={oneNFTImgLoaded} h={200} margin="auto">
                        <Center>
                          <Image src={dataNFTImg} h={200} w={200} borderRadius="md" onLoad={() => setOneNFTImgLoaded(true)} />
                        </Center>
                      </Skeleton>
                      <Box textAlign="center"><Text fontSize="xs">This image was created using the unique data signature (it's one of a kind!)</Text></Box>
                    </>}

                    {!drawerInMintNFT && <>
                      <HStack>
                        {!saveProgress.s3 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                        <Text>Saving to storage</Text>
                      </HStack>

                      <HStack>
                        {!saveProgress.s4 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                        <Text>Advertising for trade on blockchain</Text>
                      </HStack>

                      {txError &&
                        <Alert status="error">
                          <AlertIcon />
                          {txError.message && <AlertTitle>{txError.message}</AlertTitle>}
                        </Alert>
                      }
                    </>}

                    {txHash && <Stack>
                      <Progress colorScheme="teal" fontSize="sm" value={(100 / uxConfig.txConfirmationsNeededLrg) * txConfirmation} />

                      <HStack>
                        <Text fontSize="sm">Transaction </Text>
                        <ShortAddress address={txHash} />
                        <Link href={`${CHAIN_TX_VIEWER[_chainMeta.networkId]}${txHash}`} isExternal> <ExternalLinkIcon mx="2px" /></Link>
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
                        <Text>Minting your new Data NFT on blockchain</Text>
                      </HStack>

                      {txNFTHash &&
                        <Stack>
                          <Progress colorScheme="teal" fontSize="sm" value={(100 / uxConfig.txConfirmationsNeededLrg) * txNFTConfirmation} />

                          <HStack>
                            <Text fontSize="sm">Transaction </Text>
                            <ShortAddress address={txNFTHash} />
                            <Link href={`${CHAIN_TX_VIEWER[_chainMeta.networkId]}${txNFTHash}`} isExternal> <ExternalLinkIcon mx="2px" /></Link>
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
                        <Text>Advertising for trade as a Data NFT</Text>
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

      <Drawer onClose={onRfMount} isOpen={isDrawerOpenTradeStream} size="xl" closeOnEsc={false} closeOnOverlayClick={false}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <HStack spacing="5">
              <CloseButton size="lg" onClick={onRfMount} />
              {currSellObject && <Stack><Text fontSize="2xl">Trade data from your <Text color="teal" fontSize="2xl">{currSellObject.programName}</Text> program</Text></Stack>}
            </HStack>
          </DrawerHeader>
          <DrawerBody>
            {(fetchDataLoading && !isArbirData) && <CircularProgress isIndeterminate color="teal" size="100" thickness="5px" /> ||

              <Stack spacing={5} mt="5">
                <Text fontWeight="bold">Trade a Data Stream as a Data NFT</Text>

                <Text fontWeight="bold">Data Stream URL</Text>
                <Input placeholder="https://itheumapi.com/readingsStream/a7d46790-bc9e-11e8-9158-a1b57f7315ac/70dc6bd0-59b0-11e8-8d54-2d562f6cba54" value={dataNFTStreamUrl} onChange={(event) => setDataNFTStreamUrl(event.currentTarget.value)} />

                <Text fontWeight="bold">Data Preview URL</Text>
                <Input placeholder="https://itheumapi.com/readingsStream/a7d46790-bc9e-11e8-9158-a1b57f7315ac/70dc6bd0-59b0-11e8-8d54-2d562f6cba54?preview=1" value={dataNFTStreamPreviewUrl} onChange={(event) => setDataNFTStreamPreviewUrl(event.currentTarget.value)} />

                <Text fontWeight="bold">Data Marshal Service</Text>
                <Input placeholder="https://itheumapi.com/ddex/dataMarshal" value={dataNFTMarshalService} onChange={(event) => setDataNFTMarshalService(event.currentTarget.value)} />

                <Text fontWeight="bold">NFT Title</Text>
                <Input placeholder="NFT Title" value={dataNFTTitle} onChange={(event) => setDataNFTTitle(event.currentTarget.value)} />

                <Text fontWeight="bold">NFT Description</Text>
                <Textarea placeholder="Enter a detailed NFT description here" value={dataNFTDesc} onChange={(event) => setDataNFTDesc(event.currentTarget.value)} />

                <Text fontWeight="bold">Price (in {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)})</Text>
                <NumberInput size="md" maxW={24} step={1} defaultValue={1} min={1} max={1000} value={dataNFTFeeInTokens} onChange={(valueString) => setDataNFTFeeInTokens(parseInt(valueString))}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>

                <Text fontWeight="bold">Number of copies</Text>
                <NumberInput size="md" maxW={24} step={1} defaultValue={1} min={1} max={20} value={dataNFTCopies} onChange={(valueString) => setDataNFTCopies(parseInt(valueString))}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text colorScheme="gray" fontSize="sm">Limit the quality to increase value (rarity) - suggested: less than 20</Text>

                <Text fontWeight="bold">Royalties</Text>
                <NumberInput size="md" maxW={24} step={5} defaultValue={0} min={0} max={80} value={dataNFTRoyalty} onChange={(valueString) => setDataNFTRoyalty(parseInt(valueString))}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text colorScheme="gray" fontSize="sm">Suggested: 0%, 10%, 20%, 30%</Text>

                <Flex>
                  <ChainSupportedInput feature={MENU.SELL}><Button mt="5" colorScheme="teal" isLoading={isProgressModalOpen} onClick={dataNFTSellSubmit}>Mint and Trade as NFT</Button></ChainSupportedInput>
                </Flex>
              </Stack>}

            <Modal
              isOpen={isProgressModalOpen}
              onClose={closeProgressModal}
              closeOnEsc={false} closeOnOverlayClick={false}
            >
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Data Advertising Progress</ModalHeader>
                <ModalBody pb={6}>
                  <Stack spacing={5}>
                    <HStack>
                      {!saveProgress.s1 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                      <Text>Generating encrypted data stream metadata</Text>
                    </HStack>

                    <HStack>
                      {!saveProgress.s2 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                      <Text>Generating unique tamper-proof data stream signature</Text>
                    </HStack>

                    {dataNFTImg && <>
                      <Skeleton isLoaded={oneNFTImgLoaded} h={200} margin="auto">
                        <Center>
                          <Image src={dataNFTImg} h={200} w={200} borderRadius="md" onLoad={() => setOneNFTImgLoaded(true)} />
                        </Center>
                      </Skeleton>
                      <Box textAlign="center"><Text fontSize="xs">This image was created using the unique data signature (it's one of a kind!)</Text></Box>
                    </>}

                    <HStack>
                      {!saveProgressNFT.n1 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                      <Text>Generating and saving NFT metadata file to IPFS</Text>
                    </HStack>

                    <HStack>
                      {!saveProgressNFT.n2 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                      <Text>Minting your new Data NFT on blockchain</Text>
                    </HStack>

                    {txNFTHash &&
                      <Stack>
                        <Progress colorScheme="teal" fontSize="sm" value={(100 / uxConfig.txConfirmationsNeededLrg) * txNFTConfirmation} />

                        <HStack>
                          <Text fontSize="sm">Transaction </Text>
                          <ShortAddress address={txNFTHash} />
                          <Link href={`${CHAIN_TX_VIEWER[_chainMeta.networkId]}${txNFTHash}`} isExternal> <ExternalLinkIcon mx="2px" /></Link>
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
                        <Text>Advertising for trade as a Data NFT</Text>
                      </HStack>
                    

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

                    {errDataNFTStreamGeneric &&
                      <Alert status="error">
                      <Stack >
                        <AlertTitle fontSize="md">
                          <AlertIcon mb={2} />Process Error</AlertTitle>
                          {errDataNFTStreamGeneric.message && <AlertDescription fontSize="md">{errDataNFTStreamGeneric.message}</AlertDescription>}
                          <CloseButton position="absolute" right="8px" top="8px" onClick={onRfMount} />
                      </Stack>
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
