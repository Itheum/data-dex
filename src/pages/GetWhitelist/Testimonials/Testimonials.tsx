import React from "react";
import { Box, Button, Flex, Link, Text } from "@chakra-ui/react";
import andreiTweet from "../../../assets/img/whitelist/andreiTweet.png";
import coinTelegraphTweet from "../../../assets/img/whitelist/coinTelegraphTweet.png";
import foudresTweet from "../../../assets/img/whitelist/foudresTweet.png";
import mvxTweet from "../../../assets/img/whitelist/mvxTweet.png";

export const Testimonials: React.FC = () => {
  return (
    <Flex flexDirection="column" w="full" h="auto" justifyContent="center" my={10}>
      <Text textAlign="center" fontSize="59px" fontFamily="Clash-Medium" my={5}>
        What are people saying
        <br /> about us
      </Text>
      <Text textAlign="center" fontSize="17px" fontFamily="Satoshi-Light" mb={7}>
        Don&apos;t just take our word for it, Here are some testimonials about us.
      </Text>
      <Flex flexDirection={{ base: "column", xl: "row" }} h={{ base: "auto", xl: "1040px" }} alignItems="center" justifyContent="center" gap={6}>
        <Box w={{ base: "auto", md: "403px" }} h="643px" bgColor="white" borderRadius="34px" display="flex" justifyContent="center" alignItems="center">
          <img src={andreiTweet} alt="andreiTweet" width="auto" />
        </Box>
        <Box as="div">
          <Box w="403px" h="507px" bgColor="white" borderRadius="34px" my={5} display="flex" justifyContent="center" alignItems="center">
            <img src={coinTelegraphTweet} alt="cointelegraphTweet" />
          </Box>
          <Box w="403px" h="514px" bgColor="white" borderRadius="34px" display="flex" justifyContent="center" alignItems="center">
            <img src={mvxTweet} alt="mvxTweet" />
          </Box>
        </Box>
        <Box w="403px" h="550px" bgColor="white" borderRadius="34px" display="flex" justifyContent="center" alignItems="center">
          <img src={foudresTweet} alt="foudresTweet" />
        </Box>
      </Flex>
      <Box w="full" display="flex" justifyContent="center" my={5}>
        <Button
          as={Link}
          variant="solid"
          colorScheme="teal"
          px={7}
          py={6}
          rounded="lg"
          mt={7}
          href="https://share-eu1.hsforms.com/1h2V8AgnkQJKp3tstayTsEAf5yjc"
          isExternal>
          Get Whitelisted Today
        </Button>
      </Box>
    </Flex>
  );
};
