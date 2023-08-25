import React from "react";
import { Box, Flex, Text, useColorMode } from "@chakra-ui/react";

export const TrendingData: React.FC = () => {
  const { colorMode } = useColorMode();
  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      w="100%"
      height={{ base: "auto", md: "87dvh" }}
      bgGradient={colorMode === "light" ? "bgWhite" : "linear(to-r, bgDark, #6B46C160, #00C79730)"}
      bgSize="contain"
      bgPosition="bottom"
      bgRepeat="no-repeat"
      position="relative">
      <Box display="flex" justifyContent="center">
        <Text textAlign="center" fontSize="59px" fontFamily="Clash-Medium" my={5} w="690px">
          Explore Trending Data NFTs Collections
        </Text>
      </Box>
    </Flex>
  );
};
