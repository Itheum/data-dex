import moment from 'moment';
import React, { useContext, useEffect, useState, useRef } from 'react';
import { useMoralis, useMoralisCloudFunction } from 'react-moralis';
import { Box, Stack, HStack } from '@chakra-ui/layout';
import {
  Skeleton, Alert, Link, Text,
  AlertIcon, AlertTitle, CloseButton, Heading,
  Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption, Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  useToast,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import ShortAddress from './UtilComps/ShortAddress';
import SkeletonLoadingList from './UtilComps/SkeletonLoadingList';
import { config, sleep } from './libs/util';
import { CHAIN_TX_VIEWER, CHAIN_TOKEN_SYMBOL, TERMS } from './libs/util';
import { ChainMetaContext } from './libs/contexts';

const useContainerDimensions = myRef => {
  const getDimensions = () => ({
    width: myRef.current.offsetWidth,
    height: myRef.current.offsetHeight
  })

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const handleResize = () => {
      setDimensions(getDimensions())
    }

    if (myRef.current) {
      setDimensions(getDimensions())
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [myRef])

  return dimensions;
};

export default function() {
  const componentRef = useRef();
  const { width, height } = useContainerDimensions(componentRef);
  const chainMeta = useContext(ChainMetaContext);
  const toast = useToast();
  const { user } = useMoralis();
  const [noData, setNoData] = useState(false);
  const [userDataOrders, setUserDataOrders] = useState([]);

  const {
    error: errCfUsrPurOrders,
    isLoading: loadingUsrPurOrders,
    fetch: doUsrPurOrders,
    data: dataUsrPurOrders
  } = useMoralisCloudFunction("getUserPurchaseDataOrders", {
    userAddress: user.get('ethAddress'),
    networkId: chainMeta.networkId
  }, { autoFetch: false });  

  useEffect(() => {
    console.log('width', width);
    console.log('height', height);
  }, [width, height]);

  useEffect(() => {
    if (user && user.get('ethAddress')) {
      console.log('Page loaded');
      doUsrPurOrders();
    }
  }, []);

  useEffect(() => {
    (async() => {
      if (dataUsrPurOrders && dataUsrPurOrders.length === 0) {
        await sleep(5);
        setNoData(true);
      } else {
        if (!errCfUsrPurOrders && dataUsrPurOrders) {
          setUserDataOrders(dataUsrPurOrders);
        }
      }
    })();
  }, [errCfUsrPurOrders, dataUsrPurOrders]);

  return (
    <Stack spacing={5} ref={componentRef}>
      <Heading size="lg">Purchased Data</Heading>
      <Heading size="xs" opacity=".7">View Data Packs you have purchased direct from your peers</Heading>

      {errCfUsrPurOrders && 
        <Alert status="error">
          <Box flex="1">
            <AlertIcon />
            <AlertTitle>{errCfUsrPurOrders.message}</AlertTitle>
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" />
        </Alert>
      }

      {userDataOrders.length === 0 &&
        <>{!noData && <SkeletonLoadingList /> || <Text>No data yet...</Text>}</> || 
        <Box overflowX="auto">
          <Table overflowX="auto">
            <TableCaption>The following data was purchased by you</TableCaption>
            <Thead>
              <Tr>
                <Th><Text w="160px">When</Text></Th>
                <Th>Identifiers</Th>
                <Th>Data Preview</Th>
                <Th>Terms of use</Th>
                <Th>Data File</Th>
                <Th>Price Paid</Th>
                <Th>TX Hash</Th>
              </Tr>
            </Thead>
            <Tbody>
              {userDataOrders.map((item) => <Tr key={item.objectId}>
                <Td><Text fontSize="xs">{moment(item.createdAt).format(config.dateStrTm)}</Text></Td>
                <Td>
                  <Popover>
                    <PopoverTrigger>
                      <Button fontSize="sm">Show</Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <PopoverArrow />
                      <PopoverCloseButton />
                      <PopoverHeader>Identifiers</PopoverHeader>
                      <PopoverBody>
                        <Text fontSize="sm" >
                          Data Order ID: <ShortAddress address={item.objectId} /> <br />
                          Data Pack ID: <ShortAddress address={item.dataPackId} /> <br />
                          Seller Address: <ShortAddress address={item.dataPack[0].sellerEthAddress} />
                        </Text>
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                </Td>
                <Td><Text fontSize="sm">{item.dataPack[0].dataPreview}</Text></Td>
                <Td><Text fontSize="sm">{TERMS.find(i => i.id === item.dataPack[0].termsOfUseId).val}</Text></Td>
                <Td><Link href={item.dataFileUrl} isExternal><Text fontSize="sm">Download Data File <ExternalLinkIcon mx="2px" /></Text></Link></Td>
                <Td><Text fontSize="sm">{item.pricePaid} {CHAIN_TOKEN_SYMBOL(chainMeta.networkId)}</Text></Td>
                <Td>
                  <HStack>
                    <ShortAddress address={item.txHash} />
                    <Link href={`${CHAIN_TX_VIEWER[chainMeta.networkId]}${item.txHash}`} isExternal><ExternalLinkIcon mx="2px" /></Link>
                  </HStack>
                </Td>
              </Tr>)}
            </Tbody>
            <Tfoot>
              <Tr>
                <Th>When</Th>
                <Th>Identifiers</Th>
                <Th>Data Preview</Th>
                <Th>Terms of use</Th>
                <Th>Data File</Th>
                <Th>Price Paid</Th>
                <Th>TX Hash</Th>
              </Tr>
            </Tfoot>
          </Table>
        </Box>}
    </Stack>
  );
};
