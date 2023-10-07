import React, { useEffect, useState } from "react";
import { Button, Text, Progress, Stack, Heading, Badge, Box } from "@chakra-ui/react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { labels } from "libs/language";
import { sleep } from "libs/utils";

export type DataNFTLiveUptimeProps = {
  dataMarshal: string;
  NFTId: string;
  handleFlagAsFailed: (hasFailed: boolean) => void;
  isLiveUptimeSuccessful: boolean;
  setIsLiveUptimeSuccessful: (e: boolean) => void;
};

const DataNFTLiveUptime = (props: DataNFTLiveUptimeProps) => {
  const { chainID } = useGetNetworkConfig();
  const [liveUptimeCheckInProgress, setLiveUptimeCheckInProgress] = useState(true);
  const [liveUptimeOKMsg, setLiveUptimeOKMsg] = useState<null | string>(null);
  const [liveUptimeFAILMsg, setLiveUptimeFAILMsg] = useState<null | string>(null);

  useEffect(() => {
    (async () => {
      await sleep(3);
      checkLiveDataStreamUptime();
    })();

    return () => {
      props.handleFlagAsFailed(true);
    };
  }, []);

  async function checkLiveDataStreamUptime() {
    setLiveUptimeOKMsg(null);
    setLiveUptimeFAILMsg(null);

    props.handleFlagAsFailed(true);

    let _isLiveUptimeSuccessful = false;
    try {
      const res = await fetch(`${props.dataMarshal}/uptime?NFTId=${props.NFTId}&chainId=E${chainID}`);
      const data = await res.json();

      if (data?.response_code) {
        // only 200 HTTP codes are supported by the Data Marshal
        if (data.response_code >= 200 && data.response_code < 300) {
          setLiveUptimeOKMsg(`The live check of the Data Steam is returning an HTTP Status code ${data.response_code}, which indicates that it is available.`);

          props.handleFlagAsFailed(false);
          _isLiveUptimeSuccessful = true;
        } else {
          setLiveUptimeFAILMsg(
            `The live check of the Data Steam is returning an HTTP Status code ${data.response_code}, this means the Data Creator did not maintain the Data Stream that's wrapped within this Data NFT. Do not proceed with the transaction.`
          );
        }
      } else {
        setLiveUptimeFAILMsg(labels.ERR_PROCURE_UPTIME_CHECK_DOWN);
      }
    } catch (e) {
      setLiveUptimeFAILMsg(labels.ERR_PROCURE_UPTIME_CHECK_DOWN);
    }

    setLiveUptimeCheckInProgress(false);
    props.setIsLiveUptimeSuccessful(_isLiveUptimeSuccessful);
  }

  return (
    <Stack spacing="3" mt="10" mb="10" height="140px">
      <Heading as="h4" size="md">
        Data Stream Real-Time Availability
      </Heading>

      {(liveUptimeCheckInProgress && (
        <Box>
          <Text fontSize="lg" mb="2">
            Checking Live Uptime...
          </Text>
          <Progress colorScheme="teal" size="xs" isIndeterminate />
        </Box>
      )) || (
        <Box>
          {liveUptimeOKMsg && (
            <Text fontSize="lg">
              Data Stream is{" "}
              <Badge fontSize="1em" colorScheme="teal">
                LIVE
              </Badge>
            </Text>
          )}
          {liveUptimeFAILMsg && (
            <Text fontSize="lg">
              Data Stream is{" "}
              <Badge fontSize="1em" colorScheme="red">
                OFFLINE
              </Badge>
            </Text>
          )}
          <Text fontSize="sm">{liveUptimeOKMsg || liveUptimeFAILMsg}</Text>
          <Button
            size="sm"
            variant={"outline"}
            mt="2"
            onClick={() => {
              setLiveUptimeCheckInProgress(true);
              checkLiveDataStreamUptime();
            }}>
            {props.isLiveUptimeSuccessful ? "Check again" : "Retry"}
          </Button>
        </Box>
      )}
    </Stack>
  );
};

export default DataNFTLiveUptime;
