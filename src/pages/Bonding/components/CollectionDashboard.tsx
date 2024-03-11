import React from "react";
import { Box, Button, Flex, Input, Text } from "@chakra-ui/react";
import { LivelinessScore } from "../../../components/Liveliness/LivelinessScore";
import { Bond } from "@itheum/sdk-mx-data-nft/out";
import BigNumber from "bignumber.js";

type CollectionDashboardProps = {
  bondNft: Bond;
};

export const CollectionDashboard: React.FC<CollectionDashboardProps> = (props) => {
  const { bondNft } = props;
  return (
    <Flex flexDirection="column" w="full" gap={5}>
      <Flex flexDirection="row" w="full" gap={5} justifyContent="space-between">
        <Box>
          <Text fontSize="1.5rem">1. Data NFT:&nbsp;&nbsp;SonicTunes</Text>
          <Flex flexDirection="row" gap={4}>
            <Text fontSize=".75rem">
              {BigNumber(bondNft.bondAmount)
                .dividedBy(10 ** 18)
                .toNumber()}{" "}
              $ITHEUM Bonded{" "}
            </Text>
            <Text fontSize=".75rem">|</Text>
            <Text fontSize=".75rem">1,000 $ITHEUM Penalized </Text>
            <Text fontSize=".75rem">|</Text>
            <Text fontSize=".75rem">1,000 $ITHEUM Remaining</Text>
          </Flex>
          <LivelinessScore unboundTimestamp={bondNft.unboundTimestamp} lockPeriod={90} />
        </Box>
        <Box>
          <Flex flexDirection="column" gap={4}>
            <Flex flexDirection="row" gap={4}>
              <Flex flexDirection="column" gap={4}>
                <Text fontSize="1.1rem">Enforce Penalty</Text>
                <Flex flexDirection="row" gap={4} alignItems="center">
                  <Input type="number" w="25%" />
                  <Text fontSize="1.1rem">%</Text>
                  <Button colorScheme="pink">Penalize</Button>
                </Flex>
                <Text fontSize=".8rem">* 500 $ITHEUM will be taken from creator</Text>
              </Flex>
              <Flex flexDirection="column" gap={4}>
                <Text fontSize="1.1rem">Enforce Max Slash 100%</Text>
                <Flex flexDirection="row" gap={4} alignItems="center">
                  <Button colorScheme="pink">Slash</Button>
                </Flex>
                <Text fontSize=".8rem">* 10,000 $ITHEUM will be taken from creator</Text>
              </Flex>
            </Flex>
            <Flex flexDirection="column" alignItems="flex-start" gap={2}>
              <Text fontSize="1.5rem" textColor="teal.200">
                Remove Bond Withdraw Restriction
              </Text>
              <Text fontSize="1.1rem">Allow the Creator to withdraw bond with NO penalty</Text>
              <Button colorScheme="teal">GO!</Button>
            </Flex>
            <Flex flexDirection="column" alignItems="flex-start" gap={2}>
              <Text fontSize="1.5rem" textColor="teal.200">
                Compensation Self Claiming
              </Text>
              <Text fontSize="1.1rem">1,000 $ITHEUM To Date....</Text>
              <Text fontSize=".8rem">Set End Claim Date for Affected Owners to Claim By</Text>
              <Flex gap={5}>
                <Input type="number" w="25%" />
                <Button colorScheme="teal">GO!</Button>
              </Flex>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
};
