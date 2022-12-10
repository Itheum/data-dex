import moment from 'moment';
import { useMemo, useEffect, useState, useCallback } from 'react';
import { Heading, Box, Stack } from '@chakra-ui/layout';
import { CheckCircleIcon } from '@chakra-ui/icons';
import {
  Button, Input, Text, HStack, Spinner, Skeleton, Center,
  Alert, AlertIcon, AlertTitle, AlertDescription, CloseButton, CircularProgress,
  Image, Badge, Wrap, Flex, Textarea, 
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  useToast, useDisclosure, Checkbox, Tag,
  Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverArrow, PopoverCloseButton, PopoverBody,
  Link,
} from '@chakra-ui/react';
import ChainSupportedInput from 'UtilComps/ChainSupportedInput';
import { useGetAccountInfo } from '@elrondnetwork/dapp-core/hooks/account';
import { DataNftMintContract } from 'Elrond/dataNftMint';
import { useTrackTransactionStatus, useGetPendingTransactions } from '@elrondnetwork/dapp-core/hooks';
import { ResultsParser } from '@elrondnetwork/erdjs';
import axios from 'axios';
import { NFTStorage, File } from 'nft.storage'
import mime from 'mime'

import {
  uxConfig,
  sleep,
  MENU,
  convertWeiToEsdt,
} from 'libs/util';
import { useChainMeta } from 'store/ChainMetaContext';
import { set } from 'lodash';
import { checkBalance } from 'Elrond/api';

const InputLabelWithPopover = ({ children, tkey }) => {
  let title = '', text = '';
  if (tkey === 'data-stream-url') {
    title = 'Data Stream URL';
    text = 'You need to host your data asset and make sure that it\'s publicly accessible behind a secure domain (one that starts with https://).';
  } else if (tkey === 'data-preview-url') {
    title = 'Data Preview URL';
    text = '-';
  } else if (tkey === 'data-marshal-url') {
    title = 'Data Marshal URL';
    text = '-';
  } else if (tkey === 'token-name') {
    title = 'Token Name (Short Title)';
    text = '-';
  } else if (tkey === 'dataset-title') {
    title = 'Dataset Title';
    text = '-';
  } else if (tkey === 'dataset-description') {
    title = 'Dataset Description';
    text = '-';
  } else if (tkey === 'number-of-copies') {
    title = 'Number of Copies';
    text = '-';
  } else if (tkey === 'royalties') {
    title = 'Royalties';
    text = '-';
  }
  
  return (
    <Flex>
      <Popover trigger='hover' placement='auto'>
        <PopoverTrigger>
          {children}
        </PopoverTrigger>
        <PopoverContent>
          <PopoverHeader fontWeight='semibold'>{title}</PopoverHeader>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverBody>
            {text}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Flex>
  );
}

const checkUrlReturns200 = async (url) => {
  // check that URL returns 200 code
  try {
    const res = await axios.get(url);
    return res.status === 200;
  } catch (err) {
    return false;
  }
}

export default function SellDataElrond({ onRfMount, itheumAccount }) {
  const { address: elrondAddress } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { chainMeta: _chainMeta, setChainMeta } = useChainMeta();
  const toast = useToast();
  const [sellerDataPreview, setSellerDataPreview] = useState('');
  const [sellerData, setSellerData] = useState('');
  const [isArbirData, setIsArbirData] = useState(false);
  const [saveProgress, setSaveProgress] = useState({ s1: 0, s2: 0, s3: 0, s4: 0 });
  const [mintingSuccessful, setMintingSuccessful] = useState(false);
  const { isOpen: isProgressModalOpen, onOpen: onProgressModalOpen, onClose: onProgressModalClose } = useDisclosure();
  const { isOpen: isDrawerOpenTradeStream, onOpen: onOpenDrawerTradeStream, onClose: onCloseDrawerTradeStream } = useDisclosure();
  const { isOpen: isReadTermsModalOpen, onOpen: onReadTermsModalOpen, onClose: onReadTermsModalClose } = useDisclosure();
  const [currSellObject, setCurrSellObject] = useState(null);
  const [fetchDataLoading, setFetchDataLoading] = useState(true);

  const [isStreamTrade, setIsStreamTrade] = useState(0);

  const [oneNFTImgLoaded, setOneNFTImgLoaded] = useState(false);
  const [dataNFTImg, setDataNFTImg] = useState(null);
  const [dataNFTTokenName, setDataNFTTokenName] = useState('');
  const [dataNFTCopies, setDataNFTCopies] = useState(1);
  const [dataNFTRoyalty, setDataNFTRoyalty] = useState(0);
  const [dataNFTStreamUrl, setDataNFTStreamUrl] = useState('');
  const [dataNFTStreamPreviewUrl, setDataNFTStreamPreviewUrl] = useState('');
  const [dataNFTMarshalService, setDataNFTMarshalService] = useState();
  const [errDataNFTStreamGeneric, setErrDataNFTStreamGeneric] = useState(null);

  const [datasetTitle, setDatasetTitle] = useState('');
  const [datasetDescription, setDatasetDescription] = useState('');
  const [readTermsChecked, setReadTermsChecked] = useState(false);

  const [minRoyalties, setMinRoyalties] = useState(-1);
  const [maxRoyalties, setMaxRoyalties] = useState(-1);
  const [maxSupply, setMaxSupply] = useState(-1);
  const [antiSpamTax, setAntiSpamTax] = useState(-1);

  const [dataNFTStreamUrlValid, setDataNFTStreamUrlValid] = useState(false);
  const [dataNFTStreamPreviewUrlValid, setDataNFTStreamPreviewUrlValid] = useState(false);
  const [dataNFTMarshalServiceValid, setDataNFTMarshalServiceValid] = useState(false);

  const [itheumBalance, setItheumBalance] = useState(0);
  const [enoughForAntiSpamTax, setEnoughForAntiSpamTax] = useState(false);

  const [mintDataNFTDisabled, setMintDataNFTDisabled] = useState(true);

  // query settings from Data NFT Minter SC
  useEffect(() => {
    (async() => {
      const elrondDataNftMintContract = new DataNftMintContract(_chainMeta.networkId);
      const interaction = elrondDataNftMintContract.contract.methods.getMinRoyalties();
      const query = interaction.check().buildQuery();
      const queryResponse = await elrondDataNftMintContract.networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();
      const { firstValue } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
      const value = firstValue.valueOf();
      setMinRoyalties(value.toNumber() / 100);
    })();
    (async() => {
      const elrondDataNftMintContract = new DataNftMintContract(_chainMeta.networkId);
      const interaction = elrondDataNftMintContract.contract.methods.getMaxRoyalties();
      const query = interaction.check().buildQuery();
      const queryResponse = await elrondDataNftMintContract.networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();
      const { firstValue } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
      const value = firstValue.valueOf();
      setMaxRoyalties(value.toNumber() / 100);
    })();
    (async() => {
      const elrondDataNftMintContract = new DataNftMintContract(_chainMeta.networkId);
      const interaction = elrondDataNftMintContract.contract.methods.getMaxSupply();
      const query = interaction.check().buildQuery();
      const queryResponse = await elrondDataNftMintContract.networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();
      const { firstValue } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
      const value = firstValue.valueOf();
      setMaxSupply(value.toNumber());
    })();
    (async() => {
      const elrondDataNftMintContract = new DataNftMintContract(_chainMeta.networkId);
      const interaction = elrondDataNftMintContract.contract.methods.getAntiSpamTax([_chainMeta.contracts.itheumToken]);
      const query = interaction.check().buildQuery();
      const queryResponse = await elrondDataNftMintContract.networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();
      const { firstValue } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
      const value = firstValue.valueOf();
      setAntiSpamTax(convertWeiToEsdt(value).toNumber());
    })();
  }, []);

  // query Itheum balance of User
  useState(() => {
    if (elrondAddress && _chainMeta) {
      (async () => {
        const data = await checkBalance(_chainMeta.contracts.itheumToken, elrondAddress, _chainMeta.networkId);
        if (typeof data.balance !== 'undefined') {
          setItheumBalance(convertWeiToEsdt(data.balance).toNumber());
        }
      })();
    }
  }, [elrondAddress, hasPendingTransactions]);

  // set initial states for validation
  useEffect(() => {
    onChangeDataNFTStreamUrl('');
    onChangeDataNFTStreamPreviewUrl('');
    onChangeDataNFTMarshalService('https://itheumapi.com/ddex/datamarshal/v1/services/generate');
    // onChangeDataNFTTokenName('SampleTokenName');
    // onChangeDatasetTitle('Sample Title');
    // onChangeDatasetDescription('Sample Description');
    onChangeDataNFTTokenName('');
    onChangeDatasetTitle('');
    onChangeDatasetDescription('');
    onChangeDataNFTCopies(1);
    onChangeDataNFTRoyalty(0);

    setMinRoyalties(-2);
    setMaxRoyalties(-2);
    setMaxSupply(-2);
    setAntiSpamTax(-2);
  }, []);

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // validation logic

  const [dataNFTStreamUrlError, setDataNFTStreamUrlError] = useState('');
  const onChangeDataNFTStreamUrl = (value) => {
    let error = '';
    if (!value.startsWith('https://')) {
      error = 'Data Stream URL must start with \'https://\'';
    } else if (value.includes(' ')) {
      error = 'Data Stream URL cannot contain spaces';
    } else if (value.length > 1000) {
      error = 'Length of Data Stream URL cannot exceed 1000';
    } else {
      checkUrlReturns200(value).then(res => setDataNFTStreamUrlValid(res));
    }

    setDataNFTStreamUrlError(error);
    setDataNFTStreamUrl(value);
  }

  const [dataNFTStreamPreviewUrlError, setDataNFTStreamPreviewUrlError] = useState('');
  const onChangeDataNFTStreamPreviewUrl = (value) => {
    let error = '';
    if (!value.startsWith('https://')) {
      error = 'Data Preview URL must start with \'https://\'';
    } else if (value.includes(' ')) {
      error = 'Data Preview URL cannot contain spaces';
    } else if (value.length > 1000) {
      error = 'Length of Data Preview URL cannot exceed 1000';
    } else {
      checkUrlReturns200(value).then(res => setDataNFTStreamPreviewUrlValid(res));
    }

    setDataNFTStreamPreviewUrlError(error);
    setDataNFTStreamPreviewUrl(value);
  }

  const onChangeDataNFTMarshalService = (value) => {
    // Itheum Data Marshal Service Check
    checkUrlReturns200('https://itheumapi.com/health-check').then(res => setDataNFTMarshalServiceValid(res)); // does not return 200 :(
    setDataNFTMarshalServiceValid(true);

    setDataNFTMarshalService(value);
  }
  
  const [dataNFTTokenNameError, setDataNFTTokenNameError] = useState('');
  const onChangeDataNFTTokenName = (value) => {
    let error = '';
    if (value.length < 3 || value.length > 20) {
      error = 'Length of Token Name must be between 3 and 20 characters';
    } else if (!value.match(/^[0-9a-zA-Z]+$/)) {
      error = 'Token Name can only contain alphanumeric characters';
    }

    setDataNFTTokenNameError(error);
    setDataNFTTokenName(value);
  }

  const [datasetTitleError, setDatasetTitleError] = useState('');
  const onChangeDatasetTitle = (value) => {
    let error = '';
    if (value.length < 10 || value.length > 50) {
      error = 'Length of Dataset Title must be between 10 and 50 characters';
    } else if (!value.match(/^[0-9a-zA-Z\s]+$/)) {
      error = 'Dataset Title can only contain alphanumeric characters';
    }

    setDatasetTitleError(error);
    setDatasetTitle(value);
  }

  const [datasetDescriptionError, setDatasetDescriptionError] = useState('');
  const onChangeDatasetDescription = (value) => {
    let error = '';
    if (value.length < 10 || value.length > 250) {
      error = 'Length of Dataset Description must be between 10 and 250 characters';
    }

    setDatasetDescriptionError(error);
    setDatasetDescription(value);
  }

  const [dataNFTCopiesError, setDataNFTCopiesError] = useState('');
  const onChangeDataNFTCopies = (value) => {
    let error = '';
    if (value < 1) {
      error = 'Number Of Compies cannot be zero';
    } else if (value > maxSupply) {
      error = `Number Of Compies cannot exceed ${maxSupply}`;
    }

    setDataNFTCopiesError(error);
    if (!error) {
      setDataNFTCopies(value);
    }
  }

  const [dataNFTRoyaltyError, setDataNFTRoyaltyError] = useState('');
  const onChangeDataNFTRoyalty = (value) => {
    let error = '';
    if (value < 0) {
      error = 'Royalties cannot be negative';
    } else if (value < minRoyalties) {
      error = `Royalties cannot be lower than ${minRoyalties}`;
    } else if (value > maxRoyalties) {
      error = `Royalties cannot be higher than ${maxRoyalties}`;
    }

    setDataNFTRoyaltyError(error);
    if (!error) {
      setDataNFTRoyalty(value);
    }
  }

  useEffect(() => {
    onChangeDataNFTRoyalty(dataNFTRoyalty);
  }, [minRoyalties, maxRoyalties]);
  useEffect(() => {
    onChangeDataNFTCopies(dataNFTCopies);
  }, [maxSupply]);

  useEffect(() => {
    setMintDataNFTDisabled(
      dataNFTStreamUrlError
      || dataNFTStreamPreviewUrlError
      || dataNFTTokenNameError
      || datasetTitleError
      || datasetDescriptionError
      || dataNFTCopiesError
      || dataNFTRoyaltyError
      || !dataNFTStreamUrlValid
      || !dataNFTStreamPreviewUrlValid
      || !dataNFTMarshalServiceValid
      || !readTermsChecked

      || minRoyalties < 0
      || maxRoyalties < 0
      || maxSupply < 0
      || antiSpamTax < 0

      || itheumBalance < antiSpamTax
    );
  }, [
    dataNFTStreamUrlError,
    dataNFTStreamPreviewUrlError,
    dataNFTTokenNameError,
    datasetTitleError,
    datasetDescriptionError,
    dataNFTCopiesError,
    dataNFTRoyaltyError,
    dataNFTStreamUrlValid,
    dataNFTStreamPreviewUrlValid,
    dataNFTMarshalServiceValid,
    readTermsChecked,

    minRoyalties,
    maxRoyalties,
    maxSupply,
    antiSpamTax,

    itheumBalance,
  ]);
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const mintTxFail = (foo) => {
    console.log('mintTxFail', foo);
    setErrDataNFTStreamGeneric(new Error('Transaction to mint data NFT has failed'));
  }

  const mintTxCancelled = (foo) => {
    console.log('mintTxCancelled', foo);
    setErrDataNFTStreamGeneric(new Error('Transaction to mint data NFT was cancelled'));
  }

  const mintTxSuccess = async(foo) => {
    console.log('mintTxSuccess', foo);
    setSaveProgress(prevSaveProgress => ({ ...prevSaveProgress, s4: 1 }));
    setMintingSuccessful(true);

    await sleep(3);
    closeProgressModal();
  }

  const [mintSessionId, setMintSessionId] = useState(null);

  const getDataForSale = (programId, isStreamTrade=false) => {
    if (isStreamTrade) {
      onOpenDrawerTradeStream();
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
      setDatasetDescription(previewStr)
      setSellerData(JSON.stringify(data));
    }

    setFetchDataLoading(false);
  }

  const dataNFTSellSubmit = async () => {
    if (!elrondAddress) {
      toast({
        title: 'Connect your wallet',
        status: 'error',
        isClosable: true,
      });
      return;
    }

    const res = await validateBaseInput();
    if (res) {
      if (isStreamTrade) {
        dataNFTDataStreamAdvertise();
      }
    }
  }

  const dataNFTDataStreamAdvertise = async () => {
    /*
      1) Call the data marshal and get a encrypted data stream url
      2) Get a sha256 hash for the encrypted data stream url and generate the robot img URL (s2)
        2.1) Save the Data NFT in Moralis and get the new moralis dataNFTId
      3) Call the NFT contract with meta file URI and get the new NFT ID (s3)
    */

    setMintingSuccessful(false);
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

    try {
      const res = await fetch('https://itheumapi.com/ddex/datamarshal/v1/services/generate', requestOptions);
      const data = await res.json();

      if (data && data.encryptedMessage && data.encryptionVector) {
        setSellerData(data.encryptedMessage); // the data URL is the seller data in this case
        setSaveProgress(prevSaveProgress => ({ ...prevSaveProgress, s1: 1 }));
  
        buildUniqueImage(data.messageHash);              
      } else {
        if (data.success === false) {
          setErrDataNFTStreamGeneric(new Error(`${data.error.code}, ${data.error.message}`));
        } else {
          setErrDataNFTStreamGeneric(new Error('Data Marshal responded with an unknown error trying to generate your encrypted links'));
        }
      }
    } catch(e) {
      setErrDataNFTStreamGeneric(e);
    }
  }

  async function createFileFromUrl(url){
    const res = await fetch(url);
    console.log('res', res);
    const data = await res.blob();
    const type = mime.getType(data)
    console.log('type', type);
    const _file = new File([data], 'image', { type: 'image/png' });
    console.log('file', _file);

    return _file;
  }

  const buildUniqueImage = async(dataNFTHash) => {
    await sleep(3);
    const newNFTImg = `https://itheumapi.com/bespoke/ddex/generateNFTArt?hash=${dataNFTHash}`;
    console.log('newNFTImg', newNFTImg);

    setSaveProgress(prevSaveProgress => ({ ...prevSaveProgress, s2: 1 }));

    // @TODO we should now take newNFTImg and store the image in IPFS and get the CID for storing on the NFT
    const image = await createFileFromUrl(newNFTImg);
    const nftstorage = new NFTStorage({ token: process.env.REACT_APP_ENV_NFT_STORAGE_KEY })
    const res = await nftstorage.storeBlob(image);
    console.log('res', res);

    if (!res) {
      setErrDataNFTStreamGeneric(new Error('Uploading the image on IPFS has failed'));
      return;
    }
    const imageOnIpfsUrl = `https://ipfs.io/ipfs/${res}`;
    console.log('imageOnIpfsUrl', imageOnIpfsUrl);

    setDataNFTImg(newNFTImg);
    setSaveProgress(prevSaveProgress => ({ ...prevSaveProgress, s3: 1 }));

    await sleep(3);
    
    handleOnChainMint(imageOnIpfsUrl);
  };

  const handleOnChainMint = async(newNFTImg) => {
    await sleep(3);
    const elrondDataNftMintContract = new DataNftMintContract(_chainMeta.networkId);

    const { sessionId, error } = await elrondDataNftMintContract.sendMintTransaction({
      name: dataNFTTokenName, 
      media: newNFTImg,
      data_marchal: dataNFTMarshalService, 
      data_stream: dataNFTStreamUrl, 
      data_preview: dataNFTStreamPreviewUrl, 
      royalties: Math.ceil(dataNFTRoyalty*100),
      amount: dataNFTCopies,
      
      title: datasetTitle,
      description: datasetDescription,

      sender: elrondAddress,

      itheumToken: _chainMeta.contracts.itheumToken,
      antiSpamTax: antiSpamTax,
    });

    setMintSessionId(sessionId);
  };

  const transactionStatus = useTrackTransactionStatus({
    transactionId: mintSessionId,
    onSuccess: mintTxSuccess,
    onFail: mintTxFail,
    onCancelled: mintTxCancelled,
  });
  
  const closeProgressModal = () => {
    toast({
      title: 'Success! Data NFT Minted. Head over to your "Data NFT Wallet" to view your new NFT',
      status: 'success',
      isClosable: true,
    });

    onProgressModalClose();
    onCloseDrawerTradeStream();

    // remount the component (quick way to rest all state to prestine)
    onRfMount();
  }

  async function validateBaseInput() {
    if (isStreamTrade) {
      if (!dataNFTStreamUrl.includes('https://') || !dataNFTStreamPreviewUrl.includes('https://') || !dataNFTMarshalService.includes('https://')) {
        toast('Your data stream url inputs dont seem to be valid. for e.g. stream URLs / marshal service URLs need to have https:// in it');
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
        toast('You need to provide some valid JSON for data!');
        return false;
      }
    }
  }

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
      </Wrap>

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

                {
                  (minRoyalties < 0 || maxRoyalties < 0 || maxSupply < 0 || antiSpamTax < 0)
                  && <Alert status="error">
                    <Stack >
                      <AlertTitle fontSize="md" mb={2}>
                        <AlertIcon display='inline-block' />
                        <Text display='inline-block' lineHeight='2' style={{ verticalAlign: 'middle' }}>Uptime Errors</Text>
                      </AlertTitle>
                      {minRoyalties < 0 && <AlertDescription fontSize="md">Min Royalties is not loaded from Smart Contract</AlertDescription>}
                      {maxRoyalties < 0 && <AlertDescription fontSize="md">Max Royalties is not loaded from Smart Contract</AlertDescription>}
                      {maxSupply < 0 && <AlertDescription fontSize="md">Max Supply is not loaded from Smart Contract</AlertDescription>}
                      {antiSpamTax < 0 && <AlertDescription fontSize="md">Anti-Spam Tax is not loaded from Smart Contract</AlertDescription>}
                    </Stack>
                  </Alert>
                }

                <Text fontSize='sm' color='gray.400'>* required fields</Text>
                <Text fontSize='sm' color='gray.400' mt='0 !important'>+ click on an item's title to learn more</Text>

                <Text fontWeight="bold" color="teal.200" fontSize='xl' mt='8 !important'>Data Asset Detail</Text>

                <InputLabelWithPopover tkey='data-stream-url'>
                  <Text fontWeight="bold" fontSize='md'>Data Stream URL *</Text>
                </InputLabelWithPopover>
                <Input
                  mt='1 !important'
                  placeholder="https://itheum-resources.s3.ap-southeast-2.amazonaws.com/json/THOR_EcoGP_Race1.csv"
                  value={dataNFTStreamUrl}
                  onChange={(event) => onChangeDataNFTStreamUrl(event.currentTarget.value)}
                />
                {dataNFTStreamUrlError && (
                  <Text color='red.400' fontSize='sm' mt='1 !important'>{dataNFTStreamUrlError}</Text>
                )}
                {!dataNFTStreamUrlValid && (
                    <Text color='red.400' fontSize='sm' mt='1 !important'>Data Stream URL does not return 200 code</Text>
                )}

                <InputLabelWithPopover tkey='data-preview-url'>
                  <Text fontWeight="bold" fontSize='md'>Data Preview URL *</Text>
                </InputLabelWithPopover>
                <Input
                  mt='1 !important'
                  placeholder="https://itheumapi.com/readingsStream/a7d46790-bc9e-11e8-9158-a1b57f7315ac/70dc6bd0-59b0-11e8-8d54-2d562f6cba54?preview=1"
                  value={dataNFTStreamPreviewUrl}
                  onChange={(event) => onChangeDataNFTStreamPreviewUrl(event.currentTarget.value)}
                />
                {dataNFTStreamPreviewUrlError && (
                  <Text color='red.400' fontSize='sm' mt='1 !important'>{dataNFTStreamPreviewUrlError}</Text>
                )}
                {!dataNFTStreamPreviewUrlValid && (
                    <Text color='red.400' fontSize='sm' mt='1 !important'>Data Stream Preview URL does not return 200 code</Text>
                )}

                <InputLabelWithPopover tkey='data-marshal-url'>
                  <Text fontWeight="bold" fontSize='md'>Data Marshal Url</Text>
                </InputLabelWithPopover>
                <Input
                  mt='1 !important'
                  value={dataNFTMarshalService}
                  disabled
                />
                {!dataNFTMarshalServiceValid && (
                    <Text color='red.400' fontSize='sm' mt='1 !important'>Data Marshal Service does not return 200 code</Text>
                )}

                <Text fontWeight="bold" color="teal.200" fontSize='xl' mt='8 !important'>NFT Token Metadata</Text>

                <InputLabelWithPopover tkey='token-name'>
                  <Text fontWeight="bold" fontSize='md'>Token Name (Short Title) *</Text>
                </InputLabelWithPopover>
                <Input
                  mt='1 !important'
                  placeholder="NFT Token Name"
                  value={dataNFTTokenName}
                  onChange={(event) => onChangeDataNFTTokenName(event.currentTarget.value)}
                />
                <Text color="gray.400" fontSize='sm' mt='0 !important'>Between 3 and 20 alphanumeric characters only</Text>
                {dataNFTTokenNameError && (
                  <Text color='red.400' fontSize='sm' mt='1 !important'>{dataNFTTokenNameError}</Text>
                )}

                <InputLabelWithPopover tkey='dataset-title'>
                  <Text fontWeight="bold" fontSize='md'>Dataset Title *</Text>
                </InputLabelWithPopover>
                <Input
                  mt='1 !important'
                  placeholder="Dataset Title"
                  value={datasetTitle}
                  onChange={(event) => onChangeDatasetTitle(event.currentTarget.value)}
                />
                <Text color="gray.400" fontSize='sm' mt='0 !important'>Between 10 and 50 alphanumeric characters only</Text>
                {datasetTitleError && (
                  <Text color='red.400' fontSize='sm' mt='1 !important'>{datasetTitleError}</Text>
                )}

                <InputLabelWithPopover tkey='dataset-description'>
                  <Text fontWeight="bold" fontSize='md'>Dataset Description *</Text>
                </InputLabelWithPopover>
                <Textarea
                  mt='1 !important'
                  placeholder="Enter a description here"
                  value={datasetDescription}
                  onChange={(event) => onChangeDatasetDescription(event.currentTarget.value)}
                />
                <Text color="gray.400" fontSize='sm' mt='0 !important'>Between 10 and 250 characters only. URL allowed. Markdown (MD) allowed.</Text>
                {datasetDescriptionError && (
                  <Text color='red.400' fontSize='sm' mt='1 !important'>{datasetDescriptionError}</Text>
                )}

                <InputLabelWithPopover tkey='number-of-copies'>
                  <Text fontWeight="bold" fontSize='md'>Number of copies</Text>
                </InputLabelWithPopover>
                <NumberInput
                  mt='1 !important'
                  size="md"
                  maxW={24}
                  step={1}
                  defaultValue={1}
                  value={dataNFTCopies}
                  onChange={(valueString) => onChangeDataNFTCopies(parseInt(valueString))}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text color="gray.400" fontSize="sm" mt='0 !important'>Limit the quality to increase value (rarity) - Suggested: less than {maxSupply}</Text>
                {dataNFTCopiesError && (
                  <Text color='red.400' fontSize='sm' mt='1 !important'>{dataNFTCopiesError}</Text>
                )}

                <InputLabelWithPopover tkey='royalties'>
                  <Text fontWeight="bold" fontSize='md'>Royalties</Text>
                </InputLabelWithPopover>
                <NumberInput
                  mt='1 !important'
                  size="md"
                  maxW={24}
                  step={5}
                  defaultValue={0}
                  value={dataNFTRoyalty}
                  onChange={(valueString) => onChangeDataNFTRoyalty(parseInt(valueString))}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text color="gray.400" fontSize="sm" mt='0 !important'>Min: {minRoyalties >= 0 ? minRoyalties : '-'}%, Max: {maxRoyalties >= 0 ? maxRoyalties : '-'}%</Text>
                {dataNFTRoyaltyError && (
                  <Text color='red.400' fontSize='sm' mt='1 !important'>{dataNFTRoyaltyError}</Text>
                )}

                <Text fontWeight="bold" color="teal.200" fontSize='xl' mt='8 !important'>Terms and Fees</Text>
                <Text fontSize='md' mt='4 !important'>Minting a Data NFT and putting it for trade on the Data DEX means you have to agree to some strict “terms of use”, as an example, you agree that the data is free of any illegal material and that it does not breach any copyright laws. You also agree to make sure the Data Stream URL is always online. Given it's an NFT, you also have limitations like not being able to update the title, description, royalty etc. But there are other condisiton too. Take some time to read these “terms of use” before you proceed. It's very important that you do.</Text>
                <Flex mt='3 !important'><Button colorScheme="teal" variant='outline' size='sm' onClick={onReadTermsModalOpen}>Read Terms of Use</Button></Flex>
                <Checkbox
                  size='md'
                  mt='3 !important'
                  isChecked={readTermsChecked}
                  onChange={e => setReadTermsChecked(e.target.checked)}
                >I have read all terms and agree to them</Checkbox>
                {!readTermsChecked && (
                  <Text color='red.400' fontSize='sm' mt='1 !important'>You must agree on Terms of Use</Text>
                )}

                <Text fontSize='md' mt='8 !important'>An “anti-spam fee” is required to ensure that the Data DEX does not get impacted by spam datasets created by bad actors. This fee will be dynamically adjusted by the protocol based on ongoing curation discovery by the Itheum DAO.</Text>
                <Flex mt='3 !important'><Tag variant='solid' colorScheme='teal'>Anti-Spam Fee is currently {antiSpamTax < 0 ? '?' : antiSpamTax} ITHEUM tokens</Tag></Flex>
                {itheumBalance < antiSpamTax && (
                    <Text color='red.400' fontSize='sm' mt='1 !important'>You don't have enough ITHEUM for Anti-Spam Tax</Text>
                )}
                <Flex mt='3 !important'><Button colorScheme="teal" variant='outline' size='sm' onClick={onReadTermsModalOpen}>Read about the Anti-Spam fee</Button></Flex>

                <Flex>
                  <ChainSupportedInput feature={MENU.SELL}>
                    <Button
                      mt="5"
                      colorScheme="teal"
                      isLoading={isProgressModalOpen}
                      onClick={dataNFTSellSubmit}
                      disabled={mintDataNFTDisabled}
                    >
                      Mint and Trade as NFT
                    </Button>
                  </ChainSupportedInput>
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
                      {!saveProgress.s3 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                      <Text>Saving NFT Metadata to IPFS</Text>
                    </HStack>

                    
                    <HStack>
                      {!saveProgress.s4 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                      <Text>Minting your new data NFT on blockchain</Text>
                    </HStack>
                    {
                      mintingSuccessful && <Box textAlign='center' mt='6'>
                        <Alert status='success'>
                          <Text colorScheme='teal'>Success, Your Data NFT has been minted on the MultiversX Blockchain</Text>
                        </Alert>
                        <Link href='datanfts/wallet' textDecoration='none' _hover={{ textDecoration: 'none' }}>
                          <Button colorScheme='teal' mt='4'>Head over to your Data NFT Wallet to see it!</Button>
                        </Link>
                      </Box>
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

      <Modal
        isOpen={isReadTermsModalOpen}
        onClose={onReadTermsModalClose}
        closeOnEsc={false} closeOnOverlayClick={false}
      >
        <ModalOverlay
          bg='blackAlpha.700'
          backdropFilter='blur(10px) hue-rotate(90deg)'
          />
        <ModalContent>
          <ModalHeader>Data NFT-FT Terms of Use</ModalHeader>
          <ModalBody pb={6}>
            <Text>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</Text>
            <Flex justifyContent='end' mt='6 !important'><Button colorScheme="teal" onClick={onReadTermsModalClose}>I have read this</Button></Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Stack>
  );
};
