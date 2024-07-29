import React, { useEffect, useState } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Box, Flex, Progress, Text, Link } from "@chakra-ui/react";
import { settingLivelinessScore } from "../../libs/utils";

type LivelinessScoreProp = {
  tokenIdentifier?: string;
  unbondTimestamp?: number;
  lockPeriod?: number;
};

export const LivelinessScore: React.FC<LivelinessScoreProp> = (props) => {
  const { tokenIdentifier, unbondTimestamp, lockPeriod } = props;
  const [livelinessScore, setLivelinessScore] = useState<number>(-1);

  useEffect(() => {
    (async () => {
      const livelinessScore = await settingLivelinessScore(tokenIdentifier, unbondTimestamp, lockPeriod);
      setLivelinessScore(livelinessScore ?? -2);
    })();
  }, [tokenIdentifier, unbondTimestamp]);

  return (
    <Box w={"100%"}>
      {livelinessScore === -1 ? (
        <Flex flexDirection="column">
          <Text fontSize="lg" fontWeight="light" display="flex" justifyContent="flex-start" pt={2} pb={1} textColor="teal.200">
            Liveliness Score Loading
          </Text>
          <Box border="1px solid" borderColor="teal.200" borderRadius="sm">
            <Progress hasStripe isIndeterminate value={0} rounded="xs" colorScheme="teal.200" />
          </Box>
        </Flex>
      ) : (
        <>
          {livelinessScore === -2 ? (
            <Flex flexDirection="column">
              <Text fontSize="lg" fontWeight="light" display="flex" justifyContent="flex-start" pt={2} pb={1} textColor="indianred">
                <Link
                  fontSize="md"
                  href="https://docs.itheum.io/product-docs/protocol/itheum-life-liveliness-and-reputation-signalling/data-creator-bonding/liveliness-score-states#liveliness-score-unavailable"
                  isExternal>
                  Liveliness Score Unavailable <ExternalLinkIcon mx="2px" />
                </Link>
              </Text>
              <Box border="1px solid" borderColor="indianred" borderRadius="sm">
                <Progress hasStripe value={0} rounded="xs" colorScheme="red" />
              </Box>
            </Flex>
          ) : livelinessScore !== 0 ? (
            <Flex flexDirection="column">
              <Link
                fontSize="md"
                href="https://docs.itheum.io/product-docs/protocol/itheum-life-liveliness-and-reputation-signalling/data-creator-bonding/liveliness-score-states#active-liveliness-score"
                isExternal>
                <Text fontSize="md" fontWeight="light" display="flex" justifyContent="flex-start" pb="14px">
                  Liveliness Score: {livelinessScore} <ExternalLinkIcon mx="2px" />
                </Text>
              </Link>
              <Box border="1px solid" borderColor="teal.200" borderRadius="sm">
                <Progress hasStripe value={livelinessScore} rounded="xs" colorScheme="teal" />
              </Box>
            </Flex>
          ) : (
            <Flex flexDirection="column">
              <Text fontSize="lg" fontWeight="light" display="flex" justifyContent="flex-start" pt={2} pb={1} textColor="indianred">
                <Link
                  fontSize="md"
                  href="https://docs.itheum.io/product-docs/protocol/itheum-life-liveliness-and-reputation-signalling/data-creator-bonding/liveliness-score-states#liveliness-score-expired"
                  isExternal>
                  Liveliness Score Expired <ExternalLinkIcon mx="2px" />
                </Link>
              </Text>
              <Box border="1px solid" borderColor="indianred" borderRadius="sm">
                <Progress hasStripe isIndeterminate value={livelinessScore} rounded="xs" colorScheme="red" />
              </Box>
            </Flex>
          )}
        </>
      )}
    </Box>
  );
};
