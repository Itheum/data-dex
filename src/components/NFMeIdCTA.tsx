import React from "react";
import { Box, Flex, Image, Link, Heading, Button, Text } from "@chakra-ui/react";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import nfMeIDVault from "assets/img/nfme/nfme-id-avatar.png";
import { useNavigate } from "react-router-dom";

const NFMeIdCTA = () => {
  const navigate = useNavigate();
  const { address: mxAddress } = useGetAccountInfo();

  return (
    <Flex flexDirection={["column", null, "row"]} alignItems="center" justifyContent="center" backgroundColor="1blue">
      <Box width={["100%", null, null, "300px", "550px"]} textAlign={["center", null, null, "left", "left"]} backgroundColor="1red">
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
              navigate("/getNFMeId");
            }
          }}>
          Mint Your NFMe ID Vault
        </Button>
      </Box>

      <Box backgroundColor="1green">
        <Image margin="auto" boxSize="auto" w={{ base: "90%", md: "50%" }} src={nfMeIDVault} alt="Data NFTs Illustration" />
      </Box>
    </Flex>
  );
};

export default NFMeIdCTA;
