import React from "react";
import { Box, Flex, Image, Link, Heading, Button, Text } from "@chakra-ui/react";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useNavigate } from "react-router-dom";
import nfMeIDVault from "assets/img/nfme/nfme-id-avatar.png";

const NFMeIdCTA = () => {
  const navigate = useNavigate();
  const { address: mxAddress } = useGetAccountInfo();

  return (
    <Flex mt={{ base: "10", md: "0" }} flexDirection={["column", null, "row"]} alignItems="center" justifyContent="center">
      <Box width={["100%", null, null, "300px", "550px"]} textAlign={["center", null, null, "left", "left"]}>
        <Heading as="h1" size="xl" fontFamily="Clash-Medium">
          Mint your{" "}
          <Text as="span" color="teal.200">
            NFMe ID Vault{" "}
          </Text>{" "}
          , stake your{" "}
          <Text as="span" color="teal.200">
            Liveliness Reputation
          </Text>{" "}
          and{" "}
          <Text as="span" color="teal.200">
            Farm Token Rewards.
          </Text>
        </Heading>

        <Button
          as={Link}
          variant="solid"
          colorScheme="teal"
          px={7}
          py={6}
          rounded="lg"
          mt={7}
          onClick={() => {
            if (mxAddress) {
              navigate("/mintdata?launchTemplate=nfmeidvault");
            } else {
              navigate("/NFMeId");
            }
          }}>
          Mint Your NFMe ID Vault
        </Button>
      </Box>

      <Box mt={{ base: "10", md: "0" }}>
        <Image margin="auto" boxSize="auto" w={{ base: "60%", md: "50%" }} src={nfMeIDVault} alt="Data NFTs Illustration" />
      </Box>
    </Flex>
  );
};

export default NFMeIdCTA;
