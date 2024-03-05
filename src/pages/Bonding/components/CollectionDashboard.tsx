import React from "react";
import { Box, Button, Flex, Input, Text } from "@chakra-ui/react";
import { LivelinessScore } from "../../../components/Liveliness/LivelinessScore";

export const CollectionDashboard: React.FC = () => {
  return (
    <Box border="1px solid" borderColor="#00C79740" rounded="3xl" px={10} py={5} bg="#1b1b1b50">
      <Flex justifyContent="space-between" alignItems="center" px={10}>
        <Flex flexDirection="column" justifyContent="center" w="full" gap={5}>
          <Text fontSize="1.75rem" fontFamily="Clash-Medium" textColor="teal.200">
            Collection Dashboard
          </Text>
          <Flex flexDirection="column" w="full" gap={5}>
            <Flex flexDirection="row" w="full" gap={5} justifyContent="space-between">
              <Box>
                <Text fontSize="1.5rem">1. Data NFT:&nbsp;&nbsp;SonicTunes</Text>
                <Flex flexDirection="row" gap={4}>
                  <Text fontSize=".75rem">1,000 $ITHEUM Bonded </Text>
                  <Text fontSize=".75rem">|</Text>
                  <Text fontSize=".75rem">1,000 $ITHEUM Penalized </Text>
                  <Text fontSize=".75rem">|</Text>
                  <Text fontSize=".75rem">1,000 $ITHEUM Remaining</Text>
                </Flex>
                <LivelinessScore unboundTimestamp={1709656665} lockPeriod={90} />
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
        </Flex>
      </Flex>
    </Box>
  );
};
