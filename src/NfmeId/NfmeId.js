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
import { sleep } from 'libs/util';

export default function({ onRfMount, setMenuItem, onRefreshTokenBalance }) {
  const navigate = useNavigate();
  const { chainMeta: _chainMeta } = useChainMeta();
  const { user: _user } = useUser();
  const { user, isWeb3Enabled, Moralis: { web3Library: ethers } } = useMoralis();
  const { web3: web3Provider } = useMoralis();
  const { error: errCfTestData, isLoading: loadingCfTestData, fetch: doCfTestData, data: dataCfTestData } = useMoralisCloudFunction('loadTestData', {}, { autoFetch: false });
  const walletAddress = user.get('ethAddress');

  const [identityContainerState, setIdentityContainerState] = useState(0); // 0 for not deployed, 1 for deploying, 2 for deployed, 3 for show my NFMe IDs
  const [identityAddresses, setIdentityAddresses] = useState([]);
  const [identityOwners, setIdentityOwners] = useState([]);
  const [claims, setClaims] = useState([]);
  
  let web3Signer = useRef();
  let identityFactory = useRef();
  let identity = useRef();
  
  console.log('identityContainerState', identityContainerState);
  console.log('identityAddresses', identityAddresses);
  const init = async () => {
    console.log('init');
    web3Signer.current = web3Provider.getSigner();
    identityFactory.current = new ethers.Contract(_chainMeta.contracts.identityFactory, ABIS.ifactory, web3Signer.current);

    // query-start block number
    // We can only query last 1000 blocks due to the limit of Mumbai Testnet
    const fromBlockNumber = (await web3Provider.getBlockNumber()) - 2000;
    console.log('fromBlockNumber', fromBlockNumber);

    let events = await identityFactory.current.queryFilter('IdentityDeployed', fromBlockNumber);
    console.log('events', events);
    const identityDeployedEvents = events.filter(event => event.args[1].toLowerCase() === walletAddress.toLowerCase());
    let identityAddresses = identityDeployedEvents.length > 0 ? identityDeployedEvents.map(event => event.args[0]) : [];

    if (identityAddresses.length === 0) {
      events = await identityFactory.current.queryFilter('AdditionalOwnerAction', fromBlockNumber);

      const eventsForWalletAddress = events.filter(event => event.args[2].toLowerCase() === walletAddress.toLowerCase());
      const addingEvents = eventsForWalletAddress.filter(event => event.args[3] === 'added');
      const removingEvents = eventsForWalletAddress.filter(event => event.args[3] === 'removed');

      identityAddresses = addingEvents.map(event => event.args[0]);

      removingEvents.map(event => event.args[0]).forEach(ele => {
        const index = identityAddresses.findIndex(eleToFind => eleToFind === ele);
        if (index >= 0) identityAddresses.splice(index, 1);
      });
    }

    setIdentityAddresses(identityAddresses);

    if (identityAddresses.length === 0) {
      return;
    }
    const identityAddress = identityAddresses[0];

    // query owners of identity contract
    identity.current = new ethers.Contract(identityAddress, ABIS.identity, web3Signer.current);

    const owners = [await identity.current.owner()];
    const additionalOwnerAddedEvents = await identity.current.queryFilter('AdditionalOwnerAdded', fromBlockNumber);
    const additionalOwnerRemovedEvents = await identity.current.queryFilter('AdditionalOwnerRemoved', fromBlockNumber);
    owners.push(...additionalOwnerAddedEvents.map(ele => ele.args[1]));

    additionalOwnerRemovedEvents
      .map(ele => ele.args[1])
      .forEach(ele => {
        const index = owners.findIndex(eleToFind => eleToFind === ele);
        if (index >= 0) owners.splice(index, 1);
    });
    setIdentityOwners(owners);

    // const confirmations = [];

    // for (const owner of owners) {
    //   const count = await identity.current.removeAdditionalOwnerConfirmationCount(owner);
    //   confirmations.push(count);
    // }

    // setConfirmationState(confirmations);

    const claims = [];
    const claimAddedEvents = await identity.current.queryFilter('ClaimAdded', fromBlockNumber);
    const claimRemovedEvents = await identity.current.queryFilter('ClaimRemoved', fromBlockNumber);
    claims.push(...claimAddedEvents.map(ele => ele.args[0]));

    claimRemovedEvents
      .map(ele => ele.args[0])
      .forEach(ele => {
        const index = claims.findIndex(eleToFind => eleToFind === ele);
        if (index >= 0) claims.splice(index, 1);
      });

    setClaims(claims);

    console.log('owners', owners);
    console.log('claims', claims);
  };

  useEffect(() => {
    (async () => {
      console.log('identityAddresses, identityContainerState', identityAddresses, identityContainerState);
      if (identityAddresses.length === 0) {
        setIdentityContainerState(0);
      } else {
        if (identityContainerState === 1) { // if previous state is deploying, go to state 2 - show succesfully deployed
          setIdentityContainerState(2);
          console.log('sleep start');
          await sleep(3); // sleep 3 seconds and go to state 3
          console.log('sleep end');
          setIdentityContainerState(3);
        } else { // show NFMe IDs
          setIdentityContainerState(3);
        }
      }
    })();
  }, [identityAddresses]);

  async function deployIdentity() {
    try {
      const deployIdentityTx = await identityFactory.current.connect(web3Signer.current).deployIdentity();

      // to show "Deploying"
      setIdentityContainerState(1);

      const txReceipt = await deployIdentityTx.wait();
      console.log('txReceipt', txReceipt);
      // load deployed identities
      await init();
    } catch (e) {
      alert(e.reason);
    }
  }

  useEffect(() => {
    // this will trigger during component load/page load, so let's get the latest claims balances
    // ... we need to listed to _chainMeta event as well as it may get set after moralis responds
    console.log('_chainMeta user isWeb3Enabled', _chainMeta, user, isWeb3Enabled);
    if (_chainMeta?.networkId && user && isWeb3Enabled) {
      init();
    }
  }, [user, isWeb3Enabled, _chainMeta]);

  return (
    <>
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

            <Box fontSize="sm" mt="9" align="left" flex="1">Deploying</Box>
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
      {identityContainerState === 3 && (<Stack>
          <HStack>
            <Box maxW="md" borderWidth="1px" p="10" borderRadius="lg" maxWidth="initial">
              <Heading size="lg">My NFMe ID</Heading>
              <HStack mt="12">
                <VStack
                  spacing={5}
                  align='stretch'
                  maxW="md"
                  h="420"
                  >
                  <Image height="100%" src={imgNfmeId} alt="Itheum Data DEX" />
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

            <Box maxW="md" borderWidth="1px" p="10" borderRadius="lg" maxWidth="initial">
              <Heading size="lg">Greenroom Protocal</Heading>
              <Button mt="12" colorScheme="teal" variant="outline" onClick={() => {}}>Teleport</Button>
            </Box>
          </HStack>

          <Box maxW="sm" borderWidth="1px" p="10" borderRadius="lg" maxWidth="initial">
            <Heading size="lg">Web3 Reputation</Heading>
            <Box maxW="sm" maxWidth="initial" mt="12">
              <Heading size="md">My Claims</Heading>
              <Text fontSize="md" mt="9">Claims are issued by 3rd parties. They can be independently verified. They are NOT NFTs and can be revoked and can have expiry. The more reputation the 3rd party who has the more valuable a claim. An example of a claim can be a “Diver’s License” issues by the Department of Motor Vehicles or “Gamer Passport Alpha” participant claim issues by the Itheum Protocol</Text>
              <Wrap mt="9">
                {claims.length === 0 && (
                  <Tag size='lg' colorScheme='red' borderRadius='full'>
                    <TagLabel>You don't have any claims.</TagLabel>
                  </Tag>
                )}
                {claims.length > 0 && claims.map((val, index) => (
                  <WrapItem maxW="sm" borderWidth="1px" borderRadius="lg" key={`nfmeid-claim-${index}`}>
                    <Image height="120" src={imgLogo} alt="NFMe" />
                  </WrapItem>
                ))}
              </Wrap>
              <Button mt="9" colorScheme="teal" variant="outline" onClick={() => navigate('manageclaims')}>Manage Claims</Button>
            </Box>
            <Box maxW="sm" maxWidth="initial"  mt="12">
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
          <Box maxW="sm" borderWidth="1px" p="10" borderRadius="lg" maxWidth="initial">
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

            <Button mt="9" colorScheme="teal" variant="outline" onClick={() => {}}>Manage Wallets</Button>
          </Box>
      </Stack>)}
    </>
  );
};
