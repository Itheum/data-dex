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
  Wrap,
} from "@chakra-ui/react";
import imgProgGaPa from "img/prog-gaming.jpg";
import imgProgRhc from "img/prog-rhc.png";
import imgProgWfh from "img/prog-wfh.png";
import { CHAIN_TOKEN_SYMBOL, progInfoMeta } from "libs/util";
import { useChainMeta } from "store/ChainMetaContext";
import { useUser } from "store/UserContext";

export default function AppMarketplace() {
  const { chainMeta: _chainMeta } = useChainMeta();
  const { user: _user } = useUser();
  const [learnMoreProd, setLearnMoreProg] = useState(null);
  const { isOpen: isProgressModalOpen, onOpen: onProgressModalOpen, onClose: onProgressModalClose } = useDisclosure();

  const handleLearnMoreProg = (progCode) => {
    setLearnMoreProg(progCode);
    onProgressModalOpen();
  };

  const appendUserAddressAndRedirect = (link) => {
    let updatedLink = link;

    if (_user?.loggedInAddress) {
      updatedLink = `${updatedLink}?ddexref=${window.btoa(`addr=${_user.loggedInAddress}`)}`;
    }

    window.open(updatedLink);
  };

  const modelSize = useBreakpointValue({ base: "xs", md: "xl" });

  return (
    <>
      <Stack pt="5" h="360px">
        <Heading size="md">App Marketplace</Heading>
        <Text fontSize="md">Join a community built app and earn {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)} when you trade your data</Text>
        <Wrap shouldWrapChildren={true} wrap="wrap" spacing={5}>
          <Box maxW="container.sm" borderWidth="1px" borderRadius="lg" overflow="hidden" width="300px">
            <Image src={imgProgGaPa} />

            <Box p="3">
              <Box display="flex" alignItems="baseline">
                <Box mt="1" mr="1" fontWeight="semibold" as="h4" lineHeight="tight" noOfLines={1}>
                  Gamer Passport
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

          <Box maxW="container.sm" borderWidth="1px" borderRadius="lg" overflow="hidden" width="300px">
            <Image src={imgProgRhc} />

            <Box p="3">
              <Box display="flex" alignItems="baseline">
                <Box mt="1" mr="1" fontWeight="semibold" as="h4" lineHeight="tight" noOfLines={1}>
                  Red Heart Challenge
                </Box>
                <Badge borderRadius="full" px="2" colorScheme="teal">
                  {" "}
                  Coming Soon
                </Badge>
              </Box>
              <Button size="sm" mt="3" mr="3" colorScheme="teal" variant="outline" onClick={() => handleLearnMoreProg("rhc")}>
                Learn More
              </Button>
              <Button size="sm" mt="3" colorScheme="teal" onClick={() => appendUserAddressAndRedirect("https://itheum.com/redheartchallenge")}>
                Join Now
              </Button>
            </Box>
          </Box>

          <Box maxW="container.sm" borderWidth="1px" borderRadius="lg" overflow="hidden" width="300px">
            <Image src={imgProgWfh} />

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
              <Button size="sm" disabled={true} mt="3" colorScheme="teal" onClick={() => window.open("")}>
                Join Now
              </Button>
            </Box>
          </Box>
        </Wrap>
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
              <Button
                disabled={!progInfoMeta[learnMoreProd].canJoin}
                size="sm"
                colorScheme="teal"
                onClick={() => appendUserAddressAndRedirect(`${progInfoMeta[learnMoreProd].url}`)}>
                Join Now
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
}
