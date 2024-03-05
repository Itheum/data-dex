import React from "react";
import { Box, Button, Flex, Grid, GridItem, Input, Text } from "@chakra-ui/react";
import { Address } from "@multiversx/sdk-core/out";
import { AiFillPauseCircle, AiFillPlayCircle } from "react-icons/ai";

export const BondingParameters: React.FC = () => {
  return (
    <Box border="1px solid" borderColor="#00C79740" rounded="3xl" px={10} py={5} bg="#1b1b1b50">
      <Flex justifyContent="space-between" alignItems="center" px={10}>
        <Flex flexDirection="column" justifyContent="center" w="full" gap={5}>
          <Text fontSize="1.75rem" fontFamily="Clash-Medium" textColor="teal.200">
            Bonding Parameters
          </Text>
          <Grid templateColumns="repeat(5, 1fr)" gap={6}>
            <GridItem w="100%" colSpan={2}></GridItem>
            <GridItem w="100%">Current Value</GridItem>
            <GridItem w="100%" textAlign="right" colSpan={2}>
              New Value
            </GridItem>
          </Grid>
          <Grid templateColumns="repeat(5, 1fr)" gap={6} fontSize="1.3rem">
            <GridItem w="100%" colSpan={2}>
              Minimum Lock Period In Seconds
            </GridItem>
            <GridItem w="100%">7000000</GridItem>
            <GridItem w="100%" textAlign="right" colSpan={2}>
              <Input type="number" w="25%" mr={3} />
              <Button>Set</Button>
            </GridItem>
          </Grid>
          <Grid templateColumns="repeat(5, 1fr)" gap={6} fontSize="1.3rem">
            <GridItem w="100%" colSpan={2}>
              Minimum S Bond
            </GridItem>
            <GridItem w="100%">1,000 $ITHEUM</GridItem>
            <GridItem w="100%" textAlign="right" colSpan={2}>
              <Input type="number" w="25%" mr={3} />
              <Button>Set</Button>
            </GridItem>
          </Grid>
          <Grid templateColumns="repeat(5, 1fr)" gap={6} fontSize="1.3rem">
            <GridItem w="100%" colSpan={2}>
              Minimum Penalty in Percentage
            </GridItem>
            <GridItem w="100%">1,000 $ITHEUM</GridItem>
            <GridItem w="100%" textAlign="right" colSpan={2}>
              <Input type="number" w="25%" mr={3} />
              <Button>Set</Button>
            </GridItem>
          </Grid>
          <Grid templateColumns="repeat(5, 1fr)" gap={6} fontSize="1.3rem">
            <GridItem w="100%" colSpan={2}>
              Minimum Slash In Percentage
            </GridItem>
            <GridItem w="100%">1,000 $ITHEUM</GridItem>
            <GridItem w="100%" textAlign="right" colSpan={2}>
              <Input type="number" w="25%" mr={3} />
              <Button>Set</Button>
            </GridItem>
          </Grid>
          <Grid templateColumns="repeat(5, 1fr)" gap={6} fontSize="1.3rem">
            <GridItem w="100%" colSpan={2}>
              Early Withdraw Penalty in Percentage
            </GridItem>
            <GridItem w="100%">1,000 $ITHEUM</GridItem>
            <GridItem w="100%" textAlign="right" colSpan={2}>
              <Input type="number" w="25%" mr={3} />
              <Button>Set</Button>
            </GridItem>
          </Grid>
          <Flex flexDirection="row" gap={5} py={4} roundedBottom="3xl" justifyContent="start">
            <Flex flexDirection="column">
              <Button aria-label="UnPause contract" loadingText="Loading" variant="ghost" size="md">
                <AiFillPlayCircle size="lg" color="#00C797" />
              </Button>
              <Text>Unpause Minter</Text>
            </Flex>
            <Flex flexDirection="column">
              <Button aria-label="Pause contract" loadingText="Loading" variant="ghost" size="md">
                <AiFillPauseCircle size="lg" color="#00C797" />
              </Button>
              <Text>Pause Minter</Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};
