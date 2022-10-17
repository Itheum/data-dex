import React, { useState, useEffect, useRef } from 'react';
import { Box, Stack } from '@chakra-ui/layout';
import {
  Button, Link, Badge, Flex, Image, StackDivider,  
  HStack, Heading, Center, UnorderedList, ListItem, VStack,
  Spinner, Wrap, WrapItem, Text,
  TableContainer, Table, Tbody, Tr, Td,
  Tag, TagLabel,
  Editable, EditableInput, EditablePreview, Textarea,
  Radio, RadioGroup, AlertDescription,
  Input,
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
import SkeletonLoadingList from 'UtilComps/SkeletonLoadingList';
import { IdentityFactory as SDKIdentityFactory } from 'poc-itheum-identity-sdk';

export default function() {
  const navigate = useNavigate();
  const { chainMeta: _chainMeta } = useChainMeta();
  const { user: _user } = useUser();
  const { user, isWeb3Enabled, Moralis: { web3Library: ethers } } = useMoralis();
  const { web3: web3Provider } = useMoralis();
  const { error: errCfTestData, isLoading: loadingCfTestData, fetch: doCfTestData, data: dataCfTestData } = useMoralisCloudFunction('loadTestData', {}, { autoFetch: false });
  const walletAddress = user.get('ethAddress');

  // -1 for Loading
  // 0
  // 1 for Attach
  // 2 for Remove
  // 3 for Attach Success
  // 4 for Remove Success
  const [recoverWalletsState, setRecoverWalletsState] = useState(-1); 

  const [claims, setClaims] = useState([]);
  
  let web3Signer = useRef();
  let identity = useRef();

  const [selectedWallet, setSelectedWallet] = useState('');

  /////////////////////////////////////////////////////////
  const DUMMY_ADDRESSES = [
    '0xa838c28201aBb6613022eC02B97fcF6828B0862B',
    '0x47C73B9eb64Ca3d7381Fb714f527F2eD16F2f02E',
    '0xDf86B1dFAd02A2E9EB7B2d130A4eF8776C52E403',
    '0xF5db804101d8600c26598A1Ba465166c33CdAA4b',
    '0x393a0Ef293ae6D8C11F49744B081ddD343dEbBD0',
  ];
  /////////////////////////////////////////////////////////

  console.log('recoverWalletsState', recoverWalletsState);
  const init = async () => {
    // show Loading
    setRecoverWalletsState(-1);

    identityFactory.current = await SDKIdentityFactory.init(_chainMeta.contracts.identityFactory);
    console.log('identityFactory.current', identityFactory.current);
    const identities = await identityFactory.current.getIdentitiesByTheGraph();
    const identityAddresses = identities.map(identity => identity.address);

    // Loading finished
    setRecoverWalletsState(0);

    if (identityAddresses.length === 0) {
      return;
    }
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

  async function proposeForDeletion() {
    if (_chainMeta?.networkId && user && isWeb3Enabled) {
      try {
        if (selectedWallet.length === 0) {
          alert('Please select a wallet to be removed.');
          return;
        }
        console.log('selectedWallet', selectedWallet);
        // const tx = await identity.current.connect(web3Signer.current).proposeAdditionalOwnerRemoval(selectedWallet);
        // await tx.wait();
        await identity.current.proposeOwnerRemoval(removeOwnerProposalState);
  
        init();
      } catch (e) {
        console.log(e);
      }
    }
  }

  async function addOwner(newOwnerAddress) {
    try {
      // await identity.current.addAdditionalOwner(newOwnerAddress);
      await identity.current.addOwner(addingOwnerState);
    } catch (e) {
      console.log(e);
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
      {/* State -1: Loading */}
      {recoverWalletsState === -1 && (<>{<SkeletonLoadingList /> || <Text>No data yet...</Text>}</>)}

      {/* State 0 */}
      {recoverWalletsState === 0 && (
        <ChainSupportedComponent>
          <Box
            borderWidth="1px"
            borderRadius="lg"
            p="9"
          >
            <Heading size="lg">Manage Identity: Recovery Wallets</Heading>

            <TableContainer mt="9">
              <Table variant="unstyled">
                <Tbody>
                  {DUMMY_ADDRESSES.map((val, index) => (
                    <Tr key={`recovery-wallets-state-0-${index}`}>
                      <Td textAlign="left" pl="0">Wallet {`${index}`}:</Td>
                      <Td textAlign="left">
                        {val}

                        {val.toLowerCase() === walletAddress.toLowerCase() && (
                          <Button
                            colorScheme="teal"
                            variant="outline"
                            size="sm"
                            ml="6"
                          >
                            Currently Logged In
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>

            <Flex justify="flex-end" mt="12" gap="6">
              <Button
                colorScheme="teal"
                variant="solid"
                size="md"
                width="140px"
                onClick={() => setRecoverWalletsState(1)} // go to state 1
              >
                Add Wallets
              </Button>
              <Button
                colorScheme="teal"
                variant="solid"
                size="md"
                width="140px"
                onClick={() => setRecoverWalletsState(2)} // go to state 2
              >
                Remove Wallets
              </Button>
            </Flex>
          </Box>
        </ChainSupportedComponent>
      )}

      {/* State 1: Attach */}
      {recoverWalletsState === 1 && (
        <ChainSupportedComponent>
          <Box
            borderWidth="1px"
            borderRadius="lg"
            p="9"
          >
            <Heading size="lg">Recovery Wallets: Attach</Heading>

            <TableContainer mt="9">
              <Table variant="unstyled">
                <Tbody>
                  {Array(1).fill('').map((_, index) => (
                    <Tr key={`recovery-wallets-state-0-${index}`}>
                      <Td textAlign="left" pl="0">Wallet {`${index}`}:</Td>
                      <Td textAlign="left">
                        {DUMMY_ADDRESSES[index]}
                      </Td>
                      <Td>
                        {index === 0 && (
                          <Button
                            colorScheme="teal"
                            variant="outline"
                            size="sm"
                            // ml="6"
                          >
                            Currently Logged In
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  ))}
                  
                  <Tr>
                    <Td textAlign="left" pl="0">Wallet 3:</Td>
                    <Td textAlign="left">
                      <Input size="sm" maxW="100%" placeholder="Input a new owner address." />
                    </Td>
                    <Td textAlign="left">
                      <Button
                        colorScheme="teal"
                        variant="solid"
                        size="sm"
                        px="3"
                        onClick={(e) => addOwner(e.target.value)}
                      >
                        Attach
                      </Button>
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>

            <Flex justify="flex-end" mt="12">
              <Button
                colorScheme="teal"
                variant="solid"
                size="md"
                onClick={() => setRecoverWalletsState(0)}
              >
                Back
              </Button>
            </Flex>
          </Box>
        </ChainSupportedComponent>
      )}

      {/* State 2: Remove */}
      {recoverWalletsState === 2 && (
        <ChainSupportedComponent>
          <Box
            borderWidth="1px"
            borderRadius="lg"
            p="9"
          >
            <Heading size="lg">Recovery Wallets: Remove</Heading>

            <TableContainer mt="9">
              <Table variant="unstyled">
                <Tbody>
                  <RadioGroup onChange={setSelectedWallet} value={selectedWallet}>
                  {DUMMY_ADDRESSES.map((val, index) => (
                    <Tr key={`recovery-wallets-state-0-${index}`}>
                      <Td textAlign="left" pl="0">Wallet {`${index}`}:</Td>
                      <Td textAlign="left">
                        {val}
                      </Td>
                      <Td textAlign="left">
                        {index === 0 && (
                          <Button
                            colorScheme="teal"
                            variant="outline"
                            size="sm"
                          >
                            Currently Logged In
                          </Button>
                        )}

                        {index !== 0 && (
                          <Radio
                            value={val}
                          >
                            Mark for Deletion
                          </Radio>
                        )}
                      </Td>
                    </Tr>
                  ))}
                  </RadioGroup>
                </Tbody>
              </Table>
            </TableContainer>

            <Flex justify="flex-end" mt="12" gap="6">
              <Button
                colorScheme="teal"
                variant="outline"
                size="md"
                w="180px"
                onClick={() => setRecoverWalletsState(0)} // go to state 0
              >
                Cancel
              </Button>
              <Button
                colorScheme="teal"
                variant="solid"
                size="md"
                w="180px"
                onClick={proposeForDeletion}
              >
                Propose for Deletion
              </Button>
            </Flex>
          </Box>
        </ChainSupportedComponent>
      )}

      {/* State 3: Attach Success */}
      {recoverWalletsState === 3 && (
        <ChainSupportedComponent>
          <Box
            borderWidth="1px"
            borderRadius="lg"
            p="9"
          >
            <Heading size="lg">Recovery Wallets: Remove</Heading>

            <TableContainer mt="9">
              <Table variant="unstyled">
                <Tbody>
                  <RadioGroup>
                  {Array(2).fill('').map((_, index) => (
                    <Tr key={`recovery-wallets-state-0-${index}`}>
                      <Td textAlign="left" pl="0">Wallet {`${index}`}:</Td>
                      <Td textAlign="left">
                        {DUMMY_ADDRESSES[index]}
                      </Td>
                      <Td textAlign="left">
                        {index === 0 && (
                          <Button
                            colorScheme="teal"
                            variant="outline"
                            size="sm"
                          >
                            Currently Logged In
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  ))}
                  </RadioGroup>
                </Tbody>
              </Table>
            </TableContainer>

            <Flex justify="flex-end" mt="12">
              <Button
                colorScheme="teal"
                variant="solid"
                size="md"
                onClick={() => {}}
              >
                Remove Wallets
              </Button>
            </Flex>
          </Box>
        </ChainSupportedComponent>
      )}

      {/* State 4: Remove */}
      {recoverWalletsState === 4 && (
        <ChainSupportedComponent>
          <Box
            borderWidth="1px"
            borderRadius="lg"
            p="9"
          >
            <Heading size="lg">Recovery Wallets: Remove</Heading>

            <TableContainer mt="9">
              <Table variant="unstyled">
                <Tbody>
                  <RadioGroup>
                  {DUMMY_ADDRESSES.map((val, index) => (<>
                    {index === 2 && (
                    <Tr
                      key={`recovery-wallets-state-0-${index}`}
                      borderWidth="1px"
                      borderRadius="lg"
                      borderColor="red"
                    >
                      <Td textAlign="left">Wallet {`${index}`}:</Td>
                      <Td textAlign="left">
                        {val}
                      </Td>

                      <Td textAlign="left">
                        {index === 2 && (
                          <Radio
                            value={val}
                          >
                            AGREE to Delete
                          </Radio>
                        )}
                      </Td>
                    </Tr>)}
                    {index !== 2 && (<Tr key={`recovery-wallets-state-0-${index}`}>
                      <Td textAlign="left">Wallet {`${index}`}:</Td>
                      <Td textAlign="left">
                        {val}
                      </Td>

                      <Td textAlign="left">
                        {index === 1 && (
                          <Button
                            colorScheme="teal"
                            variant="outline"
                            size="sm"
                          >
                            Currently Logged In
                          </Button>
                        )}
                      </Td>
                    </Tr>)}
                  </>))}
                  </RadioGroup>
                </Tbody>
              </Table>
            </TableContainer>

            <Flex justify="flex-end" mt="12">
              <Button
                colorScheme="teal"
                variant="solid"
                size="md"
                onClick={() => {}}
              >
                Remove Wallets
              </Button>
            </Flex>
          </Box>
        </ChainSupportedComponent>
      )}
    </>
  );
};
