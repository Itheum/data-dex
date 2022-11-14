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
  useToast, useDisclosure
} from '@chakra-ui/react';
import ChainSupportedInput from 'UtilComps/ChainSupportedInput';
import { useGetAccountInfo } from '@elrondnetwork/dapp-core';
import { DataNftMintContract } from 'Elrond/dataNftMint';

import { uxConfig, dataTemplates, sleep } from 'libs/util';
import { TERMS, CHAIN_TX_VIEWER, CHAIN_TOKEN_SYMBOL, MENU } from 'libs/util';
import { ABIS } from 'EVM/ABIs';
import ShortAddress from 'UtilComps/ShortAddress';
import IconButton from 'UtilComps/IconButton';
import { useChainMeta } from 'store/ChainMetaContext';

// import { useTrackTransactionStatus, useGetFailedTransactions, useGetSuccessfulTransactions } from '@elrondnetwork/dapp-core';
import { transactionServices } from '@elrondnetwork/dapp-core';

export default function ({ onRfMount, itheumAccount }) {
  const { address: elrondAddress } = useGetAccountInfo();

  const { chainMeta: _chainMeta, setChainMeta } = useChainMeta();
  const toast = useToast();
  const [sellerDataPreview, setSellerDataPreview] = useState('');
  const [sellerData, setSellerData] = useState('');
  const [isArbirData, setIsArbirData] = useState(false);
  const [saveProgress, setSaveProgress] = useState({ s1: 0, s2: 0, s3: 0 });
  const { isOpen: isProgressModalOpen, onOpen: onProgressModalOpen, onClose: onProgressModalClose } = useDisclosure();
  const { isOpen: isDrawerOpenTradeStream, onOpen: onOpenDrawerTradeStream, onClose: onCloseDrawerTradeStream } = useDisclosure();
  const [currSellObject, setCurrSellObject] = useState(null);
  const [fetchDataLoading, setFetchDataLoading] = useState(true);

  const [isStreamTrade, setIsStreamTrade] = useState(0);

  const [oneNFTImgLoaded, setOneNFTImgLoaded] = useState(false);
  const [newNFTId, setNewNFTId] = useState(null); // newly created token ID from blockchain
  const [dataNFTImg, setDataNFTImg] = useState(null);
  const [dataNFTTokenName, setDataNFTTokenName] = useState('');
  const [dataNFTDesc, setDataNFTDesc] = useState('');
  const [dataNFTCopies, setDataNFTCopies] = useState(1);
  const [dataNFTRoyalty, setDataNFTRoyalty] = useState(0);
  const [dataNFTFeeInTokens, setDataNFTFeeInTokens] = useState(1);
  const [dataNFTStreamUrl, setDataNFTStreamUrl] = useState('https://itheum-resources.s3.ap-southeast-2.amazonaws.com/json/THOR_EcoGP_Race1.csv');
  const [dataNFTStreamPreviewUrl, setDataNFTStreamPreviewUrl] = useState('https://itheumapi.com/readingsStream/a7d46790-bc9e-11e8-9158-a1b57f7315ac/70dc6bd0-59b0-11e8-8d54-2d562f6cba54?preview=1');
  const [dataNFTMarshalService, setDataNFTMarshalService] = useState('https://itheumapi.com/ddex/datamarshal/v1/services/generate');
  const [errDataNFTStreamGeneric, setErrDataNFTStreamGeneric] = useState(null);


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
    setSaveProgress(prevSaveProgress => ({ ...prevSaveProgress, s3: 1 }));

    await sleep(3);

    closeProgressModal();
  }


  const [mintSessionId, setMintSessionId] = useState(null);
  const mintTxStatus = transactionServices.useTrackTransactionStatus({
    transactionId: mintSessionId,
    onSuccess: mintTxSuccess,
    onFail: mintTxFail,
    onCancelled: mintTxCancelled,
  });

  // useEffect(() => {
  //   console.log('mintTxStatus', mintTxStatus);
  // }, [mintTxStatus]);


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
      setDataNFTDesc(previewStr)
      setSellerData(JSON.stringify(data));
    }

    setFetchDataLoading(false);
  }

  const dataNFTSellSubmit = async () => {
    if (elrondAddress) {
      if (validateBaseInput()) {
        if (isStreamTrade) {
          dataNFTDataStreamAdvertise();
        }   
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

  const buildUniqueImage = async(dataNFTHash) => {
    await sleep(3);
    const newNFTImg = `https://itheumapi.com/bespoke/ddex/generateNFTArt?hash=${dataNFTHash}`;

    // @TODO we should now take newNFTImg and store the image in IPFS and get the CID for storing on the NFT

    setDataNFTImg(newNFTImg);
    setSaveProgress(prevSaveProgress => ({ ...prevSaveProgress, s2: 1 }));

    await sleep(3);
    
    handleOnChainMint(newNFTImg);
  };

  const handleOnChainMint = async(newNFTImg) => {
    await sleep(3);
    const elrondDataNftMintContract = new DataNftMintContract(_chainMeta.networkId);

    const status = await elrondDataNftMintContract.sendMintTransaction({
      name: dataNFTTokenName, 
      media: newNFTImg,
      data_marchal: dataNFTMarshalService, 
      data_stream: dataNFTStreamUrl, 
      data_preview: dataNFTStreamPreviewUrl, 
      royalties: Math.ceil(dataNFTRoyalty*100),
      amount: dataNFTCopies
    });

    console.log(status);

    setMintSessionId(status.sessionId);    
  };

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

  function validateBaseInput() {
    if (!dataNFTTokenName || dataNFTTokenName.trim() === '') {
      alert('You need to provide a NFT token name!');
      return false;
    } 
    // else if (!dataNFTDesc) {
    //   alert('You need to provide a NFT Description!');
    //   return false;
    // }

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
                <Button mt="3" colorScheme="teal" variant="outline" onClick={() => getDataForSale(item.program)}>Trade Program Data</Button>
              </Box>

            </Box>
          ))}
        </Wrap>}

      <Wrap shouldWrapChildren={true} wrap="wrap" spacing={5}>
        <Box maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
          <Image src="https://itheum-static.s3.ap-southeast-2.amazonaws.com/data-stream.png" alt=""/>

          <Box p="6">
            <Box d="flex" alignItems="baseline">
              <Box
                mt="1"
                fontWeight="semibold"
                as="h4"
                lineHeight="tight"
                isTruncated>
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

                <Text fontWeight="bold">Data Stream URL</Text>
                <Input placeholder="https://itheum-resources.s3.ap-southeast-2.amazonaws.com/json/THOR_EcoGP_Race1.csv" value={dataNFTStreamUrl} onChange={(event) => setDataNFTStreamUrl(event.currentTarget.value)} />

                {/* <Text fontWeight="bold">Data Preview URL</Text>
                <Input placeholder="https://itheumapi.com/readingsStream/a7d46790-bc9e-11e8-9158-a1b57f7315ac/70dc6bd0-59b0-11e8-8d54-2d562f6cba54?preview=1" value={dataNFTStreamPreviewUrl} onChange={(event) => setDataNFTStreamPreviewUrl(event.currentTarget.value)} /> */}

                <Text fontWeight="bold">Data Marshal Service</Text>
                <Input placeholder="https://itheumapi.com/ddex/dataMarshal" value={dataNFTMarshalService} onChange={(event) => setDataNFTMarshalService(event.currentTarget.value)} />

                <Text fontWeight="bold">NFT Token Name</Text>
                <Input placeholder="NFT Token Name" value={dataNFTTokenName} onChange={(event) => setDataNFTTokenName(event.currentTarget.value)} />

                {/* <Text fontWeight="bold">NFT Description</Text>
                <Textarea placeholder="Enter a description here" value={dataNFTDesc} onChange={(event) => setDataNFTDesc(event.currentTarget.value)} /> */}

                {/* <Text fontWeight="bold">Price (in {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)})</Text>
                <NumberInput size="md" maxW={24} step={1} defaultValue={1} min={1} max={1000} value={dataNFTFeeInTokens} onChange={(valueString) => setDataNFTFeeInTokens(parseInt(valueString))}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput> */}

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
                      {!saveProgress.s3 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                      <Text>Minting your new data NFT on blockchain</Text>
                    </HStack>

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
