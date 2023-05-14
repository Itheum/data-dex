import React from "react";
import { Box, Heading, Image, Text, Link, Card, CardBody, Stack, SimpleGrid, useColorMode } from "@chakra-ui/react";
import { styleStrings } from "libs/utils";

const RecentArticles = () => {
  const { colorMode } = useColorMode();
  let gradientBorder = styleStrings.gradientBorderMulticolor;

  if (colorMode === "light") {
    gradientBorder = styleStrings.gradientBorderMulticolorLight;
  }

  return (
    <SimpleGrid spacing={4} templateColumns="repeat(auto-fill, minmax(300px, 1fr))">
      <Card variant="outline" backgroundColor="none" border="none">
        <CardBody>
          <Box>
            <Link href="https://itheum.medium.com/itheum-empowering-you-to-take-ownership-of-your-personal-data-fa4af7acb154" isExternal>
              <Image
                src="https://miro.medium.com/v2/resize:fit:1400/0*mjQZiUqjYGdE1W-n"
                alt="Empowering You to Take Ownership of Your Personal Data"
                border="1px solid transparent"
                borderColor="#00C797"
                borderRadius="16px"
              />
            </Link>
          </Box>
          <Stack mt="6" spacing="2">
            <Text>15 Feb, 2023</Text>
            <Heading size="md" noOfLines={2}>
              Empowering You to Take Ownership of Your Personal Data
            </Heading>
            <Text noOfLines={2}>
              In today’s digital age, personal data has become a commodity that’s worth big bucks. From joining websites and apps to making online purchases and
              using wearables, we constantly exchange our private information for the goods and services offered by businesses.
            </Text>
            <Link
              href="https://itheum.medium.com/itheum-empowering-you-to-take-ownership-of-your-personal-data-fa4af7acb154"
              isExternal
              textDecoration="underline">
              Read More
            </Link>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outline" backgroundColor="none" border="none">
        <CardBody>
          <Box>
            <Link href="https://itheum.medium.com/navigating-the-data-exchange-market-centralized-vs-decentralized-brokers-683659f6ce27" isExternal>
              <Image
                src="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*ZyFc3wfmZZCK96j2YgK4Sw.jpeg"
                alt="Navigating the Data Exchange Market: Centralized vs Decentralized Brokers"
                border="1px solid transparent"
                borderColor="#00C797"
                borderRadius="16px"
              />
            </Link>
          </Box>
          <Stack mt="6" spacing="2">
            <Text>21 Jan, 2023</Text>
            <Heading size="md" noOfLines={2}>
              Navigating the Data Exchange Market: Centralized vs Decentralized Brokers
            </Heading>
            <Text noOfLines={2}>
              Data is a valuable resource in today’s digital age and its exchange is crucial for the growth and development of various industries. The data
              exchange market has two main approaches: centralized and decentralized.
            </Text>
            <Link
              href="https://itheum.medium.com/navigating-the-data-exchange-market-centralized-vs-decentralized-brokers-683659f6ce27"
              isExternal
              textDecoration="underline">
              Read More
            </Link>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outline" backgroundColor="none" border="none">
        <CardBody>
          <Box>
            <Link href="https://itheum.medium.com/the-story-behind-your-data-b6e0f6a88d97" isExternal>
              <Image
                src="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*356yG4BEf67VFeADo3NMzw.jpeg"
                alt="The Story Behind Your Data"
                border="1px solid transparent"
                borderColor="#00C797"
                borderRadius="16px"
              />
            </Link>
          </Box>
          <Stack mt="6" spacing="2">
            <Text>13 Jan, 2023</Text>
            <Heading size="md" noOfLines={2}>
              The Story Behind Your Data
            </Heading>
            <Text noOfLines={2}>
              Big Data has become a vital aspect of the 21st century, with the rise of GAFAM (Google, Apple, Facebook, Amazon, and Microsoft) raising important
              concerns regarding privacy.
            </Text>
            <Link href="https://itheum.medium.com/the-story-behind-your-data-b6e0f6a88d97" isExternal textDecoration="underline">
              Read More
            </Link>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="outline" backgroundColor="none" border="none">
        <CardBody>
          <Box>
            <Link href="https://itheum.medium.com/problems-with-data-privacy-in-the-web2-world-and-solutions-with-the-advent-of-web3-c51b27b2d064" isExternal>
              <Image
                src="https://miro.medium.com/v2/resize:fit:1400/0*yfJztNyWCkOzOBKt"
                alt="Problems with Data Privacy in the Web 2.0"
                border="1px solid transparent"
                borderColor="#00C797"
                borderRadius="16px"
              />
            </Link>
          </Box>
          <Stack mt="6" spacing="2">
            <Text>23 Dec, 2022</Text>
            <Heading size="md" noOfLines={2}>
              Problems with Data Privacy in the Web 2.0
            </Heading>
            <Text noOfLines={2}>
              Data privacy is a major concern for Web2 Users. Let’s delve into Web2 and examine challenges with data privacy, data trade, and data collection.
            </Text>
            <Link
              href="https://itheum.medium.com/problems-with-data-privacy-in-the-web2-world-and-solutions-with-the-advent-of-web3-c51b27b2d064"
              isExternal
              textDecoration="underline">
              Read More
            </Link>
          </Stack>
        </CardBody>
      </Card>
    </SimpleGrid>
  );
};

export default RecentArticles;
