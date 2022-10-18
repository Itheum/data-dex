import React, { useState, useEffect, useRef } from 'react';
import { Box, Stack } from '@chakra-ui/layout';
import {
  Button, Link, Badge, Flex, Image, StackDivider,  
  HStack, Heading, Center, UnorderedList, ListItem, VStack,
  Spinner, Wrap, WrapItem, Text,
  TableContainer, Table, Tbody, Tr, Td,
  Tag, TagLabel,
  Editable, EditableInput, EditablePreview, Textarea,
  Alert, AlertIcon, AlertTitle, CloseButton,
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
import { sleep, debugui, convertUnixTimestampToLocalDateTime } from 'libs/util';
import SkeletonLoadingList from 'UtilComps/SkeletonLoadingList';
import { IdentityFactory as SDKIdentityFactory } from 'poc-itheum-identity-sdk';

const EMPTY_CLAIM_PAYLOAD = {
  identifier: undefined,
  from: undefined,
  to: undefined,
  data: undefined,
  validFrom: undefined,
  validTo: undefined,
  signature: undefined,
};

export default function() {
  const navigate = useNavigate();
  const { chainMeta: _chainMeta } = useChainMeta();
  const { user: _user } = useUser();
  const { user, isWeb3Enabled, Moralis: { web3Library: ethers } } = useMoralis();
  const { web3: web3Provider } = useMoralis();
  const { error: errCfTestData, isLoading: loadingCfTestData, fetch: doCfTestData, data: dataCfTestData } = useMoralisCloudFunction('loadTestData', {}, { autoFetch: false });
  const walletAddress = user.get('ethAddress');

  // -1 for Loading
  // 0 for View and Delete
  // 1 for Add
  // 2 for Manual Add
  const [manageClaimsState, setManageClaimsState] = useState(2); 

  const [claims, setClaims] = useState([]);
  const [claimPayload, setClaimPayload] = useState('');
  const [claimPayloadJson, setClaimPayloadJson] = useState(EMPTY_CLAIM_PAYLOAD);
  
  let web3Signer = useRef();
  let identity = useRef();
  let identityFactory = useRef();

  const [errorMessage, setErrorMessage] = useState('');
  function closeErrorMessage() {
    setErrorMessage('');
  }

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
    // show Loading
    setManageClaimsState(-1);

    identityFactory.current = await SDKIdentityFactory.init(_chainMeta.contracts.identityFactory);
    console.log('identityFactory.current', identityFactory.current);
    const identities = await identityFactory.current.getIdentitiesByTheGraph();
    const identityAddresses = identities.map(identity => identity.address);

    // Loading finished
    setManageClaimsState(0);

    // if (identityAddresses.length === 0) {
    //   return;
    // }
    // const identityAddress = identityAddresses[0];

    // // query owners of identity contract
    // identity.current = new ethers.Contract(identityAddress, ABIS.identity, web3Signer.current);

    // const claims = [];
    // const claimAddedEvents = await identity.current.queryFilter('ClaimAdded', fromBlockNumber);
    // const claimRemovedEvents = await identity.current.queryFilter('ClaimRemoved', fromBlockNumber);
    // claims.push(...claimAddedEvents.map(ele => ele.args[0]));

    // claimRemovedEvents
    //   .map(ele => ele.args[0])
    //   .forEach(ele => {
    //     const index = claims.findIndex(eleToFind => eleToFind === ele);
    //     if (index >= 0) claims.splice(index, 1);
    //   });

    // setClaims(claims);

    // console.log('claims', claims);
  };

  async function removeClaim(identifier) {
    try {
      console.log('removeClaim: ', identifier);
      const tx = await identity.current.connect(web3Signer.current).removeClaim(identifier);

      const txReceipt = await tx.wait();
      console.log('txReceipt', txReceipt);
      
      // load claims again
      await init();
    } catch (e) {
      setErrorMessage(e.reason);
    }
  }

  function onChangeClaimPayload(payload) {
    payload = payload.toString();
    setClaimPayload(payload);

    try {
      // console.log('payload', payload);
      const t = JSON.parse(payload);
      // console.log('t:', t);
      setClaimPayloadJson(t);
    } catch(e) {
      console.log(e);
      setClaimPayloadJson(EMPTY_CLAIM_PAYLOAD);
    }

  }

  async function addClaim() {
    try {
      // console.log('claimPayloadJson', claimPayloadJson);
      // const addClaimTx = await identity.current.connect(web3Signer.current).addClaim(claimPayloadJson);
      // await addClaimTx.wait();

      await identity.current.addClaim(claimPayloadJson);

      init();
    } catch (e) {
      console.log(e);
      setErrorMessage(e.message);
    }
  }

  useEffect(() => {
    // this will trigger during component load/page load, so let's get the latest claims balances
    // ... we need to listed to _chainMeta event as well as it may get set after moralis responds
    console.log('_chainMeta user isWeb3Enabled', _chainMeta, user, isWeb3Enabled);
    if (_chainMeta?.networkId && user && isWeb3Enabled) {
      // init();
    }
  }, [user, isWeb3Enabled, _chainMeta]);

  return (
    <>
      {errorMessage && 
        <Alert status="error">
          <Box flex="1">
            {/* <AlertIcon /> */}
            <AlertTitle>{errorMessage}</AlertTitle>
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" onClick={closeErrorMessage} />
        </Alert>
      }

      {/* State -1: Loading */}
      {manageClaimsState === -1 && (<>{<SkeletonLoadingList /> || <Text>No data yet...</Text>}</>)}

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
                    <Text fontSize="sm">{convertUnixTimestampToLocalDateTime(val.validFrom)}</Text>
                    <Heading as="h6" size="sm" mt="3">Expires On:</Heading>
                    <Text fontSize="sm">{convertUnixTimestampToLocalDateTime(val.validTo)}</Text>

                    <Flex justify="flex-end">
                      <Button
                        size="sm"
                        colorScheme="teal"
                        variant="solid"
                        onClick={() => removeClaim(val.identifier)}
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
                onClick={() => setManageClaimsState(1)} // go to state 1
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
                      onClick={() => setManageClaimsState(2)} // go to state 2
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
                    defaultValue={claimPayload}
                    onChange={(e) => onChangeClaimPayload(e.target.value)}
                  />
                </Box>
              </WrapItem>
              <WrapItem>
                <Box
                  w="sm"
                  p="3"
                >
                  <Heading as="h6" size="sm" color="teal">[Preview]</Heading>
                  <Heading as="h6" size="md" mt="3">{claimPayloadJson.identifier && claimPayloadJson.identifier.length !== 0 ? claimPayloadJson.identifier : '-'}</Heading>
                  <Text fontSize="xs" mt="1" color="red.600">{!(claimPayloadJson.identifier && claimPayloadJson.identifier.length !== 0) && '(Identifier cannot be empty.)'}</Text>

                  <Heading as="h6" size="sm" mt="3">Issued By:</Heading>
                  <Text fontSize="sm">{claimPayloadJson.from ? `Itheum(${claimPayloadJson.from})` : '-'} </Text>
                  <Text fontSize="xs" mt="1" color="red.600">{!claimPayloadJson.from && '(Issued By cannot be empty.)'}</Text>

                  <Heading as="h6" size="sm" mt="3">Issued On:</Heading>
                  <Text fontSize="sm">{claimPayloadJson.validFrom === undefined ? '-' : convertUnixTimestampToLocalDateTime(claimPayloadJson.validFrom)}</Text>
                  <Text fontSize="xs" mt="1" color="red.600">{claimPayloadJson.validFrom === undefined && '(Issued On cannot be empty.)'}</Text>

                  <Heading as="h6" size="sm" mt="3">Expires On:</Heading>
                  <Text fontSize="sm">{claimPayloadJson.validTo === undefined ? '-' : convertUnixTimestampToLocalDateTime(claimPayloadJson.validTo)}</Text>
                  <Text fontSize="xs" mt="1" color="red.600">{claimPayloadJson.validTo === undefined && '(Expires On cannot be empty.)'}</Text>
                </Box>
              </WrapItem>
            </Wrap>

            <Flex justify="flex-end" mt="12" gap="6">
              <Button
                colorScheme="teal"
                variant="outline"
                size="md"
                w="100px"
                onClick={() => setManageClaimsState(0)} // go to state 0
              >
                Cancel
              </Button>
              <Button
                colorScheme="teal"
                variant="solid"
                size="md"
                w="100px"
                onClick={addClaim}
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
