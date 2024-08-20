import React, { Fragment } from "react";
import { Box, Button, Flex, Link, Text } from "@chakra-ui/react";

export const LivelinessStaking: React.FC = () => {
  return (
    <Flex id="liveliness" flexDirection="column" w="full" h="auto" justifyContent="center" my={10} p={2}>
      <Text textAlign="center" fontSize={{ base: "34px", md: "50px" }} fontFamily="Clash-Medium" my={5}>
        Liveliness Staking Rewards
      </Text>
    </Flex>
  );
};
