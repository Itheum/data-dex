import React, { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Heading,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useBreakpointValue,
  useDisclosure,
  // useColorMode,
  SimpleGrid,
} from "@chakra-ui/react";
import { useGetAccount } from "@multiversx/sdk-dapp/hooks";
import imgProgGaPa from "assets/img/prog-gaming-passport.png";
import imgProgGaPaES from "assets/img/prog-gaming.jpg";
import imgProgRhc from "assets/img/prog-rhc.png";
import imgProgWfh from "assets/img/prog-wfh.png";
import { CHAIN_TOKEN_SYMBOL, progInfoMeta } from "libs/config";
import { useChainMeta } from "store/ChainMetaContext";

export default function AppMarketplace() {
  const { chainMeta: _chainMeta } = useChainMeta();
  const { address } = useGetAccount();
  const [learnMoreProd, setLearnMoreProg] = useState<keyof typeof progInfoMeta>("rhc");
  const { isOpen: isProgressModalOpen, onOpen: onProgressModalOpen, onClose: onProgressModalClose } = useDisclosure();

  const handleLearnMoreProg = (progCode: any) => {
    setLearnMoreProg(progCode);
    onProgressModalOpen();
  };

  const appendUserAddressAndRedirect = (link: string) => {
    let updatedLink = link;

    // if user logged in
    if (address) {
      updatedLink = `${updatedLink}?ddexref=${window.btoa(`addr=${address}`)}`;
    }

    window.open(updatedLink);
  };

  const modelSize = useBreakpointValue({ base: "xs", md: "xl" });

  return (
    <>
      <Stack pt="5">
        <Heading size="lg" fontWeight="semibold">
          App Marketplace
        </Heading>
        <Text size="sm" opacity=".7" fontWeight="normal">
          Join a community built app and earn {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)} when you trade your data
        </Text>
        <SimpleGrid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }} spacing={4}>
          <Box overflow="hidden" backgroundColor="none">
            <Image src={imgProgGaPa} w="full" border="1px solid transparent" borderColor="#00C797" borderRadius="16px" />
            <Box p="3">
              <Box display="flex" alignItems="baseline">
                <Box mt="1" mr="1" fontWeight="semibold" as="h4" lineHeight="tight" noOfLines={1}>
                  Web3 Gamer Passport
                </Box>
                <Badge borderRadius="full" px="2" colorScheme="teal">
                  {" "}
                  Live
                </Badge>
              </Box>
              <Button size="sm" mt="3" mr="3" colorScheme="teal" variant="outline" onClick={() => handleLearnMoreProg("gdc")}>
                Learn More
              </Button>
              <Button
                size="sm"
                mt="3"
                colorScheme="teal"
                onClick={() => window.open("https://itheum.medium.com/do-you-want-to-be-part-of-the-gamer-passport-alpha-release-4ae98b93e7ae")}>
                Join Now
              </Button>
            </Box>
          </Box>

          <Box overflow="hidden" backgroundColor="none">
            <Image src={imgProgGaPaES} w="full" border="1px solid transparent" borderColor="#00C797" borderRadius="16px" />
            <Box p="3">
              <Box display="flex" alignItems="baseline">
                <Box mt="1" mr="1" fontWeight="semibold" as="h4" lineHeight="tight" noOfLines={1}>
                  Gamer Passport - ESports
                </Box>
                <Badge borderRadius="full" px="2" colorScheme="blue">
                  {" "}
                  Coming Soon
                </Badge>
              </Box>
              <Button size="sm" mt="3" mr="3" colorScheme="teal" variant="outline" onClick={() => handleLearnMoreProg("gpes")}>
                Learn More
              </Button>
            </Box>
          </Box>

          <Box overflow="hidden" backgroundColor="none">
            <Image src={imgProgRhc} w="full" border="1px solid transparent" borderColor="#00C797" borderRadius="16px" />

            <Box p="3">
              <Box display="flex" alignItems="baseline">
                <Box mt="1" mr="1" fontWeight="semibold" as="h4" lineHeight="tight" noOfLines={1}>
                  Red Heart Challenge
                </Box>
                <Badge borderRadius="full" px="2" colorScheme="blue">
                  {" "}
                  Coming Soon
                </Badge>
              </Box>
              <Button size="sm" mt="3" mr="3" colorScheme="teal" variant="outline" onClick={() => handleLearnMoreProg("rhc")}>
                Learn More
              </Button>
            </Box>
          </Box>

          <Box overflow="hidden" backgroundColor="none">
            <Image src={imgProgWfh} w="full" border="1px solid transparent" borderColor="#00C797" borderRadius="16px" />

            <Box p="3">
              <Box display="flex" alignItems="baseline">
                <Box mt="1" mr="1" fontWeight="semibold" as="h4" lineHeight="tight" noOfLines={1}>
                  Strava Fitness
                </Box>
                <Badge borderRadius="full" px="2" colorScheme="blue">
                  {" "}
                  Coming Soon
                </Badge>
              </Box>
              <Button size="sm" mt="3" mr="3" colorScheme="teal" variant="outline" onClick={() => handleLearnMoreProg("wfa")}>
                Learn More
              </Button>
            </Box>
          </Box>
        </SimpleGrid>
      </Stack>

      {learnMoreProd && (
        <Modal size={modelSize} isOpen={isProgressModalOpen} onClose={onProgressModalClose} closeOnEsc={false} closeOnOverlayClick={false}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{progInfoMeta[learnMoreProd].name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Stack spacing="5">
                <Text>{progInfoMeta[learnMoreProd].desc}</Text>
                <Stack>
                  <Text color="gray" as="b">
                    Delivered Via:
                  </Text>{" "}
                  <p>{progInfoMeta[learnMoreProd].medium}</p>
                </Stack>
                <Stack>
                  <Text color="gray" as="b">
                    Data Collected:
                  </Text>{" "}
                  <p>{progInfoMeta[learnMoreProd].data}</p>
                </Stack>
                <Stack>
                  <Text color="gray" as="b">
                    App Outcome:
                  </Text>{" "}
                  <p>{progInfoMeta[learnMoreProd].outcome}</p>
                </Stack>
                <Stack>
                  <Text color="gray" as="b">
                    Target Buyers:
                  </Text>{" "}
                  <p>{progInfoMeta[learnMoreProd].targetBuyer}</p>
                </Stack>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button size="sm" mr={3} colorScheme="teal" variant="outline" onClick={onProgressModalClose}>
                Close
              </Button>
              {progInfoMeta[learnMoreProd].canJoin === 1 && (
                <Button size="sm" colorScheme="teal" onClick={() => appendUserAddressAndRedirect(`${progInfoMeta[learnMoreProd].url}`)}>
                  Join Now
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
}
