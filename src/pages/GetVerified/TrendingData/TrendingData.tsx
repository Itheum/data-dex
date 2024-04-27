import React, { Fragment } from "react";
import { Box, Flex, Text, useColorMode } from "@chakra-ui/react";
import bubbleImage from "assets/img/whitelist/BubbleImage.png";
import infographicsImage from "assets/img/whitelist/InfographicsImage.png";
import nftunesImage from "assets/img/whitelist/NFTuneApp.png";
import timecapsuleImage from "assets/img/whitelist/TimeCapsuleApp.png";
import trailblazerImage from "assets/img/whitelist/TrailblazerImage.png";
import bobberRoomImage from "assets/img/whitelist/BobberRoom.png";
import bitzxpImage from "assets/img/whitelist/BitzXP.png";
import { TrendingDataCards } from "./components/TrendingDataCards";

const cardContent = [
  {
    id: 1,
    headerImage: bitzxpImage,
    title: "Itheum <BiTz> XP System",
    description: "Consider yourself a Itheum OG and data ownership pioneer? Open this app to get <BiTz> points, <BiTz> points are like Data Ownership OG XP.",
    url: "https://explorer.itheum.io/getbitz",
  },
  {
    id: 2,
    headerImage: bobberRoomImage,
    title: "Bober Game Room",
    description: "A meme game built into a Data NFT! Annoying memes are flooding the forest! Use your trusty water cannon to blast them away!",
    url: "https://explorer.itheum.io/bobergameroom",
  },
  {
    id: 3,
    headerImage: nftunesImage,
    title: "NF-Tunes",
    description: "Empowering Indie musicians to engage with a fresh fan community and discover alternative avenues for music distribution",
    url: "https://explorer.itheum.io/nftunes",
  },
  {
    id: 4,
    headerImage: infographicsImage,
    title: "MultiversX Infographics",
    description:
      'This app visualizes dynamic and evolving data streams rendered into PDF files that showcase unique MultiversX ecosystem "alpha", insights, and education.',
    url: "https://explorer.itheum.io/multiversx-infographics",
  },
  {
    id: 5,
    headerImage: bubbleImage,
    title: "MultiversX ESDT Bubbles",
    description:
      "ESDT is the native token standard of the MultiversX blockchain. This app visualizes the dynamic data stream of various ESDT token insights as bubble graphs.",
    url: "https://explorer.itheum.io/multiversx-bubbles",
  },
  {
    id: 6,
    headerImage: trailblazerImage,
    title: "Trailblazer",
    description: "Hardcore community members unlock Project Alpha by owning their favorite project's TrailBlazer Data NFTs.",
    url: "https://explorer.itheum.io/project-trailblazer",
  },
  {
    id: 7,
    headerImage: timecapsuleImage,
    title: "Time Capsule",
    description: "Capture, archive, and relive historic social media events through media, preserving memories for future generations.",
    url: "https://explorer.itheum.io/timecapsule",
  },
];
export const TrendingData: React.FC = () => {
  const { colorMode } = useColorMode();
  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      w="100%"
      height="auto"
      bgGradient={colorMode === "light" ? "bgWhite" : "linear(to-r, bgDark, #6B46C160, #00C79730)"}
      bgSize="contain"
      bgPosition="bottom"
      bgRepeat="no-repeat"
      position="relative"
      p={2}>
      <Box display="flex" justifyContent="center">
        <Text textAlign="center" fontSize={{ base: "40px", md: "59px" }} fontFamily="Clash-Medium" my={5} w="690px">
          Explore Trending Data NFT Collections
        </Text>
      </Box>
      <Box display="flex" flexDirection={{ xl: "row" }} justifyContent="center" flexWrap="wrap" alignItems="center" gap={6} mx={5} mb={5}>
        {cardContent.map((item) => {
          return (
            <Fragment key={item.id}>
              <TrendingDataCards id={item.id} headerImage={item.headerImage} title={item.title} description={item.description} url={item.url} />
            </Fragment>
          );
        })}
      </Box>
    </Flex>
  );
};
