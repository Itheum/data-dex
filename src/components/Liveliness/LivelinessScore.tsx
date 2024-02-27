import React, { useEffect, useState } from "react";
import { Box, Flex, Progress, Text } from "@chakra-ui/react";
import { BondContract } from "@itheum/sdk-mx-data-nft/out";
import { getLivelinessScore, settingLivelinessScore } from "../../libs/utils";

type LivelinessScoreProp = {
  index: number;
  tokenIdentifier?: string;
  unboundTimestamp?: number;
};
// not working properly
export const LivelinessScore: React.FC<LivelinessScoreProp> = (props) => {
  const { index, tokenIdentifier, unboundTimestamp } = props;
  const [livelinessScore, setLivelinessScore] = useState<number>(-1);

  useEffect(() => {
    async () => {
      const livelinessScore = await settingLivelinessScore(tokenIdentifier, unboundTimestamp);
      setLivelinessScore(livelinessScore ?? -1);
    };
  }, [tokenIdentifier, unboundTimestamp]);
  return (
    <>
      {livelinessScore === -1 ? (
        <Text fontSize="lg" fontWeight="light" display="flex" justifyContent="flex-start" pt={4} textColor="indianred">
          No liveliness score available.
        </Text>
      ) : (
        <Flex flexDirection="column">
          <Text fontSize="lg" fontWeight="light" display="flex" justifyContent="flex-start" pb="14px">
            Liveliness Score: {livelinessScore}
          </Text>
          <Box border="2px solid" borderColor="teal.200" borderRadius="sm">
            <Progress hasStripe value={livelinessScore} rounded="xs" colorScheme="teal" />
          </Box>
        </Flex>
      )}
    </>
  );
};
