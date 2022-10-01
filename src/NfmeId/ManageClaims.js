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
  const [manageClaimsState, setManageClaimsState] = useState(0); 

  const [claims, setClaims] = useState([]);
  
  let web3Signer = useRef();
  let identity = useRef();
  
  console.log('manageClaimsState', manageClaimsState);
  const init = async () => {
    console.log('init');
    web3Signer.current = web3Provider.getSigner();
    const identityFactory = new ethers.Contract(_chainMeta.contracts.identityFactory, ABIS.ifactory, web3Signer.current);

    // query-start block number
    // We can only query last 1000 blocks due to the limit of Mumbai Testnet
    const fromBlockNumber = (await web3Provider.getBlockNumber()) - 1000;
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
          <Box maxW="sm" borderWidth="1px" p="10" borderRadius="lg" maxWidth="initial">
            <Heading size="lg">Manage Claims: View and Delete</Heading>

            <Box fontSize="sm" mt="9" align="left" flex="1">Your first step is to deploy what we can an identity, this is a smart contract that can be used by you to store your web3 “reputation” and to hold your NFMe ID Souldbound token. You have FULL control over this identity container and you can choose to use it to “talk” with blockchain based DApps to expose your reputation or other data your have within the Itheum ecosystem. The DApps can then provide you personalized experiences. Think - gated features or immediate whitelists</Box>

            <Button mt="12" colorScheme="teal" variant="outline" onClick={() => {}}>Add New Claims</Button>
          </Box>
        </ChainSupportedComponent>
      )}
    </>
  );
};
