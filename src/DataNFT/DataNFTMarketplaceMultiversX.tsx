import React, { useState, useEffect } from 'react';
import { Box, Stack } from '@chakra-ui/layout';
import {
  Skeleton, HStack, Badge, Button,
  Heading, Image, Flex, Text, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverArrow, PopoverCloseButton, PopoverBody, useDisclosure, ModalOverlay, ModalContent, Modal, ModalHeader, ModalBody, useToast, Checkbox
} from '@chakra-ui/react';
import SkeletonLoadingList from 'UtilComps/SkeletonLoadingList';
import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks/account';
import { useGetPendingTransactions } from '@multiversx/sdk-dapp/hooks/transactions';
import { DataNftMarketContract } from '../MultiversX/dataNftMarket';
import { hexZero, getTokenWantedRepresentation, tokenDecimals } from '../MultiversX/tokenUtils.js';
import { getApi } from 'MultiversX/api';
import { DataNftMintContract } from 'MultiversX/dataNftMint';
import { useChainMeta } from 'store/ChainMetaContext';
import { getNftsByIds } from 'MultiversX/api2';
import { DataNftMetadataType, MarketplaceRequirementsType } from 'MultiversX/types';
import moment from 'moment';
import { sleep, uxConfig } from 'libs/util';
export default function Marketplace() {
  const { chainMeta: _chainMeta } = useChainMeta() as any;
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const toast = useToast();
  const [tabState, setTabState] = useState<number>(1);  // 1 for "Public Marketplace", 2 for "My Data NFTs"
  const [tokensForSale, setTokensForSale] = useState<any[]>([]);
  const [loadingOffers, setLoadingOffers] = useState<boolean>(false);
  const [amountOfTokens, setAmountOfTokens] = useState<any>({});
  const [numberOfPages, setNumberOfPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedNftIndex, setSelectedNftIndex] = useState<number>(-1); // no selection
  const [nftMetadatas, setNftMetadatas] = useState<DataNftMetadataType[]>([]);
  const contract = new DataNftMarketContract('ED');
  const { isOpen: isProcureModalOpen, onOpen: onProcureModalOpen, onClose: onProcureModalClose } = useDisclosure();
  const { isOpen: isReadTermsModalOpen, onOpen: onReadTermsModalOpen, onClose: onReadTermsModalClose } = useDisclosure();
  const { isOpen: isDelistModalOpen, onOpen: onDelistModalOpen, onClose: onDelistModalClose } = useDisclosure();
  const [readTermsChecked, setReadTermsChecked] = useState(false);
  const [oneNFTImgLoaded, setOneNFTImgLoaded] = useState(false);
  const [noData, setNoData] = useState(false);
  const [userData, setUserData] = useState<any>({});
  const [marketRequirements, setMarketRequirements] = useState<MarketplaceRequirementsType | undefined>(undefined);
  const mintContract = new DataNftMintContract(_chainMeta.networkId);
  useEffect(() => {
    (async () => {
      const _marketRequirements = await contract.getRequirements();
      console.log('_marketRequirements', _marketRequirements);
      setMarketRequirements(_marketRequirements);
    })();
  }, []);
  useEffect(() => {
    contract.getNumberOfOffers().then((nr: any) => {
      setNumberOfPages(Math.ceil(nr / 25));
    })
  }, [hasPendingTransactions]);
  useEffect(() => {
    (async () => {
      // init - no selection
      setSelectedNftIndex(-1);
      // start loading offers
      setLoadingOffers(true);
      const _offers: any[] = await contract.getOffers(0, 25, tabState === 1 ? '' : address);
      console.log('_offers', _offers);
      setTokensForSale(_offers);
      // end loading offers
      setLoadingOffers(false);
      let amounts: any = {};
      for (let i = 0; i < _offers.length; i++) {
        amounts[i] = 1;
      }
      setAmountOfTokens(amounts);
      const nftIds = _offers.map(offer => `${offer.have.identifier}-${hexZero(offer.have.nonce)}`);
      const _nfts = await getNftsByIds(nftIds, _chainMeta.networkId);
      const _metadatas: DataNftMetadataType[] = [];
      for (let i = 0; i < _nfts.length; i++) {
        _metadatas.push(mintContract.decodeNftAttributes(_nfts[i], i));
      }
      console.log('_metadatas', _metadatas);
      setNftMetadatas(_metadatas);
    })();
  }, [currentPage, hasPendingTransactions, tabState]);
  const getUserData = async () => {
    if (address && !hasPendingTransactions) {
      const _userData = await mintContract.getUserDataOut(address, _chainMeta.contracts.itheumToken);
      setUserData(_userData);
    }
  };
  useEffect(() => {
    getUserData();
  }, [address, hasPendingTransactions]);
  const onProcure = async () => {
    if (!address) {
      toast({
        title: 'Connect your wallet',
        status: 'error',
        isClosable: true,
      });
      return;
    }
    if (selectedNftIndex < 0 || tokensForSale.length <= selectedNftIndex) {
      toast({
        title: 'No NFT data',
        status: 'error',
        isClosable: true,
      });
      return;
    }
    if (!readTermsChecked) {
      toast({
        title: 'You must agree on Terms of Use',
        status: 'error',
        isClosable: true,
      });
      return;
    }
    const token = tokensForSale[selectedNftIndex];
    if (token['want']['identifier'] === 'EGLD') {
      contract.sendAcceptOfferEgldTransaction(
        token['index'],
        token['want']['amount'],
        amountOfTokens[selectedNftIndex],
        address
      );
    } else {
      if (token['want']['nonce'] === 0) {
        contract.sendAcceptOfferEsdtTransaction(
          token['index'],
          token['want']['amount'],
          token['want']['identifier'],
          amountOfTokens[selectedNftIndex],
          address
        );
      } else {
        contract.sendAcceptOfferNftEsdtTransaction(
          token['index'],
          token['want']['amount'],
          token['want']['identifier'],
          token['want']['nonce'],
          amountOfTokens[selectedNftIndex],
          address
        );
      }
    }
    // a small delay for visual effect
    await sleep(0.5);
    onProcureModalClose();
  };
  const onDelist = async () => {
    if (!address) {
      toast({
        title: 'Connect your wallet',
        status: 'error',
        isClosable: true,
      });
      return;
    }
    if (selectedNftIndex < 0 || tokensForSale.length <= selectedNftIndex) {
      toast({
        title: 'No NFT data',
        status: 'error',
        isClosable: true,
      });
      return;
    }
    const token = tokensForSale[selectedNftIndex];
    contract.delistDataNft(token['index'], address);
    // a small delay for visual effect
    await sleep(0.5);
    onDelistModalClose();
  };
  return (
    <>
      <Stack spacing={5}>
        <Heading size="lg">Data NFT Marketplace</Heading>
        <Flex
          mt="5"
          gap='12px'
          justifyContent={{ base: 'center', md: 'flex-start' }}
          flexDirection={{ base: 'row', md: 'row' }}
        >
          <Button
            colorScheme="teal"
            width={{ base: '160px', md: '160px' }}
            disabled={tabState === 1}
            onClick={() => setTabState(1)}
          >
            Public Marketplace
          </Button>
          <Button
            colorScheme="teal"
            width={{ base: '160px', md: '160px' }}
            disabled={tabState === 2}
            onClick={() => setTabState(2)}
          >
            My Data NFTs
          </Button>
        </Flex>
        {loadingOffers ? <SkeletonLoadingList />
          : tokensForSale.length === 0 ? <Text>No data yet...</Text>
            : <Flex wrap="wrap">
              {tokensForSale && tokensForSale.map((token, index) => (
                <Box key={index} maxW="xs" borderWidth="1px" borderRadius="lg" overflow="wrap" mr="1rem" w="250px" mb="1rem" position="relative">
                  <Flex justifyContent="center" pt={5}>
                    <Skeleton isLoaded={oneNFTImgLoaded} h={200}>
                      <Image
                        src={`https://${getApi('ED')}/nfts/${token['have']['identifier']}-${hexZero(token['have']['nonce'])}/thumbnail`}
                        alt={'item.dataPreview'} h={200} w={200} borderRadius="md" onLoad={() => setOneNFTImgLoaded(true)} />
                    </Skeleton>
                  </Flex>

                  <Box p="3" mt="2" height="336px">
                    {
                      nftMetadatas[index] && (<>
                        <Text fontWeight="bold" fontSize='lg'>{nftMetadatas[index].tokenName}</Text>
                        <Text fontSize='md'>{nftMetadatas[index].title}</Text>
                        <Flex height='4rem'>
                          <Popover trigger='hover' placement='auto'>
                            <PopoverTrigger>
                              <Text fontSize='sm' mt='2' color='gray.300' noOfLines={[1, 2, 3]}>
                                {nftMetadatas[index].description}
                              </Text>
                            </PopoverTrigger>
                            <PopoverContent mx='2' width='220px' mt='-7'>
                              <PopoverHeader fontWeight='semibold'>{nftMetadatas[index].tokenName}</PopoverHeader>
                              <PopoverArrow />
                              <PopoverCloseButton />
                              <PopoverBody>
                                <Text fontSize='sm' mt='2' color='gray.300'>{nftMetadatas[index].description}</Text>
                              </PopoverBody>
                            </PopoverContent>
                          </Popover>
                        </Flex>
                        <Box color="gray.600" fontSize="sm" flexGrow="1">
                          {`Creator: ${nftMetadatas[index].creator.slice(0, 8)} ... ${nftMetadatas[index].creator.slice(-8)}`}
                        </Box>
                        <Box
                          display='flex'
                          flexDirection='column'
                          justifyContent='flex-start'
                          alignItems='flex-start'
                          gap='1'
                          my='1'
                          height='56px'
                        >
                          {
                            address && address == nftMetadatas[index].creator && (
                              <Badge borderRadius="full" px="2" colorScheme="teal">
                                <Text>YOU ARE THE CREATOR</Text>
                              </Badge>
                            )
                          }
                          {
                            address && address == token.owner && (
                              <Badge borderRadius="full" px="2" colorScheme="teal">
                                <Text>YOU ARE THE OWNER</Text>
                              </Badge>
                            )
                          }
                          <Badge borderRadius="full" px="2" colorScheme="blue">
                            Fully Transferable License
                          </Badge>
                        </Box>
                        <Box display='flex' justifyContent='flex-start' mt='2'>
                          <Text fontSize="xs">{`Creation time:   ${moment(nftMetadatas[index].creationTime).format(uxConfig.dateStr)}`}</Text>
                        </Box>
                        <Box color="gray.600" fontSize="sm" flexGrow="1">
                          {`Balance: ${token['quantity']} out of ${nftMetadatas[index].supply}. Royalty: ${nftMetadatas[index].royalties * 100}%`}
                        </Box>
                      </>)
                    }
                    {/* Public Marketplace: Hide Procure part if NFT is owned by User */}
                    {
                      tabState === 1 && address && address != token.owner && (!nftMetadatas[index] || address != nftMetadatas[index].creator) && (<>
                        <Box fontSize="xs" mt='2'>
                          <Text>
                            Fee per NFT:
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
                        <HStack mt='2'>
                          <Text fontSize='xs'>How many to procure access to </Text>
                          <NumberInput size="xs" maxW={16} step={1} defaultValue={1} min={1} max={token['quantity']} value={amountOfTokens[index]} onChange={(valueString) => setAmountOfTokens((oldAmounts: any) => {
                            const newAmounts = { ...oldAmounts };
                            newAmounts[index] = Number(valueString);
                            return newAmounts;
                          })}>
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                          <Button
                            size="xs"
                            colorScheme="teal"
                            width="72px"
                            onClick={() => {
                              setReadTermsChecked(false);
                              setSelectedNftIndex(index);
                              onProcureModalOpen();
                            }}
                          >
                            Procure
                          </Button>
                        </HStack>
                      </>)
                    }
                    {
                      tabState === 2 && address && (<>
                        <Flex mt='2'>
                          <Button
                            size="xs"
                            colorScheme="teal"
                            width="72px"
                            onClick={() => {
                              setSelectedNftIndex(index);
                              onDelistModalOpen();
                            }}
                          >
                            De-List
                          </Button>
                        </Flex>
                      </>)
                    }
                  </Box>
                  <Box
                    position='absolute'
                    top='0'
                    bottom='0'
                    left='0'
                    right='0'
                    height='100%'
                    width='100%'
                    backgroundColor='blackAlpha.800'
                    visibility={userData.addressFrozen || (userData.frozenNonces && userData.frozenNonces.includes(token.have.nonce)) ? 'visible' : 'collapse'}
                  >
                    <Text
                      position='absolute'
                      top='50%'
                      // left='50%'
                      // transform='translate(-50%, -50%)'
                      textAlign='center'
                      fontSize='md'
                      px='2'
                    >
                      - FROZEN - <br />
                      Data NFT is under investigation by the DAO as there was a complaint received against it
                    </Text>
                  </Box>
                </Box>
              ))}
            </Flex>
        }
      </Stack>
      {
        selectedNftIndex >= 0 && nftMetadatas.length > selectedNftIndex && <Modal
          isOpen={isProcureModalOpen}
          onClose={onProcureModalClose}
          closeOnEsc={false} closeOnOverlayClick={false}
        >
          <ModalOverlay
            bg='blackAlpha.700'
            backdropFilter='blur(10px) hue-rotate(90deg)'
          />
          <ModalContent>
            <ModalBody py={6}>
              <HStack spacing="5" alignItems="center">
                <Box flex="4" alignContent="center">
                  <Text fontSize='lg'>Procure Access to Data NFTs</Text>
                  <Flex mt='1'>
                    <Text fontWeight="bold" fontSize='md' backgroundColor='blackAlpha.300' px='1' textAlign="center">{nftMetadatas[selectedNftIndex].tokenName}</Text>
                  </Flex>
                </Box>
                <Box flex="1">
                  <Image src={nftMetadatas[selectedNftIndex].nftImgUrl} h="auto" w="100%" borderRadius="md" m="auto" />
                </Box>
              </HStack>
              <Flex fontSize='md' mt='2'>
                <Box w='100px'>How many</Box>
                <Box>: {amountOfTokens[selectedNftIndex]}</Box>
              </Flex>
              <Flex fontSize='md' mt='2'>
                <Box w='100px'>Fee per NFT</Box>
                <Box>
                  {': ' +
                    tokensForSale[selectedNftIndex]['want']['amount'] /
                    Math.pow(10, tokenDecimals(tokensForSale[selectedNftIndex]['want']['identifier'])) +
                    ' '}
                  {getTokenWantedRepresentation(
                    tokensForSale[selectedNftIndex]['want']['identifier'],
                    tokensForSale[selectedNftIndex]['want']['nonce']
                  )}
                </Box>
              </Flex>
              <Flex fontSize='md' mt='2'>
                <Box w='100px'>Buyer Fee</Box>
                <Box>: 2%</Box>
              </Flex>
              <Flex fontSize='md' mt='2'>
                <Box w='100px'>Total Fee</Box>
                <Box>
                  {': ' +
                    tokensForSale[selectedNftIndex]['want']['amount'] * amountOfTokens[selectedNftIndex] /
                    Math.pow(10, tokenDecimals(tokensForSale[selectedNftIndex]['want']['identifier'])) +
                    ' '}
                  {getTokenWantedRepresentation(
                    tokensForSale[selectedNftIndex]['want']['identifier'],
                    tokensForSale[selectedNftIndex]['want']['nonce']
                  )}
                </Box>
              </Flex>
              <Flex fontSize='xs' mt='0'>
                <Box w='106px'></Box>
                <Box>
                  {' ' +
                    tokensForSale[selectedNftIndex]['want']['amount'] * amountOfTokens[selectedNftIndex] /
                    Math.pow(10, tokenDecimals(tokensForSale[selectedNftIndex]['want']['identifier'])) +
                    ' '}
                  {getTokenWantedRepresentation(
                    tokensForSale[selectedNftIndex]['want']['identifier'],
                    tokensForSale[selectedNftIndex]['want']['nonce']
                  )}
                  {' + '}
                  {'1.2 ITHEUM'}
                </Box>
              </Flex>
              <Flex mt='4 !important'><Button colorScheme="teal" variant='outline' size='sm' onClick={onReadTermsModalOpen}>Read Terms of Use</Button></Flex>
              <Checkbox
                size='sm'
                mt='3 !important'
                isChecked={readTermsChecked}
                onChange={(e: any) => setReadTermsChecked(e.target.checked)}
              >
                I have read all terms and agree to them
              </Checkbox>
              {!readTermsChecked && (
                <Text color='red.400' fontSize='xs' mt='1 !important'>You must agree on Terms of Use</Text>
              )}
              <Flex justifyContent='end' mt='4 !important'>
                <Button colorScheme="teal" size='sm' mx='3' onClick={onProcure} disabled={!readTermsChecked}>Proceed</Button>
                <Button colorScheme="teal" size='sm' variant='outline' onClick={onProcureModalClose}>Cancel</Button>
              </Flex>
            </ModalBody>
          </ModalContent>
        </Modal>
      }
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
      {
        selectedNftIndex >= 0 && selectedNftIndex < tokensForSale.length && (
          <Modal
            isOpen={isDelistModalOpen}
            onClose={onDelistModalClose}
            closeOnEsc={false} closeOnOverlayClick={false}
          >
            <ModalOverlay
              bg='blackAlpha.700'
              backdropFilter='blur(10px) hue-rotate(90deg)'
            />
            <ModalContent>
              <ModalHeader>Are you sure?</ModalHeader>
              <ModalBody pb={6}>
                <Text fontSize='md' mt='2'>You are about to de-list {tokensForSale[selectedNftIndex]['quantity']} Data NFTs from the Public Marketplace.</Text>
                <Flex justifyContent='end' mt='6 !important'>
                  <Button colorScheme="teal" size='sm' mx='3' onClick={onDelist}>Proceed</Button>
                  <Button colorScheme="teal" size='sm' variant='outline' onClick={onDelistModalClose}>Cancel</Button>
                </Flex>
              </ModalBody>
            </ModalContent>
          </Modal>
        )
      }
    </>
  );
};