import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { BondingParameters } from "./components/BondingParameters";
import { CollectionDashboard } from "./components/CollectionDashboard";

export const Bonding: React.FC = () => {
  return (
    <Flex as="div" flexDirection="column" mx={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }} gap={8}>
      <Box border="1px solid" borderColor="#00C79740" rounded="3xl" px={10} py={20} mt={5} bg="#1b1b1b50">
        <Flex justifyContent="space-between" alignItems="center" px={10}>
          <Flex flexDirection="column" justifyContent="center">
            <Text fontSize="3.1rem" fontFamily="Clash-Medium">
              Itheum Life: Bonding
            </Text>
          </Flex>
        </Flex>
      </Box>
      <BondingParameters />
      <Box border="1px solid" borderColor="#00C79740" rounded="3xl" px={10} py={5} bg="#1b1b1b50">
        <Flex justifyContent="space-between" alignItems="center" px={10}>
          <Flex flexDirection="column" justifyContent="center">
            <Text fontSize="2rem" fontFamily="Clash-Medium" textColor="teal.200">
              Total Bonded: 30,000 $ITHEUM
            </Text>
          </Flex>
        </Flex>
      </Box>
      <CollectionDashboard />
    </Flex>
  );
};
