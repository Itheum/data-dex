import React, { useState } from "react";
import { Box, Button, Heading, Image, Stack, useDisclosure, SimpleGrid } from "@chakra-ui/react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import imgProgGaPa from "assets/img/prog-gaming-passport.png";
import imgProgGaPaES from "assets/img/prog-gaming.jpg";
import imgProgRhc from "assets/img/prog-rhc.png";
import imgProgWfh from "assets/img/prog-wfh.png";
import { progInfoMeta } from "libs/config";
import LearnMoreModal from "./LearnMoreModal";
import PSPassportModal from "./PSPassportModal";

type Props = {
  setMenuItem: any;
};

export default function AppMarketplace(props: Props) {
  const { chainID } = useGetNetworkConfig();
  const [learnMoreProd, setLearnMoreProg] = useState<keyof typeof progInfoMeta>("rhc");
  const { isOpen: isProgressModalOpen, onOpen: onProgressModalOpen, onClose: onProgressModalClose } = useDisclosure();

  const { isOpen: isPS4ModalOpen, onOpen: onPS4ModalOpen, onClose: onPS4ModalClose } = useDisclosure();

  const handleLearnMoreProg = (progCode: any) => {
    setLearnMoreProg(progCode);
    onProgressModalOpen();
  };

  const handleJoinPS4Passport = () => {
    onPS4ModalOpen();
  };

  return (
    <>
      <Stack pt="5">
        <Heading size="lg" fontFamily="Clash-Medium" fontWeight="semibold" mb="15px">
          App Marketplace
        </Heading>
        <SimpleGrid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }} spacing={4}>
          <Box overflow="hidden" backgroundColor="none">
            <Image src={imgProgGaPa} height="160px" w="full" border="1px solid transparent" borderColor="#00C797" borderRadius="16px" />
            <Box p="3">
              <Box display="flex" alignItems="baseline">
                <Box mt="1" mr="1" as="h4" noOfLines={1}>
                  PlayStation Gamer Passport
                </Box>
              </Box>
              <Button size="sm" mt="3" mr="3" colorScheme="teal" variant="outline" onClick={() => handleLearnMoreProg("gdc")}>
                Learn More
              </Button>
              {chainID === "D" && (
                <Button size="sm" mt="3" colorScheme="teal" onClick={() => handleJoinPS4Passport()}>
                  Join Now
                </Button>
              )}
            </Box>
          </Box>

          <Box overflow="hidden" backgroundColor="none">
            <Image src={imgProgGaPaES} height="160px" w="full" border="1px solid transparent" borderColor="#00C797" borderRadius="16px" />
            <Box p="3">
              <Box display="flex" alignItems="baseline">
                <Box mt="1" mr="1" fontWeight="semibold" as="h4" lineHeight="tight" noOfLines={1}>
                  ESports Gamer Passport
                </Box>
              </Box>
              <Button size="sm" mt="3" mr="3" colorScheme="teal" variant="outline" onClick={() => handleLearnMoreProg("gpes")}>
                Learn More
              </Button>
            </Box>
          </Box>

          <Box overflow="hidden" backgroundColor="none">
            <Image src={imgProgRhc} height="160px" w="full" border="1px solid transparent" borderColor="#00C797" borderRadius="16px" />

            <Box p="3">
              <Box display="flex" alignItems="baseline">
                <Box mt="1" mr="1" fontWeight="semibold" as="h4" lineHeight="tight" noOfLines={1}>
                  Red Heart Challenge
                </Box>
              </Box>
              <Button size="sm" mt="3" mr="3" colorScheme="teal" variant="outline" onClick={() => handleLearnMoreProg("rhc")}>
                Learn More
              </Button>
            </Box>
          </Box>

          <Box overflow="hidden" backgroundColor="none">
            <Image src={imgProgWfh} height="160px" w="full" border="1px solid transparent" borderColor="#00C797" borderRadius="16px" />

            <Box p="3">
              <Box display="flex" alignItems="baseline">
                <Box mt="1" mr="1" fontWeight="semibold" as="h4" lineHeight="tight" noOfLines={1}>
                  Strava Fitness
                </Box>
              </Box>
              <Button size="sm" mt="3" mr="3" colorScheme="teal" variant="outline" onClick={() => handleLearnMoreProg("wfa")}>
                Learn More
              </Button>
            </Box>
          </Box>
        </SimpleGrid>
      </Stack>

      <LearnMoreModal isOpen={isProgressModalOpen} onClose={onProgressModalClose} learnMoreProd={learnMoreProd} />
      <PSPassportModal isOpen={isPS4ModalOpen} onClose={onPS4ModalClose} setMenuItem={props.setMenuItem} />
    </>
  );
}
