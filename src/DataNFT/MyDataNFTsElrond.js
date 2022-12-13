import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Box, Stack } from '@chakra-ui/layout';
import {
  Skeleton, Button, HStack, Badge,
  Alert, AlertIcon, AlertTitle, Heading, Image, Flex, Link, Text, Tooltip, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, Spinner, AlertDescription, CloseButton,
  useDisclosure,
  Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverArrow, PopoverCloseButton, PopoverBody,
} from '@chakra-ui/react';
import { ExternalLinkIcon, CheckCircleIcon } from '@chakra-ui/icons';
import ShortAddress from 'UtilComps/ShortAddress';
import SkeletonLoadingList from 'UtilComps/SkeletonLoadingList';
import { sleep, uxConfig, contractsForChain, consoleNotice } from 'libs/util';
import { CHAIN_TOKEN_SYMBOL, OPENSEA_CHAIN_NAMES, CHAIN_NAMES, CHAIN_TX_VIEWER } from 'libs/util';
import { useChainMeta } from 'store/ChainMetaContext';
import { getNftsOfAcollectionForAnAddress } from 'Elrond/api';
import { useGetAccountInfo } from '@elrondnetwork/dapp-core/hooks/account';
import { useGetPendingTransactions } from '@elrondnetwork/dapp-core/hooks/transactions';
import dataNftMintJson from '../Elrond/ABIs/datanftmint.abi.json';
import { AbiRegistry, ArgSerializer, BinaryCodec, EndpointParameterDefinition, SmartContractAbi, StructType, Type } from '@elrondnetwork/erdjs/out';
import { DataNftMarketContract } from 'Elrond/dataNftMarket';

export default function MyDataNFTsElrond({ onRfMount }) {
  const { chainMeta: _chainMeta, setChainMeta } = useChainMeta();
  const { address } = useGetAccountInfo();
  const [onChainNFTs, setOnChainNFTs] = useState(null);
  const [usersDataNFTCatalog, setUsersDataNFTCatalog] = useState(null);
  const [oneNFTImgLoaded, setOneNFTImgLoaded] = useState(false);
  const [noData, setNoData] = useState(false);
  const [amounts, setAmounts] = useState([]);
  const [prices, setPrices] = useState([]);
  const [unlockAccessProgress, setUnlockAccessProgress] = useState({ s1: 0, s2: 0, s3: 0 });
  const [errUnlockAccessGeneric, setErrUnlockAccessGeneric] = useState(null);

  const { isOpen: isBurnNFTOpen, onOpen: onBurnNFTOpen, onClose: onBurnNFTClose } = useDisclosure();
  const { isOpen: isAccessProgressModalOpen, onOpen: onAccessProgressModalOpen, onClose: onAccessProgressModalClose } = useDisclosure();

  const [burnNFTModalState, setBurnNFTModalState] = useState(1);  // 1 and 2
  useEffect(() => {
    if (!isBurnNFTOpen) {
      setBurnNFTModalState(1);  // set state 1 when the modal is closed
    }
  }, [isBurnNFTOpen]);

  const contract = new DataNftMarketContract(_chainMeta.networkId);

  const { hasPendingTransactions } = useGetPendingTransactions();

  useEffect(() => {
    // hasPendingTransactions will fire with false during init and then move from true to false each time a tranasaction is done... so if it's 'false' we need to get balances    
    if (!hasPendingTransactions) {
      getOnChainNFTs();
    }
  }, [hasPendingTransactions]);

  // use this effect to parse  the raw data into a catalog that is easier to render in the UI
  useEffect(() => {
    const parseOnChainNfts = async () => {
      if (onChainNFTs !== null) {
        if (onChainNFTs.length > 0) {
          const codec = new BinaryCodec();
          const json = JSON.parse(JSON.stringify(dataNftMintJson));
          const abiRegistry = AbiRegistry.create(json);
          const abi = new SmartContractAbi(abiRegistry, ['DataNftMint']);
          const dataNftAttributes = abiRegistry.getStruct('DataNftAttributes');

          // some logic to loop through the raw onChainNFTs and build the usersDataNFTCatalog
          const usersDataNFTCatalogLocal = [];
          let amounts = [];
          let prices = [];
          onChainNFTs.forEach(nft => {
            const decodedAttributes = codec.decodeTopLevel(Buffer.from(nft['attributes'], 'base64'), dataNftAttributes).valueOf();
            const dataNFT = {};
            dataNFT.id = nft['identifier']; // ID of NFT -> done
            dataNFT.nftImgUrl = nft['url']; // image URL of of NFT -> done
            dataNFT.dataPreview = decodedAttributes['data_preview_url'].toString(); // preview URL for NFT data stream -> done
            dataNFT.dataStream = decodedAttributes['data_stream_url'].toString(); // data stream URL -> done
            dataNFT.dataMarshal = decodedAttributes['data_marshal_url'].toString(); // data stream URL -> done
            dataNFT.tokenName = nft['name']; // is this different to NFT ID? -> yes, name can be chosen by the user
            dataNFT.feeInTokens = '100' // how much in ITHEUM tokens => should not appear here as it's in the wallet, not on the market
            dataNFT.creator = decodedAttributes['creator'].toString(); // initial creator of NFT
            dataNFT.creationTime = new Date(Number(decodedAttributes['creation_time']) * 1000); // initial creation time of NFT
            dataNFT.supply = nft['supply'];
            dataNFT.balance = nft['balance'];
            dataNFT.description = decodedAttributes['description'].toString();
            dataNFT.title = decodedAttributes['title'].toString();
            dataNFT.royalties = nft['royalties'] / 100;
            dataNFT.nonce = nft['nonce'];
            dataNFT.collection = nft['collection'];
            amounts.push(1);
            prices.push(10);
            usersDataNFTCatalogLocal.push(dataNFT);
          });
          setAmounts(amounts);
          setPrices(prices);
          console.log('usersDataNFTCatalogLocal');
          console.log(usersDataNFTCatalogLocal);

          setUsersDataNFTCatalog(usersDataNFTCatalogLocal);
        } else {
          await sleep(5);
          setNoData(true);
        }
      }
    };
    parseOnChainNfts();
  }, [onChainNFTs]);

  // get the raw NFT data from the blockchain for the user
  const getOnChainNFTs = async() => {
    const onChainNfts = await getNftsOfAcollectionForAnAddress(address,'DATANFTV2-758cf1','not_E1');

    console.log('onChainNfts');
    console.log(onChainNfts);

    setOnChainNFTs(onChainNfts);
  }

  const handleListOnMarketplace = (config) => {
    console.log(config);
    const { collection, nonce, price, qty } = config;

    contract.addToMarket(collection, nonce, qty, price, address);
  };

  const accessDataStream = async(nftid, myAddress) => {
    console.log(_chainMeta);

    /*
      1) get a nonce from the data marshal (s1)
      2) get user to sign the nonce and obtain signature (s2)
      3) send the signature for verification from the marshal and open stream in new window (s3)
    */

    onAccessProgressModalOpen();

    try {
      const chainId = _chainMeta.networkId === 'ED' ? 'D' : 'E1';

      const res = await fetch(`https://itheumapi.com/ddex/datamarshal/v1/services/preaccess?chainId=${chainId}`);
      const data = await res.json();

      if (data && data.nonce) {
        setUnlockAccessProgress(prevProgress => ({ ...prevProgress, s1: 1 }));

        await sleep(3);

        // TODO - get the signature
        
        setUnlockAccessProgress(prevProgress => ({ ...prevProgress, s2: 1 }));

        await sleep(3);

        window.open(`https://itheumapi.com/ddex/datamarshal/v1/services/access?nonce=${data.nonce}=&nftid=${nftid}&signature=signature&txHash=txHash&chainId==${chainId}&accessRequesterAddr=${myAddress}`);

        await sleep(3);

        setUnlockAccessProgress({ s1: 0, s2: 0, s3: 0, s4: 0 });
        setErrUnlockAccessGeneric(null);
        onAccessProgressModalClose();

      } else {
        if (data.success === false) {
          setErrUnlockAccessGeneric(new Error(`${data.error.code}, ${data.error.message}`));
        } else {
          setErrUnlockAccessGeneric(new Error('Data Marshal responded with an unknown error trying to generate your encrypted links'));
        }
      }
    } catch(e) {
      setErrUnlockAccessGeneric(e);
    }
  }

  return (
    <Stack spacing={5}>
      <Heading size="lg">Data NFT Wallet</Heading>
      <Heading size="xs" opacity=".7">Below are the Data NFTs you created and/or purchased on the current chain</Heading>

      {(!usersDataNFTCatalog || usersDataNFTCatalog && usersDataNFTCatalog.length === 0) &&
        <>{!noData && <SkeletonLoadingList /> || <Text onClick={getOnChainNFTs}>No data yet...</Text>}</> ||
        <Flex wrap="wrap" spacing={5}>
          {usersDataNFTCatalog && usersDataNFTCatalog.map((item, index) => <Box key={item.id} maxW="xs" borderWidth="1px" borderRadius="lg" overflow="hidden" mr="1rem" w="250px" mb="1rem" position='relative'>
            <Flex justifyContent="center" pt={5}>
              <Skeleton isLoaded={oneNFTImgLoaded} h={200}>
                <Image src={item.nftImgUrl} alt={item.dataPreview} h={200} w={200} borderRadius="md" onLoad={() => setOneNFTImgLoaded(true)} />
              </Skeleton>
            </Flex>

            <Flex p="3" direction="column" justify="space-between" mt='2'>
              <Text fontWeight="bold" fontSize='lg'>{item.tokenName}</Text>
              <Text fontSize='md'>{item.title}</Text>

              <Flex height='4rem'>
                <Popover trigger='hover' placement='auto'>
                  <PopoverTrigger>
                    <Text fontSize='sm' mt='2' color='gray.300'>{item.description.substring(0, 100)!==item.description?item.description.substring(0, 100) + ' ...':item.description}</Text>
                  </PopoverTrigger>
                  <PopoverContent mx='2' width='220px' mt='-7'>
                    <PopoverHeader fontWeight='semibold'>{item.tokenName}</PopoverHeader>
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverBody>
                      <Text fontSize='sm' mt='2' color='gray.300'>{item.description}</Text>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              </Flex>
              
              <Box as="span" color="gray.600" fontSize="sm" flexGrow="1">
                {`Creator: ${item.creator.slice(0, 8)} ... ${item.creator.slice(-8)}`}
              </Box>

              <Box mt="5">
                <Box display='flex' justifyContent='space-between' alignItems='center'>
                  <Badge borderRadius="full" px="2" colorScheme="teal">
                    <Text>YOU ARE THE {item.creator !== address ? 'OWNER' : 'CREATOR'}</Text>
                  </Badge>
                </Box>

                <Badge borderRadius="full" px="2" colorScheme="blue">
                  Fully Transferable License
                </Badge>
                <Button size='sm' colorScheme='red' height='5' ml={'1'} onClick={onBurnNFTOpen}>Burn</Button>

                <HStack mt="5">
                  <Text fontSize="xs">Creation time: </Text>
                  <Text fontSize="xs">{moment(item.creationTime).format(uxConfig.dateStr)}</Text>
                </HStack>

                <Box as="span" color="gray.600" fontSize="sm" flexGrow="1">
                  {`Balance: ${item.balance} out of ${item.supply}. Royalty: ${item.royalties * 100}%`}
                </Box>

                <HStack mt="2">
                  <Button size='sm' colorScheme='teal' height='7' onClick={() => {
                    // window.open(item.dataStream);
                    accessDataStream(item.id, address);
                  }}>View Data</Button>
                  <Button size='sm' colorScheme='teal' height='7' variant='outline' onClick={() => {
                    window.open(item.dataPreview);
                  }}>Preview Data</Button>
                </HStack>

                <HStack my={'2'}>
                  <Text fontSize="xs">How many to list: </Text>
                  <NumberInput size="xs" maxW={16} step={1} defaultValue={1} min={1} max={item.balance} value={amounts[index]} onChange={(valueString) => setAmounts((oldAmounts)=>{
                  const newAmounts = [...oldAmounts];
                  newAmounts[index] = Number(valueString);
                  return newAmounts;
                })}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                </HStack>

                <HStack my={'2'}>
                  <Text fontSize="xs">Listing price for each: </Text>
                <NumberInput size="xs" maxW={16} step={5} defaultValue={10} min={1} max={999999999999} value={prices[index]} onChange={(valueString) => setPrices((oldPrices)=>{
                  const newPrices = [...oldPrices];
                  newPrices[index] = Number(valueString);
                  return newPrices;
                })}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                </HStack>
                
                <Button size="xs" mt={3} colorScheme="teal" variant="outline" onClick={() => {
                  handleListOnMarketplace({
                    collection: item.collection, 
                    nonce: item.nonce,
                    qty: amounts[index],
                    price: prices[index]
                  });
                }}>
                  List {amounts[index]} NFT{amounts[index]>1&&'s'} for {prices[index]} ITHEUM each
                </Button>
              </Box>              
            </Flex>

            <Box
              position='absolute'
              top='0'
              bottom='0'
              left='0'
              right='0'
              height='100%'
              width='100%'
              backgroundColor='blackAlpha.800'
              visibility={'collapse'}
            >
              <Text
                position='absolute'
                top='50%'
                // left='50%'
                transfrom='translate(-50%, -50%)'
                textAlign='center'
                px='2'
              >
                - FROZEN - <br />
                Data NFT is under investigation by the DAO as there was a complaint received against it
              </Text>
            </Box>
          </Box>)}
          
        </Flex>
      }

      <Modal
        isOpen={isBurnNFTOpen}
        onClose={onBurnNFTClose}
        closeOnEsc={false} closeOnOverlayClick={false}
      >
        <ModalOverlay
          bg='blackAlpha.700'
          backdropFilter='blur(10px) hue-rotate(90deg)'
          />
        <ModalContent>
          {
            burnNFTModalState === 1 ? (<>
              <ModalHeader>Burn My Data NFTs</ModalHeader>
              <ModalBody pb={6}>
                <Flex>
                  <Text fontWeight="bold" fontSize='md' backgroundColor='blackAlpha.300' px='1'>THOR_EcoGP_Race3</Text>
                </Flex>
                <Text color='red.500' fontSize='md' mt='4'>"Burning" Data NFTs means they are destroyed forever. You cannot receover them so preceed with caution.</Text>
                <Text color='orange.300' fontSize='md' mt='4'>You have ownership of 6 Data NFTs (out of a total of 10). You can burn these 6 Data NFTs and remove them from your wallet. The remaining 4 NFTs have already been purchased and they no longer belong to you so you CANNOT burn them</Text>
                <Text fontSize='md' mt='4'>Please note that Data NFTs not listed in the Data NFT marketplace are "NOT public" and are "Private" to only you so on one can see or access them. So only burn Data NFTs if you are sure you want to destroy your Data NFTs for good. Once burned you will not be able to recover them again</Text>

                <HStack mt='4'>
                  <Text fontSize='md'>How many to burn?</Text>
                  <NumberInput size="xs" maxW={16} step={1} defaultValue={1} min={1} max={100}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </HStack>

                <Flex justifyContent='end' mt='6 !important'>
                  <Button colorScheme="teal" size='sm' mx='3' onClick={() => setBurnNFTModalState(2)}>I want to Burn my 6 Data NFTs</Button>
                  <Button colorScheme="teal" size='sm' variant='outline' onClick={onBurnNFTClose}>Cancel</Button>
                </Flex>
              </ModalBody>
            </>) : (<>
              <ModalHeader>Are you sure?</ModalHeader>
              <ModalBody pb={6}>
                <Flex>
                  <Text fontWeight="bold" fontSize='md' backgroundColor='blackAlpha.300' px='1'>THOR_EcoGP_Race3</Text>
                </Flex>
                <Text fontSize='md'>Are you sure you want to preceed with burning the Data NFTs? You cannot undo this action.</Text>
                <Flex justifyContent='end' mt='6 !important'>
                  <Button colorScheme="teal" size='sm' mx='3' onClick={onBurnNFTClose}>Proceed</Button>
                  <Button colorScheme="teal" size='sm' variant='outline' onClick={onBurnNFTClose}>Cancel</Button>
                </Flex>
              </ModalBody>
            </>)
          }
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isAccessProgressModalOpen}
        onClose={onAccessProgressModalClose}
        closeOnEsc={false} closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Data Access Unlock Progress</ModalHeader>
          <ModalBody pb={6}>
            <Stack spacing={5}>
              <HStack>
                {!unlockAccessProgress.s1 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                <Text>Initiating handshake with Data Marshal</Text>
              </HStack>

              <HStack>
                {!unlockAccessProgress.s2 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                <Text>Completing handshake with Data Marshal</Text>
              </HStack>

              <HStack>
                {!unlockAccessProgress.s3 && <Spinner size="md" /> || <CheckCircleIcon w={6} h={6} />}
                <Text>Verifying data access rights and stream data</Text>
              </HStack>

              {errUnlockAccessGeneric &&
                <Alert status="error">
                  <Stack >
                    <AlertTitle fontSize="md">
                      <AlertIcon mb={2} />Process Error</AlertTitle>
                    {errUnlockAccessGeneric.message && <AlertDescription fontSize="md">{errUnlockAccessGeneric.message}</AlertDescription>}
                    <CloseButton position="absolute" right="8px" top="8px" onClick={onRfMount} />
                  </Stack>
                </Alert>
              }
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Stack>
  );
};
