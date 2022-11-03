import React, { useState, useEffect } from 'react';
import { Box, Stack } from '@chakra-ui/layout';
import {
  Skeleton, CloseButton, HStack, Badge, ButtonGroup, Button,
  Alert, AlertIcon, AlertTitle, Heading, Image, Flex, Link, Text, Tooltip, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper
} from '@chakra-ui/react';
import SkeletonLoadingList from 'UtilComps/SkeletonLoadingList';
import { useGetAccountInfo, useGetPendingTransactions } from '@elrondnetwork/dapp-core';
import { DataNftMarketContract } from '../Elrond/dataNftMarket';
import { roundDown, hexZero, getTokenWantedRepresentation, getTokenImgSrc, tokenDecimals } from '../Elrond/tokenUtils.js';
import { getApi } from 'Elrond/api';

export default function Marketplace() {
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const isLoggedIn = Boolean(address);
  const [tokensForSale, setTokensForSale] = useState<any[]>([]);
  const [amountOfTokens, setAmountOfTokens] = useState<any>({});
  const [numberOfPages, setNumberOfPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const contract = new DataNftMarketContract('ED');

  useEffect(() => {
    contract.getNumberOfOffers().then((nr: any) => {
      setNumberOfPages(Math.ceil(nr / 25));
    })
  }, [hasPendingTransactions]);

  useEffect(() => {
    contract.getOffers(0, 25).then((offers: any) => {
      setTokensForSale(offers);

      let amounts: any = {};
        offers.forEach((offer:any)=>amounts[offer.index] = 1);
        setAmountOfTokens(amounts);
    })
  }, [currentPage, hasPendingTransactions]);

  const [oneNFTImgLoaded, setOneNFTImgLoaded] = useState(false);
  const [noData, setNoData] = useState(false);


  return (
    <Stack spacing={5}>
      <Heading size="lg">Data NFT Marketplace</Heading>
      <Heading size="xs" opacity=".7">Browse, View and Buy Cross-Chain Data NFTs</Heading>

      {(!tokensForSale || tokensForSale && tokensForSale.length === 0) &&
        <>{!noData && <SkeletonLoadingList /> || <Text>No data yet...</Text>}</> ||
        <Flex wrap="wrap">

          {tokensForSale && tokensForSale.map((token) => <Box key={token.index} maxW="xs" borderWidth="1px" borderRadius="lg" overflow="wrap" mr="1rem" w="250px" mb="1rem">
            <Flex justifyContent="center" pt={5}>
              <Skeleton isLoaded={oneNFTImgLoaded} h={200}>
                <Image
                  src={`https://${getApi('ED')}/nfts/${token['have']['identifier']}-${hexZero(token['have']['nonce'])}/thumbnail`}
                  alt={'item.dataPreview'} h={200} w={200} borderRadius="md" onLoad={() => setOneNFTImgLoaded(true)} />
              </Skeleton>
            </Flex>

            <Flex p="3" direction="column" justify="space-between" height="150px">
              <Box>
                <Box as="span" fontSize="sm">
                  {(
                    token['have']['amount'] /
                    Math.pow(10, tokenDecimals(token['have']['identifier']))
                  ).toLocaleString() + ' '}{' '}
                  x{' '}
                  {getTokenWantedRepresentation(
                    token['have']['identifier'],
                    token['have']['nonce']
                  )}
                </Box>

                <Box as="span" fontSize="sm">
                  <Text>Supply: {token['quantity']}</Text>
                </Box>

                <Box as="span" fontSize="sm">
                  <Text>
                    Price:
                    {' ' +
                      token['want']['amount'] /
                      Math.pow(10, tokenDecimals(token['want']['identifier'])) +
                      ' '}
                    {getTokenWantedRepresentation(
                      token['want']['identifier'],
                      token['want']['nonce']
                    )}
                  </Text>
                </Box>
              </Box>
              <HStack>       
                <Text fontSize='sm'>Amount to buy: </Text>
                <NumberInput size="xs" maxW={16} step={1} defaultValue={1} min={1} max={token['quantity']} value={amountOfTokens[token.index]} onChange={(valueString) => setAmountOfTokens((oldAmounts: any)=>{
                  const newAmounts = { ...oldAmounts };
                  newAmounts[token.index] = Number(valueString);
                  return newAmounts;
                })}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                </HStack>

              <Button size="xs" mt={3} colorScheme="teal" variant="outline" onClick={() => {
                if (token['want']['identifier'] === 'EGLD') {
                  contract.sendAcceptOfferEgldTransaction(
                    token['index'],
                    token['want']['amount'],
                    amountOfTokens[token['index']]
                  );
                } else {
                  if (token['want']['nonce'] === 0) {
                    contract.sendAcceptOfferEsdtTransaction(
                      token['index'],
                      token['want']['amount'],
                      token['want']['identifier'],
                      amountOfTokens[token['index']]
                    );
                  } else {
                    contract.sendAcceptOfferNftEsdtTransaction(
                      token['index'],
                      token['want']['amount'],
                      token['want']['identifier'],
                      token['want']['nonce'],
                      amountOfTokens[token['index']],
                      address
                    );
                  }
                }
              }}>
                Buy {amountOfTokens[token['index']]} NFT{amountOfTokens[token['index']]>1&&'s'} for {(token['want']['amount'] *
                  amountOfTokens[token['index']]) /
                  Math.pow(
                    10,
                    tokenDecimals(token['want']['identifier'])
                  ) +
                  ' '}
              </Button>
            </Flex>
          </Box>)}


        </Flex>
      }
    </Stack>
  );
};
