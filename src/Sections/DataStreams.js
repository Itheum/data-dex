import React from "react";
import { Badge, Box, Button, Center, Flex, Heading, HStack, Image, Link, Stack, StackDivider } from "@chakra-ui/react";
import dataStreamIcon from "img/data-stream-icon.png";

export default function () {
  return (
    <Stack spacing={5}>
      <Flex align="top" spacing={10}>
        <Box maxW="sm" borderWidth="1px" p="10" m="auto" borderRadius="lg" w="90%" maxWidth="initial">
          <Center flexDirection="column">
            <Heading size="lg">
              Data Streams{" "}
              <Badge variant="outline" colorScheme="teal">
                Coming Soon
              </Badge>
            </Heading>
            <Image src={dataStreamIcon} boxSize="150px" m={5} borderRadius="md" />
            <HStack
              divider={<StackDivider borderColor="gray.200" />}
              spacing={4}
              alignItems="baseline"
              flexDirection={["column", "initial"]}>
              <Box fontSize="sm" align="center" flex="1">
                Let buyers subscribe to &quot;personal data streams&quot;- unlike the one-off datasets, data streams
                will continue to feed data as new data is generated
              </Box>
              <Box fontSize="sm" align="center" flex="1">
                Streams are a more powerful way for buyers to subscribe to longitudinal datasets that grow over time.
                For e.g. health and wellness data like physical activity, sleep quality, blood pressure or financial
                activity like spend habits etc.
              </Box>
              <Box fontSize="sm" align="center" flex="1">
                When paired with context rich data from your &quot;data vault&quot;- Steams become a valuable and steady
                source of passive income for you in exchange for your personal data
              </Box>
            </HStack>
            <Link mt="10" href="https://dev.to/itheum/itheum-data-dex-whitepaper-ooo#data-streams-1" isExternal>
              <Button size="xs" colorScheme="teal" variant="outline">
                Read about Data Streams in our Whitepaper
              </Button>
            </Link>
          </Center>
        </Box>
      </Flex>
    </Stack>
  );
}
