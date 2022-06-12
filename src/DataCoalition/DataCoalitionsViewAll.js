import React, { useContext, useEffect } from 'react';
import { useMoralis, useMoralisQuery } from 'react-moralis';
import { Box, Stack } from '@chakra-ui/layout';
import {
  Skeleton, CloseButton, Badge, ButtonGroup, Button, Divider,
  Alert, AlertIcon, AlertTitle, Heading, Flex, Text, Tooltip
} from '@chakra-ui/react';
import SkeletonLoadingList from '../UtilComps/SkeletonLoadingList';
import { CHAIN_TOKEN_SYMBOL } from '../libs/util';
import { progInfoMeta } from '../libs/util';
import { ChainMetaContext } from '../libs/contexts';

let progToIdMapping = {};

export default function() {
  const chainMeta = useContext(ChainMetaContext);

  useEffect(() => {
    progToIdMapping = Object.keys(progInfoMeta).reduce((t,i) => {
      const prog = progInfoMeta[i];
      t[prog.id] = prog;

      return t;
    }, {});
  }, []);

  const { data: dataCoalitions, error: errorDataCoalitionGet } = useMoralisQuery("DataCoalition", query =>
    query.descending("createdAt")
  );

  return (
    <Stack spacing={5}>
      <Heading size="lg">Data Coalitions</Heading>
      <Heading size="xs" opacity=".7">Join Data Coalition DAOs and sell your data in bulk</Heading>

      {errorDataCoalitionGet && 
        <Alert status="error">
          <Box flex="1">
            <AlertIcon />
            <AlertTitle>{errorDataCoalitionGet.message}</AlertTitle>
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" />
        </Alert>
      }

      {dataCoalitions.length === 0 &&
        <SkeletonLoadingList /> || 
        <Flex wrap="wrap" spacing={5}>
          {dataCoalitions.map((item) => <Box key={item.id} borderWidth="1px" borderRadius="lg" overflow="hidden" maxW="sm" mr="1rem" mb="1rem">
            <Flex direction="column" justify="space-between" height="100%">
              <Box>
                <Heading size="md" p="5">{item.get('name')}</Heading>
              </Box>
              
              <Divider />
              
              <Box p="3">
                <Text>{item.get('description')}</Text>
              </Box>

              <Box p="3" flexGrow="1">
                <Text mt="2" mb="2">I'm interested in:</Text>

                {item.get('dataHoldingMapping').map(i => (
                  <Badge borderRadius="full" px="2" mr="2" colorScheme="teal">{i.progId && progToIdMapping[i.progId].name || "Any Arbitrary Data"}</Badge>
                ))} 
              </Box>

              <Box p="3">
              {item.get('canJoin') && <Text mb="2">You are eligible to join:</Text>}

              <Tooltip label="Coming soon...">
                <ButtonGroup colorScheme="teal" spacing="3" size="sm">
                {item.get('canJoin') && <><Button disabled={true} colorScheme="teal">Add Data & Join</Button>
                  <Button disabled={true} colorScheme="teal" variant="outline">Bond {`${CHAIN_TOKEN_SYMBOL(chainMeta.networkId)}`} & Join</Button></> || <Button disabled={true} colorScheme="teal" variant="outline">Stake {`${CHAIN_TOKEN_SYMBOL(chainMeta.networkId)}`}</Button>}
                </ButtonGroup>
              </Tooltip>
            </Box>
            </Flex>
          </Box>)}
          
        </Flex>
      }
    </Stack>
  );
};
