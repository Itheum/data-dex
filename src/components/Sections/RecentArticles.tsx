import React from "react";
import { Box, Heading, Text, Link, Card, CardBody, Stack, Flex } from "@chakra-ui/react";

const RecentArticles = () => {
  return (
    <Flex flexWrap="wrap" gap={5} backgroundColor="none" justifyContent="space-between">
      <ArticleCard
        date="25 Jul, 2023"
        title="Itheum launches Data NFT technology on CanaryNet"
        description="With this significant milestone, the time has come to re-define data ownership"
        link="https://cointelegraph.com/press-releases/itheum-launches-data-nft-technology-on-canarynet-redefining-data-ownership"
        imgLink="https://images.cointelegraph.com/images/1434_aHR0cHM6Ly9zMy5jb2ludGVsZWdyYXBoLmNvbS9zdG9yYWdlL3VwbG9hZHMvdmlldy8yMzQwMTg1MzQ5Njk5M2U0ZmY5OGU0NTUwMTE0N2I3Yy5qcGc=.jpg"
      />

      <ArticleCard
        date="6 Jul, 2023"
        title="Unlocking Benefits for the Itheum Community"
        description="The Trailblazer Data NFT unites and rewards Web3 communities like never before"
        link="https://medium.com/itheum-newsletter/a-new-world-of-opportunities-unlocking-benefits-for-the-itheum-community-with-the-trailblazer-58737af13c98"
        imgLink="https://miro.medium.com/v2/resize:fit:1400/0*iWMPkFxk_pg59zlK"
      />

      <ArticleCard
        date="30 Jun, 2023"
        title="Data NFTs: Welcome to the Future of Data Ownership"
        description="Itheum embarks on a mission to revolutionize the data industry with Data NFTs"
        link="https://medium.com/itheum-newsletter/data-nfts-welcome-to-the-future-of-data-ownership-e282d9b1d537"
        imgLink="https://miro.medium.com/v2/resize:fit:1400/0*_A0C34ndwGEeGj11"
      />

      <ArticleCard
        date="23 Jun, 2023"
        title="The Data NFT Mint Whitelisting Process is Live"
        description="Apply to Mint Your Data as NFTs on Itheum’s Data NFT Marketplace"
        link="https://medium.com/itheum-newsletter/the-whitelisting-process-is-now-live-apply-to-mint-your-data-as-nfts-on-itheums-data-marketplace-799361c15099"
        imgLink="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*SDBbvXYR2CR3F7oxqeMnfQ.jpeg"
      />
    </Flex>
  );
};

function ArticleCard({ date, title, description, link, imgLink }: { date: string; title: string; description: string; link: string; imgLink: string }) {
  return (
    <Card variant="outline" backgroundColor="none" border="none" w={{ base: "265px", xl: "290px", "2xl": "315px" }}>
      <CardBody>
        <Link href={link} isExternal>
          <Box
            border="1px solid transparent"
            borderColor="#00C797"
            borderRadius="16px"
            backgroundImage={imgLink}
            backgroundSize="cover"
            backgroundRepeat="no-repeat"
            h={{ base: "140px", xl: "160px", "2xl": "160px" }}
            w={{ base: "235px", xl: "265px", "2xl": "290px" }}></Box>
        </Link>
        <Stack mt="6" spacing="2">
          <Text fontSize="sm">{date}</Text>
          <Heading size="md" fontFamily="Clash-Medium" noOfLines={2}>
            {title}
          </Heading>
          <Text fontSize="md" noOfLines={2} minH="30px">
            {description}
          </Text>
          <Link fontSize="sm" href={link} isExternal textDecoration="underline">
            Read More
          </Link>
        </Stack>
      </CardBody>
    </Card>
  );
}

export default RecentArticles;
