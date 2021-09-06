import moment from 'moment';
import React, { useContext, useState, useEffect } from 'react';
import { useMoralis, useMoralisQuery, useMoralisCloudFunction } from 'react-moralis';
import { Box, Stack } from '@chakra-ui/layout';
import {
  Skeleton, CloseButton, HStack, Badge, ButtonGroup, Button, Divider,
  Alert, AlertIcon, AlertTitle, Heading, Image, Flex, Link, Text,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { progInfoMeta, config, mydaRoundUtil } from '../libs/util';
import { ChainMetaContext } from '../libs/contexts';

let progToIdMapping = {};

export default function() {
  const chainMeta = useContext(ChainMetaContext);
  const { user } = useMoralis();
  const { web3 } = useMoralis();
  
  const { isInitialized, Moralis } = useMoralis();

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
        <Stack w="1000px">
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Box />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
        </Stack> || 
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

              <ButtonGroup colorScheme="teal" spacing="3" size="sm">
              {item.get('canJoin') && <><Button disabled="true" colorScheme="teal">Add Data & Join</Button>
                <Button disabled="true" colorScheme="teal" variant="outline">Bond Myda & Join</Button></> || <Button disabled="true" colorScheme="teal" variant="outline">Stake Myda</Button>}
              </ButtonGroup>
            </Box>
            </Flex>
          </Box>)}
          
        </Flex>
      }
    </Stack>
  );
};
