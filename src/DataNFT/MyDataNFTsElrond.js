import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Box, Stack } from '@chakra-ui/layout';
import {
  Skeleton, Button, HStack, Badge,
  Alert, AlertIcon, AlertTitle, Heading, Image, Flex, Link, Text, Tooltip, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  useDisclosure,
  Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverArrow, PopoverCloseButton, PopoverBody,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import ShortAddress from 'UtilComps/ShortAddress';
import SkeletonLoadingList from 'UtilComps/SkeletonLoadingList';
import { sleep, uxConfig, contractsForChain } from 'libs/util';
import { CHAIN_TOKEN_SYMBOL, OPENSEA_CHAIN_NAMES, CHAIN_NAMES, CHAIN_TX_VIEWER } from 'libs/util';
import { useChainMeta } from 'store/ChainMetaContext';
import { getNftsOfAcollectionForAnAddress } from 'Elrond/api';
import { useGetAccountInfo } from '@elrondnetwork/dapp-core/hooks/account';
import { useGetPendingTransactions } from '@elrondnetwork/dapp-core/hooks/transactions';
import dataNftMintJson from '../Elrond/ABIs/datanftmint.abi.json';
import { AbiRegistry, ArgSerializer, BinaryCodec, EndpointParameterDefinition, SmartContractAbi, StructType, Type } from '@elrondnetwork/erdjs/out';
import { DataNftMarketContract } from 'Elrond/dataNftMarket';


export default function MyDataNFTsElrond() {
  const { chainMeta: _chainMeta, setChainMeta } = useChainMeta();
  const { address } = useGetAccountInfo();
  const [onChainNFTs, setOnChainNFTs] = useState(null);
  const [usersDataNFTCatalog, setUsersDataNFTCatalog] = useState(null);
  const [oneNFTImgLoaded, setOneNFTImgLoaded] = useState(false);
  const [noData, setNoData] = useState(false);
  const [amounts, setAmounts] = useState([]);
  const [prices, setPrices] = useState([]);

  const { isOpen: isBurnNFTOpen, onOpen: onBurnNFTOpen, onClose: onBurnNFTClose } = useDisclosure();

  const [burnNFTModalState, setBurnNFTModalState] = useState(1);  // 1 and 2
  useEffect(() => {
    if (!isBurnNFTOpen) {
      setBurnNFTModalState(1);  // set state 1 when the modal is closed
    }
  }, [isBurnNFTOpen]);

  const contract = new DataNftMarketContract('ED');

  // useEffect(() => {
  //   getOnChainNFTs();
  // }, []);

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
          const abi = new SmartContractAbi(abiRegistry, ['DataNftMintContract']);
          const dataNftAttributes = abiRegistry.getStruct('DataNftAttributes');
          
            // some logic to loop through the raw onChainNFTs and build the usersDataNFTCatalog
            const usersDataNFTCatalogLocal = [];
            let amounts=[];
            let prices=[];
            onChainNFTs.map(nft => {
                  // const decodedAttributes = codec.decodeTopLevel(Buffer.from(nft['attributes'], 'base64'), dataNftAttributes).valueOf();
                  const dataNFT = {};
                  dataNFT.id = nft['identifier']; // ID of NFT -> done
                  dataNFT.nftImgUrl = nft['url']; // image URL of of NFT -> done
                  // dataNFT.dataPreview = decodedAttributes['data_preview_url'].toString(); // preview URL for NFT data stream -> done
                  // dataNFT.dataStream = decodedAttributes['data_stream_url'].toString(); // data stream URL -> done
                  // dataNFT.dataMarshal = decodedAttributes['data_marchal_url'].toString(); // data stream URL -> done
                  // dataNFT.tokenName = nft['name']; // is this different to NFT ID? -> yes, name can be chosen by the user
                  // dataNFT.feeInTokens = '100' // how much in ITHEUM tokens => should not appear here as it's in the wallet, not on the market
                  // dataNFT.creator = decodedAttributes['creator'].toString(); // initial creator of NFT
                  // dataNFT.creationTime = new Date(Number(decodedAttributes['creation_time'])*1000); // initial creation time of NFT
                  dataNFT.supply = nft['supply'];
                  dataNFT.balance = nft['balance'];
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
    const onChainNfts = await getNftsOfAcollectionForAnAddress(address,'DATANFTV1-5425ef','not_E1');

    console.log('onChainNfts');
    console.log(onChainNfts);

    setOnChainNFTs(onChainNfts);
  }

  const handleListOnMarketplace = (config) => {
    console.log(config);
    const { collection, nonce, price, qty } = config;

    contract.addToMarket(collection, nonce, qty, price, address);
  };

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
              <Text fontWeight="bold" fontSize='lg'>THOR_EcoGP_Race3</Text>
              <Text fontSize='md'>Race data from race3 of eco GP</Text>

              <Flex>
                <Popover trigger='hover' placement='auto'>
                  <PopoverTrigger>
                    <Text fontSize='sm' mt='2' color='gray.300'>{'Lorem ipsum dolor sit amet. Est provident quaerat ut rerum omnis vel temporibus nulla sit natus quibusdam. Est repudiandae voluptatibus est doloremque dolore sit quisquam sunt ad praesentium inventore vel veritatis pariatur qui voluptatum soluta vel suscipit iusto.'.substring(0, 100) + ' ...'}</Text>
                  </PopoverTrigger>
                  <PopoverContent>
                    <PopoverHeader fontWeight='semibold'>Lorem Ipsum</PopoverHeader>
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverBody>
                      <Text fontSize='sm' mt='2' color='gray.300'>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</Text>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              </Flex>
              

              {/* <Box as="span" color="gray.600" fontSize="sm" flexGrow="1">
                {`Creator: ${item.creator}`}
              </Box> */}

              

              <Box mt="5">
                {item.creator !== address &&
                  <Box display='flex' justifyContent='space-between' alignItems='center'>
                    <Badge borderRadius="full" px="2" colorScheme="teal">
                    YOU ARE THE OWNER
                    </Badge>
                    <Button size='sm' colorScheme='red' height='5' onClick={onBurnNFTOpen}>Burn</Button>
                  </Box>
                }

                <Badge borderRadius="full" px="2" colorScheme="blue">
                  Fully Transferable License
                </Badge>

                {/* <Badge borderRadius="full" px="2" colorScheme="blue">
                  Data Stream
                </Badge> */}

                <HStack mt="5">
                  <Text fontSize="xs">Creation time: </Text>
                  <Text fontSize="xs">{moment(item.creationTime).format(uxConfig.dateStr)}</Text>
                </HStack>

                <Box as="span" color="gray.600" fontSize="sm" flexGrow="1">
                  {`Balance: ${item.balance} out of ${item.supply}. Royalty: ${item.royalties * 100}%`}
                </Box>

                <HStack mt="2">
                  <Link href={item.dataStream} isExternal textDecoration='none' _hover={{ textDecoration: 'none' }}>
                    <Button size='sm' colorScheme='teal' height='7'>View Data</Button>
                  </Link>
                  <Link href={item.dataStream} isExternal textDecoration='none' _hover={{ textDecoration: 'none' }}>
                    <Button size='sm' colorScheme='teal' height='7' variant='outline'>Preview Data</Button>
                  </Link>
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
              visibility={index % 2 === 0 ? 'collapse' : 'visible'}
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
                <Text color='orange.300' fontSize='md' mt='4'>You have ownershipt of 6 Data NFTs (out of a total of 10). You can burn these 6 Data NFTs and remove them from your wallet. The remaining 4 NFTs have already been purchased and they no longer belong to you so you CANNOT burn them</Text>
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
    </Stack>
  );
};
