import React, { useState, useEffect, useRef } from 'react';
import { Box, Stack } from '@chakra-ui/layout';
import {
  Button, Link, Badge, Flex, Image, StackDivider,  
  HStack, Heading, Center, UnorderedList, ListItem, VStack,
  Spinner, Wrap, WrapItem, Text,
  TableContainer, Table, Tbody, Tr, Td,
  Tag, TagLabel,
} from '@chakra-ui/react';
import dataStreamIcon from 'img/data-stream-icon.png';
import { ABIS } from 'EVM/ABIs';
import { useMoralis, useMoralisCloudFunction } from 'react-moralis';
import { useUser } from 'store/UserContext';
import { useChainMeta } from 'store/ChainMetaContext';
import { useNavigate } from 'react-router-dom';
import ChainSupportedComponent from 'UtilComps/ChainSupportedComponent';
import imgNfmeId from 'img/nfme-id.png';
import imgLogo from 'img/logo.png';
import { MENU, sleep } from 'libs/util';
import { IdentityFactory as SDKIdentityFactory } from 'poc-itheum-identity-sdk';
import SkeletonLoadingList from 'UtilComps/SkeletonLoadingList';
import './index.css';

export default function({ onRfMount, setMenuItem, onRefreshTokenBalance }) {
  const navigate = useNavigate();
  const { chainMeta: _chainMeta } = useChainMeta();
  const { user: _user } = useUser();
  const { user, isWeb3Enabled, Moralis: { web3Library: ethers } } = useMoralis();
  const { web3: web3Provider } = useMoralis();
  const { error: errCfTestData, isLoading: loadingCfTestData, fetch: doCfTestData, data: dataCfTestData } = useMoralisCloudFunction('loadTestData', {}, { autoFetch: false });
  const walletAddress = user.get('ethAddress');

  const [identityContainerState, setIdentityContainerState] = useState(-1); // 0 for not deployed, 1 for deploying, 2 for deployed, 3 for show my NFMe IDs
  const [identityAddresses, setIdentityAddresses] = useState([]);
  const [identityOwners, setIdentityOwners] = useState([]);
  const [claims, setClaims] = useState([]);
  
  let web3Signer = useRef();
  let identityFactory = useRef();
  let identity = useRef();
  
  // console.log('identityContainerState', identityContainerState);
  // console.log('identityAddresses', identityAddresses);
  const init = async () => {
    // show Loading
    setIdentityContainerState(-1);

    console.log('_chainMeta.contracts',_chainMeta.contracts);
    console.log('_chainMeta.contracts.identityFactory', _chainMeta.contracts.identityFactory);
    identityFactory.current = await SDKIdentityFactory.init(_chainMeta.contracts.identityFactory);
    console.log('identityFactory.current', identityFactory.current);
    const identities = await identityFactory.current.getIdentitiesByTheGraph();
    // const identities = await identityFactory.current.getIdentities();
    const identityAddresses = identities.map(identity => identity.address);

    console.log('identities', identities);
    setIdentityAddresses(identityAddresses);

    if (identityAddresses.length === 0) {
      return;
    }
    
    identity.current = identities[identities.length - 1];
    console.log('identity.current', identity.current);
    const owners = await identity.current.getOwners();
    console.log('owners', owners);
    setIdentityOwners(owners);

    const confirmations = await identity.current.getOwnerRemovalConfirmations();
    // setConfirmationState(confirmations);

    const claims = await identity.current.getClaims();
    setClaims(claims);

    console.log('claims', claims);
    console.log(typeof(claims[0]))
  };

  useEffect(() => {
    (async () => {
      if (_chainMeta?.networkId && user && isWeb3Enabled) {
        if (identityAddresses.length === 0) {
          setIdentityContainerState(0);
        } else {
          if (identityContainerState === 1) { // if previous state is deploying, go to state 2 - show succesfully deployed
            setIdentityContainerState(2);
            await sleep(3); // sleep 3 seconds and go to state 3
            setIdentityContainerState(3);
          } else { // show NFMe IDs
            setIdentityContainerState(3);
          }
        }
      }
    })();
  }, [identityAddresses]);

  async function deployIdentity() {
    try {
      // const deployIdentityTx = await identityFactory.current.connect(web3Signer.current).deployIdentity();
      
      // to show "Deploying"
      setIdentityContainerState(1);

      const address = await identityFactory.current.deployIdentity();
      console.log('address', address);

      // const txReceipt = await deployIdentityTx.wait();
      // console.log('txReceipt', txReceipt);

      // load deployed identities
      await init();
    } catch (e) {
      alert(e.reason);
    }
  }

  useEffect(() => {
    // this will trigger during component load/page load, so let's get the latest claims balances
    // ... we need to listed to _chainMeta event as well as it may get set after moralis responds
    if (_chainMeta?.networkId && user && isWeb3Enabled) {
      init();
    }
  }, [user, isWeb3Enabled, _chainMeta]);

  return (
    <>
      {/* State -1: Loading */}
      {identityContainerState === -1 && (<>{<SkeletonLoadingList /> || <Text>No data yet...</Text>}</>)}

      {/* State 0: No Identity Contract */}
      {identityContainerState === 0 && (
        <ChainSupportedComponent>
          <Box maxW="sm" borderWidth="1px" p="10" borderRadius="lg" maxWidth="initial">
            <Heading size="lg">Deploy your Identity Containter</Heading>

            <Box fontSize="sm" mt="9" align="left" flex="1">Your first step is to deploy what we can an identity, this is a smart contract that can be used by you to store your web3 “reputation” and to hold your NFMe ID Souldbound token. You have FULL control over this identity container and you can choose to use it to “talk” with blockchain based DApps to expose your reputation or other data your have within the Itheum ecosystem. The DApps can then provide you personalized experiences. Think - gated features or immediate whitelists</Box>

            <Button mt="12" colorScheme="teal" variant="outline" onClick={deployIdentity}>Deploy Identity Containter</Button>
          </Box>
        </ChainSupportedComponent>
      )}

      {/* State 1: Deploying */}
      {identityContainerState === 1 && (
        <ChainSupportedComponent>
          <Box maxW="sm" borderWidth="1px" p="10" borderRadius="lg" maxWidth="initial">
            <Heading size="lg">Deploying Identity Containter...</Heading>

            {/* Rotating Circle with inner text */}
            <div className="wrapper">
              <div className="spinner">
                <span><em></em></span>
              </div>
              <div className="text">Deploying</div>
            </div>

          </Box>
        </ChainSupportedComponent>
      )}

      {/* State 2: Successfully Deployed */}
      {identityContainerState === 2 && (
        <ChainSupportedComponent>
          <Box maxW="sm" borderWidth="1px" p="10" borderRadius="lg" maxWidth="initial">
            <Heading size="lg">Identity Containter Successfuly Deployed!</Heading>
          </Box>
        </ChainSupportedComponent>
      )}

      {/* State 3: Show NFMe IDs and Claims */}
      {identityContainerState === 3 && (<>
        <Wrap spacing="30px" mt="9">
          <WrapItem>
            <Box borderWidth="1px" p="10" borderRadius="lg" w="100%" h="100%">
              <Heading size="lg">My NFMe ID</Heading>
              <HStack mt="12">
                <VStack
                  spacing={5}
                  align='stretch'
                  // maxW="md"
                  h="420"
                  >
                  <Image width="100%" src={imgNfmeId} alt="Itheum Data DEX" />
                </VStack>
                <VStack
                  spacing={5}
                  align='stretch'
                  maxW="md"
                  h="420"
                  pl="6"
                  >
                    <Box h="100%">
                    <Heading as='h5' size='md'>Required Claims</Heading>
                    <Text fontSize='lg'>- NFMe ID Mint Allowed</Text>
                    </Box>
                    {/* <UnorderedList>
                      <ListItem><Text fontSize='lg'>NFMe ID Mint Allowed</Text></ListItem>
                    </UnorderedList> */}
                    <Button mt="12" colorScheme="teal" variant="outline" onClick={() => {}}>Launch Avatar Minter</Button>
                  </VStack>
              </HStack>
            </Box>
          </WrapItem>
          <WrapItem>
            <VStack borderWidth="1px" p="10" borderRadius="lg" w="100%" h="100%">
              <Heading size="lg" h="100%">Greenroom Protocal</Heading>
              <Button mt="12" colorScheme="teal" variant="outline" onClick={() => {}}>Teleport</Button>
            </VStack>
          </WrapItem>
        </Wrap>
        <Wrap spacing="30px" mt="9" align="stretch">
          <WrapItem>
            <Box maxW="xl"  borderWidth="1px" p="10" borderRadius="lg" w="100%" h="100%">
              <Heading size="lg">Web3 Reputation</Heading>
              <Box mt="12">
                <Heading size="md">My Claims</Heading>
                <Text fontSize="md" mt="9">Claims are issued by 3rd parties. They can be independently verified. They are NOT NFTs and can be revoked and can have expiry. The more reputation the 3rd party who has the more valuable a claim. An example of a claim can be a “Diver’s License” issues by the Department of Motor Vehicles or “Gamer Passport Alpha” participant claim issues by the Itheum Protocol</Text>
                <Wrap mt="9">
                  {claims.length === 0 && (
                    <Tag size='lg' colorScheme='red' borderRadius='full'>
                      <TagLabel>You don't have any claims.</TagLabel>
                    </Tag>
                  )}
                  {/* {claims.length > 0 && claims.map((val, index) => (
                    <WrapItem maxW="sm" borderWidth="1px" borderRadius="lg" key={`nfmeid-claim-${index}`}>
                      <Image height="120" src={imgLogo} alt="NFMe" />
                    </WrapItem>
                  ))} */}
                </Wrap>
                <UnorderedList ml='6'>
                  {
                    claims.length && claims.map((claim, index) => (
                      <ListItem key={index}>{claim}</ListItem>
                    ))
                  }
                </UnorderedList>

                <Button mt="9" colorScheme="teal" variant="outline" onClick={() => {setMenuItem(MENU.MANAGECLAIMS); navigate('identity/reputation');}}>Manage Claims</Button>
              </Box>
              <Box mt="12">
                <Heading size="md">My Badges</Heading>
                <Text fontSize="md" mt="9">Badges are more like “achievements” and are NFTs. POAPs, OATs etc are badges that you can send to your identity and build your achievement portfolio</Text>
                <Wrap mt="9">
                  <WrapItem maxW="sm" borderWidth="1px" borderRadius="lg">
                    <Image height="120" src={imgLogo} alt="NFMe" />
                  </WrapItem>
                  <WrapItem maxW="sm" borderWidth="1px" borderRadius="lg">
                    <Image height="120" src={imgLogo} alt="NFMe" />
                  </WrapItem>
                  <WrapItem maxW="sm" borderWidth="1px" borderRadius="lg">
                    <Image height="120" src={imgLogo} alt="NFMe" />
                  </WrapItem>
                </Wrap>
                <Button mt="9" colorScheme="teal" variant="outline" onClick={() => {}}>How to Get</Button>
              </Box>
            </Box>
          </WrapItem>
          <WrapItem>
            <Box maxW="xl" borderWidth="1px" p="10" borderRadius="lg" overflow="auto" w="100%" h="100%">
              <Heading size="lg">Recovery Wallets</Heading>

              <TableContainer td="9">
                <Table variant="unstyled">
                  <Tbody>
                    {[1,2,3,4,5].map((i, index) => (
                      <Tr key={`nfmeid-wallet-${index}`}>
                        <Td>Wallet {`${i}`}:</Td>
                        <Td>{identityOwners.length > i - 1 && identityOwners[i - 1]}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>

              <Button mt="9" colorScheme="teal" variant="outline" onClick={() => {setMenuItem(MENU.RECOVERYWALLETS); navigate('identity/wallets');}}>Manage Wallets</Button>
            </Box>
          </WrapItem>
        </Wrap>
      </>)}
    </>
  );
};
