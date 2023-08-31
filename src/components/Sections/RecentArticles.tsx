import React from "react";
import { Box, Heading, Text, Link, Card, CardBody, Stack, Flex } from "@chakra-ui/react";

const RecentArticles = () => {
  return (
    <Flex flexWrap="wrap" gap={5}>
      <ArticleCard
        date="25 Jul, 2023"
        title="The Itheum Trailblazer Competition is Live"
        description="Get ready to embark on an adventure into understanding the power of Data NFTs"
        link="https://medium.com/itheum-newsletter/itheums-first-data-nft-distribution-has-commenced-the-journey-into-the-trailblazer-begins-8e3567a2d1d0"
        imgLink="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*NbncSWqY8Kx518Ee3H4SMQ.jpeg"
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
    <Card variant="outline" backgroundColor="none" border="none" w="393px">
      <CardBody>
        <Link href={link} isExternal>
          <Box
            border="1px solid transparent"
            borderColor="#00C797"
            borderRadius="16px"
            backgroundImage={imgLink}
            backgroundSize="cover"
            backgroundRepeat="no-repeat"></Box>
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
