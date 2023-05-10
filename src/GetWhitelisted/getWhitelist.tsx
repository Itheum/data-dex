import React, { useEffect } from "react";
import { Box, Flex, Heading, Button, Image, Text, Center, useDisclosure, ModalBody, Modal, ModalOverlay, ModalContent, ModalHeader } from "@chakra-ui/react";
import { FaTwitter, FaDiscord, FaTelegramPlane } from "react-icons/fa";
import illustration from "../img/illustration.png";

export const GetWhitelist: React.FC = () => {
  const { isOpen: isWhitelistFormOpen, onOpen: onWhitelistFormOpen, onClose: onWhitelistFormClose } = useDisclosure();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.hsforms.net/forms/v2.js";
    document.body.appendChild(script);

    script.addEventListener("load", () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      if (window.hbspt) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        window.hbspt.forms.create({
          region: "eu1",
          portalId: "25472280",
          formId: "e6bcb619-d920-4568-9d4c-e6cdb826a110",
          target: "#hubspotForm",
        });
      }
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
  }, [isWhitelistFormOpen]);

  return (
    <Flex w="full" h="full">
      <Flex
        w="100%"
        h={{ base: "auto", md: "84vh" }}
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
              <Heading as="h1" size={["2xl", null, null, "3xl", "4xl"]} fontWeight="500">
                Fully{" "}
                <Text as="span" color="teal.200">
                  Unlock
                </Text>{" "}
                your <br /> Data&apos;s Value and&nbsp;
                <br />
                <Text as="span" color="teal.200">
                  Mint
                </Text>{" "}
                as an&nbsp;
                <Text as="span" color="teal.200">
                  NFT
                </Text>{" "}
              </Heading>

              <Text mt="1rem" fontSize="lg" fontWeight="400" lineHeight="25px" marginTop="7">
                Lorem ipsum dolor sit amet consectetur. Leo posuere ultrices elementum mattis nulla purus integer diam. Integer maus sed rhoncus tortor et
                augue.
              </Text>
              <Text fontSize="lg" fontWeight="400" lineHeight="25px" mt={7}>
                Join our <strong>Whitelist</strong> Now to be among the first data creators to mint their datasets as Data NFTs.
              </Text>
              <Button variant="solid" colorScheme="teal" px={7} py={6} rounded="lg" mt={7} onClick={onWhitelistFormOpen}>
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
              <Box rounded="full" border="2px solid" w={16} h={16} alignContent={"center"} backgroundColor="bgDark">
                <Image as={FaDiscord} m="auto" fontSize="3xl" h="full" />
              </Box>
              <Box rounded="full" border="2px solid" w={16} h={16} alignContent={"center"} backgroundColor="bgDark">
                <Image as={FaTelegramPlane} m="auto" fontSize="3xl" h="full" />
              </Box>
            </Flex>
          </Box>
        </Center>
      </Flex>
      <Modal isOpen={isWhitelistFormOpen} onClose={onWhitelistFormClose} closeOnEsc={true} closeOnOverlayClick={true}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalBody>
            <div id="hubspotForm"></div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};
