import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Box, Stack } from '@chakra-ui/layout';
import {
  Skeleton, Button, HStack, Badge,
  Alert, AlertIcon, AlertTitle, Heading, Image, Flex, Link, Text, Tooltip, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import ShortAddress from 'UtilComps/ShortAddress';
import SkeletonLoadingList from 'UtilComps/SkeletonLoadingList';
import { sleep, uxConfig, contractsForChain } from 'libs/util';
import { CHAIN_TOKEN_SYMBOL, OPENSEA_CHAIN_NAMES, CHAIN_NAMES, CHAIN_TX_VIEWER } from 'libs/util';
import { useChainMeta } from 'store/ChainMetaContext';
import { getNftsOfAcollectionForAnAddress } from 'Elrond/api';
import { useGetAccountInfo, useGetPendingTransactions } from '@elrondnetwork/dapp-core';
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
                  const decodedAttributes = codec.decodeTopLevel(Buffer.from(nft['attributes'], 'base64'), dataNftAttributes).valueOf();
                  const dataNFT = {};
                  dataNFT.id = nft['identifier']; // ID of NFT -> done
                  dataNFT.nftImgUrl = nft['url']; // image URL of of NFT -> done
                  dataNFT.dataPreview = decodedAttributes['data_preview_url'].toString(); // preview URL for NFT data stream -> done
                  dataNFT.dataStream = decodedAttributes['data_stream_url'].toString(); // data stream URL -> done
                  dataNFT.dataMarshal = decodedAttributes['data_marchal_url'].toString(); // data stream URL -> done
                  dataNFT.tokenName = nft['name']; // is this different to NFT ID? -> yes, name can be chosen by the user
                  dataNFT.feeInTokens = '100' // how much in ITHEUM tokens => should not appear here as it's in the wallet, not on the market
                  dataNFT.creator = decodedAttributes['creator'].toString(); // initial creator of NFT
                  dataNFT.creationTime = new Date(Number(decodedAttributes['creation_time'])*1000); // initial creation time of NFT
                  dataNFT.supply = nft['supply'];
                  dataNFT.balance = nft['balance'];
                  dataNFT.royalties = nft['royalties'];
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
          {usersDataNFTCatalog && usersDataNFTCatalog.map((item, index) => <Box key={item.id} maxW="xs" borderWidth="1px" borderRadius="lg" overflow="hidden" mr="1rem" w="250px" mb="1rem">
            <Flex justifyContent="center" pt={5}>
              <Skeleton isLoaded={oneNFTImgLoaded} h={200}>
                <Image src={item.nftImgUrl} alt={item.dataPreview} h={200} w={200} borderRadius="md" onLoad={() => setOneNFTImgLoaded(true)} />
              </Skeleton>
            </Flex>

            <Flex p="3" direction="column" justify="space-between" height="300px">
              <Box
                fontSize="sm"
                mt="1"
                fontWeight="semibold"
                as="h4"
                lineHeight="tight">
                {item.tokenName}
              </Box>

              {/* <Box as="span" color="gray.600" fontSize="sm" flexGrow="1">
                {`Creator: ${item.creator}`}
              </Box> */}

              

              <Box mt="5">
                {item.creator===address && <Badge borderRadius="full" px="2" colorScheme="teal">
                  {item.creator===address && 'you are the owner' || 'you are the creator & owner' }
                </Badge> || <Badge borderRadius="full" px="2" colorScheme="red" display="none">
                  sold
                </Badge>}

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

                <HStack mt=".5">
                  <Text fontSize="xs">View Data Stream</Text>
                  <Link href={item.dataStream} isExternal><ExternalLinkIcon mx="2px" /></Link>
                </HStack>

                <Box as="span" color="gray.600" fontSize="sm" flexGrow="1">
                  {`Balance: ${item.balance} out of ${item.supply}. Royalty: ${item.royalties * 100}%`}
                </Box>
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
          </Box>)}
          
        </Flex>
      }
    </Stack>
  );
};
