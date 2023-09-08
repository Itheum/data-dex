import React from "react";
import { Box, Heading, Text, Link, Card, CardBody, Stack, SimpleGrid, Flex } from "@chakra-ui/react";
import explainerArticleBG from "assets/img/explainer-article-bg.jpeg";

const ExplainerArticles = ({ skipSpacing }: { skipSpacing?: boolean }) => {
  return (
    <Flex flexWrap="wrap" gap={5}>
      <ArticleCard
        imgTitle="How to Purchase a Data NFT"
        title="Simple Step-by-Step Guide to Owning Data NFTs"
        link="https://docs.itheum.io/product-docs/product/data-nft-marketplace/purchasing-a-data-nft"
      />

      <ArticleCard
        imgTitle="How to List a Data NFT for Trading"
        title="Quick Guide to Listing Your Data NFTs for Trading"
        link="https://docs.itheum.io/product-docs/product/data-nft-marketplace/listing-a-data-nft"
      />

      <ArticleCard
        imgTitle="The Trailblazer Data NFT"
        title="Comprehensive User Guide to Trailblazer Data NFTs"
        link="https://docs.itheum.io/product-docs/guides/trailblazer-guide"
      />

      <ArticleCard
        imgTitle="Setting Up Your Wallets"
        title="Simple Step-by-Step Guide to Setting Up Your Wallets for Access"
        link="https://docs.itheum.io/product-docs/guides/supported-wallets"
      />
    </Flex>
  );
};

function ArticleCard({ imgTitle, title, link }: { imgTitle: string; title: string; link: string }) {
  return (
    <Card variant="outline" backgroundColor="none" border="none" w="393px">
      <CardBody>
        <Box>
          <Link href={link} isExternal>
            <Box position="relative">
              <Box
                border="1px solid transparent"
                borderColor="#00C797"
                borderRadius="16px"
                backgroundImage={explainerArticleBG}
                backgroundSize="cover"
                backgroundRepeat="no-repeat"
                backgroundPosition={{ base: "0 -8px", xl: "0 -2px", "2xl": "0 -5px" }}
                h="195px"
                w="393px"></Box>
              <Text position="absolute" top="20px" left="25px" fontSize="1rem" width="128px" color="bgWhite">
                {imgTitle}
              </Text>
            </Box>
          </Link>
        </Box>
        <Stack mt="3" spacing="2">
          <Link fontSize="sm" href={link} isExternal textDecoration="none">
            <Heading size="md" fontFamily="Clash-Medium" noOfLines={2} minH="43px">
              {title}
            </Heading>
          </Link>
        </Stack>
      </CardBody>
    </Card>
  );
}

export default ExplainerArticles;
