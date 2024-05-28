import React from "react";

import { Box, Flex, Image, Link, Heading, Button, Text } from "@chakra-ui/react";
import dataNFTImg from "assets/img/whitelist/getWhitelist.png";

const NewCreatorCTA = () => {
  return (
    <Flex flexDirection={["column", null, "row"]} alignItems="center" justifyContent="center">
      <Box>
        <Image className="bounce-hero-img" margin="auto" boxSize="auto" w={{ base: "90%", md: "60%" }} src={dataNFTImg} alt="Data NFTs Illustration" />
      </Box>

      <Box width={["100%", null, null, "500px", "650px"]} textAlign={["center", null, null, "left", "left"]}>
        <Heading as="h1" size="2xl" fontFamily="Clash-Medium">
          Are you a{" "}
          <Text as="span" color="teal.200">
            new Creator?{" "}
          </Text>
        </Heading>

        <Text fontSize="xl" fontWeight="400" lineHeight="25px" my={4}>
          Ready to begin your Data NFT journey but not sure where to start? Fear not! We have a dedicated Discord channel for new creators. {`We'll`} walk you
          through the process with detailed guides, tips, tricks and support. What are you waiting for? {`Let's`} do this!
        </Text>

        <Button as={Link} variant="solid" colorScheme="teal" px={7} py={6} rounded="lg" mt={7} href="https://itheum.io/discord" isExternal>
          Join Data Creator Discord
        </Button>
      </Box>
    </Flex>
  );
};

export default NewCreatorCTA;
