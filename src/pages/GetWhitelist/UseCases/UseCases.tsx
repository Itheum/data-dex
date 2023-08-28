import React, { Fragment } from "react";
import { Box, Button, Flex, Link, Text } from "@chakra-ui/react";
import { UseCasesCards } from "./components/UseCasesCards";
import artists from "../../../assets/img/artists.png";
import buildingButton from "../../../assets/img/buildingButton.svg";
import buildings from "../../../assets/img/buildings.png";
import gamepad from "../../../assets/img/gamepad.png";
import personButton from "../../../assets/img/personButtons.svg";
import psButtons from "../../../assets/img/psButtons.svg";

const cardContent = [
  {
    id: 1,
    color: "#B233C7",
    badgeContent: "FOR GAMERS",
    isReleased: false,
    headerIcon: psButtons,
    headerText: "Revolutionizing the gaming experience",
    bodyContent:
      "Data NFTs will be applicated in redefining gameplay, strategies are shared and achievements are showcased. This can benefit game developers, players and guilds.",
    bodyImage: gamepad,
    bgGradient: "linear(to-b, #B233C71A, transparent)",
  },
  {
    id: 2,
    color: "#00C797",
    badgeContent: "FOR ENTERPRISE",
    isReleased: true,
    headerIcon: buildingButton,
    headerText: "A new era of opportunities",
    bodyContent:
      "Data enterprises gather and manage vast amounts of data, often of diverse types and from various sources. Now, with Data NFTs, they can further unlock the potential of their data assets.",
    bodyImage: buildings,
    bgGradient: "linear(to-b, #00C7971A, transparent)",
  },
  {
    id: 3,
    color: "#FF439D",
    badgeContent: "FOR CREATORS AND CONSUMERS",
    isReleased: true,
    headerIcon: personButton,
    headerText: "Unlocking new possibilities with Data NFTs",
    bodyContent:
      "Digital creators constantly produce engaging content that delights, informs and inspires their audience. Data NFTs now offer creators new avenues for monetizing their creations and enhancing audience engagement.",
    bodyImage: artists,
    bgGradient: "linear(to-b, #FF439D1A, transparent)",
  },
];

export const UseCases: React.FC = () => {
  return (
    <Flex flexDirection="column" w="full" h="auto" justifyContent="center" my={10}>
      <Text textAlign="center" fontSize="67px" fontFamily="Clash-Medium" my={5}>
        Data NFT Use Cases
      </Text>
      <Box display="flex" flexDirection={{ xl: "row" }} justifyContent="center" flexWrap="wrap" alignItems="center" gap={6} mx={5}>
        {cardContent.map((item) => {
          return (
            <Fragment key={item.id}>
              <UseCasesCards
                id={item.id}
                color={item.color}
                bgGradient={item.bgGradient}
                badgeContent={item.badgeContent}
                isReleased={item.isReleased}
                headerIcon={item.headerIcon}
                headerText={item.headerText}
                bodyContent={item.bodyContent}
                bodyImage={item.bodyImage}
              />
            </Fragment>
          );
        })}
      </Box>
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
