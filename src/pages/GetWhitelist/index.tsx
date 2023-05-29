import React from "react";
import { Box, Flex, Heading, Button, Image, Text, Center, Link } from "@chakra-ui/react";
import { FaTwitter, FaDiscord, FaTelegramPlane } from "react-icons/fa";
import illustration from "assets/img/illustration.png";

export const GetWhitelist: React.FC = () => {
  return (
    <Flex w="full" h="full">
      <Flex
        w="100%"
        height={{ base: "auto", md: "87dvh" }}
        bgGradient="linear(to-r, bgDark, #6B46C160, #00C79730)"
        bgSize="contain"
        bgPosition="bottom"
        bgRepeat="no-repeat"
        justifyContent="center"
        position="relative">
        <Center w="95%">
          <Flex
            w="100%"
            justifyContent={[null, null, null, "space-between"]}
            flexDirection={["column", null, "row"]}
            mx={{ base: 0, "2xl": 20 }}
            alignItems="center">
            <Box width={["100%", null, null, "500px", "690px"]} textAlign={["center", null, null, "left", "left"]} ml={{ xs: "auto", xl: 10 }} pt={10}>
              <Heading as="h1" size={["1xl", null, null, "1xl", "2xl"]} fontWeight="500">
                Your data is now a{" "}
                <Text as="span" color="teal.200">
                  new asset class!
                </Text>{" "}
                Mint supercharged Data NFTs with{" "}
                <Text as="span" color="teal.200">
                  real-world value
                </Text>
              </Heading>

              <Text mt="1rem" fontSize="lg" fontWeight="400" lineHeight="25px" marginTop="7">
                Are you a Data Creator? Do you generate valuable data insights for the Blockchain, DeFi, Gaming, Entertainment, or any other industry? If so, we
                want to work with you!
              </Text>
              <Text fontSize="lg" fontWeight="400" lineHeight="25px" mt={7}>
                Get <strong>Whitelisted</strong> to be part of the first batch of Data Creators to mint Data NFTs. Make history!
              </Text>
              <Button
                as={Link}
                variant="solid"
                colorScheme="teal"
                px={7}
                py={6}
                rounded="lg"
                mt={7}
                href="https://share-eu1.hsforms.com/15ry2GdkgRWidTObNuCahEAf5yjc"
                isExternal>
                Get Whitelisted
              </Button>
            </Box>

            <Box mt={{ base: 10, lg: 0 }}>
              <Image boxSize={{ base: "auto", lg: "40rem" }} w="100%" height="auto" src={illustration} alt="Data NFTs Illustration" />
            </Box>
          </Flex>
          <Box position="absolute" bottom={2} right={4} display={{ base: "none", lg: "flex" }}>
            <Flex direction="column" justifyContent="end" alignItems="end" gap={5} pb={16} pr={4}>
              <a href="https://twitter.com/itheum" target="_blank" rel="noreferrer">
                <Box rounded="full" border="2px solid" w={16} h={16} alignContent={"center"} backgroundColor="bgDark">
                  <Image as={FaTwitter} m="auto" fontSize="3xl" h="full" />
                </Box>
              </a>

              <a href="https://itheum.io/discord" target="_blank" rel="noreferrer">
                <Box rounded="full" border="2px solid" w={16} h={16} alignContent={"center"} backgroundColor="bgDark">
                  <Image as={FaDiscord} m="auto" fontSize="3xl" h="full" />
                </Box>
              </a>

              <a href="https://t.me/itheum" target="_blank" rel="noreferrer">
                <Box rounded="full" border="2px solid" w={16} h={16} alignContent={"center"} backgroundColor="bgDark">
                  <Image as={FaTelegramPlane} m="auto" fontSize="3xl" h="full" />
                </Box>
              </a>
            </Flex>
          </Box>
        </Center>
      </Flex>
    </Flex>
  );
};
