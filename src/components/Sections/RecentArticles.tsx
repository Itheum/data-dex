import React from "react";
import { Box, Heading, Text, Link, Card, CardBody, Stack, Flex } from "@chakra-ui/react";

const RecentArticles = () => {
  return (
    <Flex flexWrap="wrap" gap={5} backgroundColor="none" justifyContent="space-between">
      <ArticleCard
        title="Data Ownership Redefined: An Introduction to Itheum"
        link="https://cointelegraph.com/sponsored/itheum-data-ownership-redefined"
        imgLink="https://images.cointelegraph.com/cdn-cgi/image/format=auto,onerror=redirect,quality=90,width=740/https://s3.cointelegraph.com/storage/uploads/view/52859d1f0670871bbf6d67b13a28a6f9.jpg"
      />

      <ArticleCard
        title="Music NFTs can reshape the indie music industry"
        link="https://cointelegraph.com/news/music-nfts-can-reshape-the-indie-music-industry-heres-how"
        imgLink="https://images.cointelegraph.com/cdn-cgi/image/format=auto,onerror=redirect,quality=90,width=717/https://s3.cointelegraph.com/storage/uploads/view/3cb896c44fb3ff74551693bd59726f2e.jpg"
      />

      <ArticleCard
        title="Data NFT platform launches XP system"
        link="https://cointelegraph.com/news/data-nft-platform-enhances-security-and-user-participation-with-xp-system"
        imgLink="https://images.cointelegraph.com/cdn-cgi/image/format=auto,onerror=redirect,quality=90,width=717/https://s3.cointelegraph.com/storage/uploads/view/681678727d24c2719165d24eb35a9d02.jpg"
      />

      <ArticleCard
        title="Itheum's role in transparent data trading"
        link="https://cointelegraph.com/news/empowering-users-blockchains-role-in-secure-and-transparent-data-trading"
        imgLink="https://images.cointelegraph.com/cdn-cgi/image/format=auto,onerror=redirect,quality=90,width=717/https://s3.cointelegraph.com/storage/uploads/view/b4e76914189c7ee2e183fbf61a9dfa9e.jpg"
      />

      <ArticleCard
        title="Itheum Joins Sony X Astar Network Web3 Program"
        link="https://medium.com/itheum-newsletter/empowering-data-ownership-itheum-joins-sony-x-astar-network-web3-incubation-program-to-4768bb4fcba1"
        imgLink="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*GlYf8bagyXMdA_5Bp1Aa_Q.jpeg"
      />

      <ArticleCard
        title="Itheum launches Data NFT technology on CanaryNet"
        link="https://cointelegraph.com/press-releases/itheum-launches-data-nft-technology-on-canarynet-redefining-data-ownership"
        imgLink="https://miro.medium.com/v2/resize:fit:1400/format:webp/0*RAPWUjwCcQfp8--C"
      />

      <ArticleCard
        title="How are Data NFTs helping build a data economy?"
        link="https://cointelegraph.com/news/how-are-data-nfts-helping-build-a-decentralized-data-economy"
        imgLink="https://images.cointelegraph.com/cdn-cgi/image/format=auto,onerror=redirect,quality=90,width=717/https://s3.cointelegraph.com/storage/uploads/view/b5be16069e046fac6b2af170cd41e789.jpg"
      />

      <ArticleCard
        title="Data NFTs: Welcome to the Future of Data Ownership"
        link="https://medium.com/itheum-newsletter/data-nfts-welcome-to-the-future-of-data-ownership-e282d9b1d537"
        imgLink="https://miro.medium.com/v2/resize:fit:1400/0*_A0C34ndwGEeGj11"
      />
    </Flex>
  );
};

function ArticleCard({ date, title, description, link, imgLink }: { date?: string; title: string; description?: string; link: string; imgLink: string }) {
  return (
    <Card variant="outline" backgroundColor="none" border="none" w={{ base: "265px", lg: "390px", xl: "290px", "2xl": "315px" }} margin="auto">
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
          {date && <Text fontSize="sm">{date}</Text>}
          <Heading size="md" fontFamily="Clash-Medium" noOfLines={2}>
            {title}
          </Heading>
          {description && (
            <Text fontSize="md" noOfLines={2} minH="30px">
              {description}
            </Text>
          )}
          <Link fontSize="sm" href={link} isExternal textDecoration="underline">
            Read More
          </Link>
        </Stack>
      </CardBody>
    </Card>
  );
}

export default RecentArticles;
