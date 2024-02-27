import React, { useEffect, useState } from "react";
import { Box, Flex, Progress, Text } from "@chakra-ui/react";
import { BondContract } from "@itheum/sdk-mx-data-nft/out";
import { getLivelinessScore } from "../../libs/utils";

type LivelinessScoreProp = {
  index: number;
  tokenIdentifier: string | number;
};

export const LivelinessScore: React.FC<LivelinessScoreProp> = (props) => {
  const { index, tokenIdentifier } = props;
  const [livelinessScore, setLivelinessScore] = useState<number>(0);

  const settingLivelinessScore = async () => {
    const bondingContract = new BondContract("devnet");
    // const difDaysArray: Array<number> = [];
    try {
      if (typeof tokenIdentifier === "string") {
        const periodOfBond = await bondingContract.viewBonds([tokenIdentifier]);
        const newDate = new Date();
        const currentTimestamp = Math.floor(newDate.getTime() / 1000);
        const difDays = (currentTimestamp - periodOfBond[0].unbound_timestamp) / 86400;
        // for (let i = 0; i < periodOfBond.length; i++) {
        //   difDaysArray.push(...difDaysArray, (currentTimestamp - periodOfBond[i].unbound_timestamp) / 86400);
        // }
        // return difDaysArray;
        setLivelinessScore(Number(Math.abs(getLivelinessScore(difDays)).toFixed(2)));
      } else {
        const newDate = new Date();
        const currentTimestamp = Math.floor(newDate.getTime() / 1000);
        const difDays = (currentTimestamp - tokenIdentifier) / 86400;
        setLivelinessScore(Number(Math.abs(getLivelinessScore(difDays)).toFixed(2)));
      }
    } catch (error) {
      setLivelinessScore(-1);
    }
  };

  useEffect(() => {
    settingLivelinessScore();
  }, [livelinessScore]);

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
