import React, { useState, useEffect, useRef } from 'react';
import { Box, Stack } from '@chakra-ui/layout';
import {
  Button, Link, Badge, Flex, Image, StackDivider,  
  HStack, Heading, Center, UnorderedList, ListItem, VStack,
  Spinner, Wrap, WrapItem, Text,
  TableContainer, Table, Tbody, Tr, Td,
  Tag, TagLabel,
  Editable, EditableInput, EditablePreview, Textarea,
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
import { sleep, debugui } from 'libs/util';

export default function() {
  const navigate = useNavigate();
  const { chainMeta: _chainMeta } = useChainMeta();
  const { user: _user } = useUser();
  const { user, isWeb3Enabled, Moralis: { web3Library: ethers } } = useMoralis();
  const { web3: web3Provider } = useMoralis();
  const { error: errCfTestData, isLoading: loadingCfTestData, fetch: doCfTestData, data: dataCfTestData } = useMoralisCloudFunction('loadTestData', {}, { autoFetch: false });
  const walletAddress = user.get('ethAddress');

  // 0 for View and Delete
  // 1 for Add
  // 2 for Manual Add
  const [manageClaimsState, setManageClaimsState] = useState(2); 

  const [claims, setClaims] = useState([]);
  
  let web3Signer = useRef();
  let identity = useRef();

  /////////////////////////////////////////////////////////
  const DUMMY_CLAIMS = [
    {
      identifier: 'nfme_mint_allowed',
      from: '0xa838c28201aBb6613022eC02B97fcF6828B0862B',
      to: '0x47C73B9eb64Ca3d7381Fb714f527F2eD16F2f02E',
      data: ethers.utils.formatBytes32String(''),
      validFrom: 1664670523,
      validTo: 0,
    },
    {
      identifier: 'gamer_passport_alpha',
      from: '0xa838c28201aBb6613022eC02B97fcF6828B0862B',
      to: '0x47C73B9eb64Ca3d7381Fb714f527F2eD16F2f02E',
      data: ethers.utils.formatBytes32String(''),
      validFrom: 1664670523,
      validTo: 1664680523,
    },
    {
      identifier: 'nfme_mint_allowed',
      from: '0xa838c28201aBb6613022eC02B97fcF6828B0862B',
      to: '0x47C73B9eb64Ca3d7381Fb714f527F2eD16F2f02E',
      data: ethers.utils.formatBytes32String(''),
      validFrom: 1664670523,
      validTo: 0,
    },
    {
      identifier: 'gamer_passport_alpha',
      from: '0xa838c28201aBb6613022eC02B97fcF6828B0862B',
      to: '0x47C73B9eb64Ca3d7381Fb714f527F2eD16F2f02E',
      data: ethers.utils.formatBytes32String(''),
      validFrom: 1664670523,
      validTo: 1664680523,
    },
    {
      identifier: 'nfme_mint_allowed',
      from: '0xa838c28201aBb6613022eC02B97fcF6828B0862B',
      to: '0x47C73B9eb64Ca3d7381Fb714f527F2eD16F2f02E',
      data: ethers.utils.formatBytes32String(''),
      validFrom: 1664670523,
      validTo: 0,
    },
    {
      identifier: 'gamer_passport_alpha',
      from: '0xa838c28201aBb6613022eC02B97fcF6828B0862B',
      to: '0x47C73B9eb64Ca3d7381Fb714f527F2eD16F2f02E',
      data: ethers.utils.formatBytes32String(''),
      validFrom: 1664670523,
      validTo: 1664680523,
    },
  ];
  /////////////////////////////////////////////////////////

  console.log('manageClaimsState', manageClaimsState);
  const init = async () => {
    console.log('init');
    web3Signer.current = web3Provider.getSigner();
    const identityFactory = new ethers.Contract(_chainMeta.contracts.identityFactory, ABIS.ifactory, web3Signer.current);

    // query-start block number
    // We can only query last 1000 blocks due to the limit of Mumbai Testnet
    const fromBlockNumber = (await web3Provider.getBlockNumber()) - 1000;
    console.log('fromBlockNumber', fromBlockNumber);

    let events = await identityFactory.queryFilter('IdentityDeployed', fromBlockNumber);
    console.log('events', events);
    const identityDeployedEvents = events.filter(event => event.args[1].toLowerCase() === walletAddress.toLowerCase());
    let identityAddresses = identityDeployedEvents.length > 0 ? identityDeployedEvents.map(event => event.args[0]) : [];

    if (identityAddresses.length === 0) {
      events = await identityFactory.queryFilter('AdditionalOwnerAction', fromBlockNumber);

      const eventsForWalletAddress = events.filter(event => event.args[2].toLowerCase() === walletAddress.toLowerCase());
      const addingEvents = eventsForWalletAddress.filter(event => event.args[3] === 'added');
      const removingEvents = eventsForWalletAddress.filter(event => event.args[3] === 'removed');

      identityAddresses = addingEvents.map(event => event.args[0]);

      removingEvents.map(event => event.args[0]).forEach(ele => {
        const index = identityAddresses.findIndex(eleToFind => eleToFind === ele);
        if (index >= 0) identityAddresses.splice(index, 1);
      });
    }

    if (identityAddresses.length === 0) {
      return;
    }
    const identityAddress = identityAddresses[0];

    // query owners of identity contract
    identity.current = new ethers.Contract(identityAddress, ABIS.identity, web3Signer.current);

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

    console.log('claims', claims);
  };

  // useEffect(() => {
  //   (async () => {
  //     console.log('identityAddresses, identityContainerState', identityAddresses, identityContainerState);
  //     if (identityAddresses.length === 0) {
  //       setIdentityContainerState(0);
  //     } else {
  //       if (identityContainerState === 1) { // if previous state is deploying, go to state 2 - show succesfully deployed
  //         setIdentityContainerState(2);
  //         console.log('sleep start');
  //         await sleep(3); // sleep 3 seconds and go to state 3
  //         console.log('sleep end');
  //         setIdentityContainerState(3);
  //       } else { // show NFMe IDs
  //         setIdentityContainerState(3);
  //       }
  //     }
  //   })();
  // }, [identityAddresses]);

  // const deployIdentity = async () => {
  //   try {
  //     const deployIdentityTx = await identityFactory.current.connect(web3Signer.current).deployIdentity();

  //     // to show "Deploying"
  //     setIdentityContainerState(1);

  //     const txReceipt = await deployIdentityTx.wait();
  //     console.log('txReceipt', txReceipt);
  //     // load deployed identities
  //     await init();
  //   } catch (e) {
  //     alert(e.reason);
  //   }
  // };

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
      {/* State 0: View and Delete */}
      {manageClaimsState === 0 && (
        <ChainSupportedComponent>
          <Box
            borderWidth="1px"
            borderRadius="lg"
            p="9"
          >
            <Heading size="lg">Manage Claims: View and Delete</Heading>

            <Wrap spacing="30px" mt="9">
              {DUMMY_CLAIMS.map((val, index) => (
                <WrapItem key={`manageclaims-claim-${index}`}>
                  <Box
                    w="sm"
                    p="3"
                    borderBottomWidth="2px"
                    borderRadius="lg"
                  >
                    <Heading as="h6" size="md">{val.identifier}</Heading>
                    <Heading as="h6" size="sm" mt="3">Issued By:</Heading>
                    <Text fontSize="sm">Itheum({val.to})</Text>
                    <Heading as="h6" size="sm" mt="3">Issued On:</Heading>
                    <Text fontSize="sm">{val.validFrom}</Text>
                    <Heading as="h6" size="sm" mt="3">Expires On:</Heading>
                    <Text fontSize="sm">{val.validTo}</Text>

                    <Flex justify="flex-end">
                      <Button
                        size="sm"
                        colorScheme="teal"
                        variant="solid"
                        onClick={() => {}}
                      >
                        Delete
                      </Button>
                    </Flex>
                  </Box>
                </WrapItem>
              ))}
            </Wrap>

            <Flex justify="flex-end" mt="12">
              <Button
                colorScheme="teal"
                variant="solid"
                size="md"
                onClick={() => {}}
              >
                Add New Claims
              </Button>
            </Flex>
          </Box>
        </ChainSupportedComponent>
      )}

      {/* State 1: Add */}
      {manageClaimsState === 1 && (
        <ChainSupportedComponent>
          <Box
            borderWidth="1px"
            borderRadius="lg"
            p="9"
          >
            <Heading size="lg">Manage Claims: Add</Heading>

            <Wrap spacing="30px" mt="9">
              <WrapItem>
                <Box
                  w="sm"
                  p="3"
                  borderBottomWidth="2px"
                  borderRadius="lg"
                >
                  <Heading as="h6" size="md">Manual Add</Heading>
                  <Text fontSize="sm">Have you received a claim offline? Use this option to verify and add the claim payload to your identity</Text>

                  <Flex justify="flex-end" mt="6">
                    <Button
                      size="sm"
                      colorScheme="teal"
                      variant="solid"
                      onClick={() => {}}
                    >
                      Manually Add Claim Payload
                    </Button>
                  </Flex>
                </Box>
              </WrapItem>

              {DUMMY_CLAIMS.map((val, index) => (
                <WrapItem key={`manageclaims-state-1-${index}`}>
                  <Box
                    w="sm"
                    p="3"
                    borderBottomWidth="2px"
                    borderRadius="lg"
                  >
                    <Heading as="h6" size="md">{val.identifier}</Heading>
                    <Heading as="h6" size="sm" mt="3">Issued By:</Heading>
                    <Text fontSize="sm">Itheum({val.to})</Text>

                    <Flex justify="flex-end" mt="6">
                      <Button
                        size="sm"
                        colorScheme="teal"
                        variant="outline"
                        onClick={() => {}}
                      >
                        How to Get
                      </Button>
                    </Flex>
                  </Box>
                </WrapItem>
              ))}
            </Wrap>
          </Box>
        </ChainSupportedComponent>
      )}

      {/* State 2: Manual Add */}
      {manageClaimsState === 2 && (
        <ChainSupportedComponent>
          <Box
            borderWidth="1px"
            borderRadius="lg"
            p="9"
          >
            <Heading size="lg">Manage Claims: Manual Add</Heading>

            <Wrap spacing="30px" mt="9">
              <WrapItem>
                <Box
                  w="md"
                  p="3"
                  h="100%"
                >
                  <Textarea 
                    placeholder="Claim payload goes here..."
                    h="100%"
                  />
                </Box>
              </WrapItem>
              <WrapItem>
                <Box
                  w="sm"
                  p="3"
                >
                  <Heading as="h6" size="sm" color="teal">[Preview]</Heading>
                  <Heading as="h6" size="md" mt="3">NFMe ID Mint Allowed</Heading>
                  <Heading as="h6" size="sm" mt="3">Issued By:</Heading>
                  <Text fontSize="sm">Itheum(0x47C73B9eb64Ca3d7381Fb714f527F2eD16F2f02E)</Text>
                  <Heading as="h6" size="sm" mt="3">Issued On:</Heading>
                  <Text fontSize="sm">02/01/2022</Text>
                  <Heading as="h6" size="sm" mt="3">Expires On:</Heading>
                  <Text fontSize="sm">03/10/2024</Text>
                </Box>
              </WrapItem>
            </Wrap>

            <Flex justify="flex-end" mt="12" gap="6">
              <Button
                colorScheme="teal"
                variant="outline"
                size="md"
                w="100px"
                onClick={() => {}}
              >
                Cancel
              </Button>
              <Button
                colorScheme="teal"
                variant="solid"
                size="md"
                w="100px"
                onClick={() => {}}
              >
                Add
              </Button>
            </Flex>
          </Box>
        </ChainSupportedComponent>
      )}
    </>
  );
};
