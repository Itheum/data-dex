import React, { Fragment } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import coinTelegraph1 from "../../../assets/img/whitelist/coinTelegraph1.png";
import coinTelegraph2 from "../../../assets/img/whitelist/coinTelegraph2.png";
import coinTelegraph3 from "../../../assets/img/whitelist/coinTelegraph3.png";
import coinTelegraph4 from "../../../assets/img/whitelist/cointelegraph4.png";
import { FeaturedArticlesCards } from "./components/FeaturedArticlesCards";

const cardContent = [
  {
    id: 1,
    headerImage: coinTelegraph4,
    title: "Cointelegraph • Sep 11, 2023",
    description: "Itheum launches Data NFT technology on CanaryNet, redefining data ownership",
    url: "https://cointelegraph.com/press-releases/itheum-launches-data-nft-technology-on-canarynet-redefining-data-ownership",
  },
  {
    id: 2,
    headerImage: coinTelegraph1,
    title: "Cointelegraph • Aug 10, 2023",
    description: "How are Data NFTs helping build a decentralized data economy?",
    url: "https://cointelegraph.com/news/how-are-data-nfts-helping-build-a-decentralized-data-economy",
  },
  {
    id: 3,
    headerImage: coinTelegraph2,
    title: "Cointelegraph • Mar 28, 2023 ",
    description: "Itheum joins Cointelegraph Accelerator Program to democratize data ownership",
    url: "https://cointelegraph.com/news/itheum-joins-cointelegraph-accelerator-program-to-democratize-data-ownership",
  },
  {
    id: 4,
    headerImage: coinTelegraph3,
    title: "Cointelegraph • Jan 11, 2022",
    description: 'MultiversX-based "open metaverse" data platform Itheum lands $1.5M seed round',
    url: "https://cointelegraph.com/press-releases/elrond-based-open-metaverse-data-platform-itheum-lands-15m-seed-round",
  },
];

export const FeaturedArticles: React.FC = () => {
  return (
    <Flex flexDirection="column" w="full" h="auto" justifyContent="center" my={10}>
      <Text textAlign="center" fontSize="59px" fontFamily="Clash-Medium" my={5}>
        Featured Articles
      </Text>
      <Box display="flex" flexDirection={{ xl: "row" }} justifyContent="center" flexWrap="wrap" alignItems="center" gap={6} mx={5} mb={5}>
        {cardContent.map((item) => {
          return (
            <Fragment key={item.id}>
              <FeaturedArticlesCards id={item.id} headerImage={item.headerImage} title={item.title} description={item.description} url={item.url} />
            </Fragment>
          );
        })}
      </Box>
    </Flex>
  );
};
