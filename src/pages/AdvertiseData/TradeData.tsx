import React, { useState } from "react";
import { Box, Button, Heading, Image, Stack, Text, useColorMode, Wrap } from "@chakra-ui/react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import NewCreatorCTA from "components/NewCreatorCTA";
import ProgramCard from "./components/ProgramCard";
import { TradeFormModal } from "./components/TradeFormModal";
import { dataCATDemoUserData } from "../../libs/config";

export const TradeData: React.FC = () => {
  const [dataCATAcccount] = useState<Record<any, any>>(dataCATDemoUserData);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [prefilledData, setPrefilledData] = useState(null);
  const { colorMode } = useColorMode();
  const { chainID } = useGetNetworkConfig();

  return (
    <Stack mt={10} mx={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }}>
      <Heading size="xl" fontFamily="Clash-Medium">
        Mint Data NFTs
      </Heading>
      <Heading size="1rem" opacity=".7" fontFamily="Satoshi-Medium" fontWeight="light">
        Mint your Data Streams or Data Assets as Data NFTs and list and trade them in the peer-to-peer Data NFT Marketplace.
      </Heading>
      <Wrap shouldWrapChildren={true} spacing={5} display={"flex"} justifyContent={{ base: "center", md: "start" }} overflow={"unset"}>
        <Box maxW="xs" overflow="hidden" mt={5} border=".01rem solid transparent" borderColor="#00C79740" borderRadius="0.75rem">
          <Image src="https://itheum-static.s3.ap-southeast-2.amazonaws.com/data-stream.png" alt="" rounded="lg" />

          <Box p="6">
            <Box display="flex" alignItems="baseline">
              <Box mt="1" fontWeight="semibold" as="h4" lineHeight="tight" noOfLines={1}>
                Any Data Stream as a Data NFT-FT
              </Box>
            </Box>
            <Button
              mt="3"
              colorScheme="teal"
              variant="outline"
              borderRadius="xl"
              onClick={() => {
                setIsDrawerOpen(!isDrawerOpen);
                setPrefilledData(null);
              }}>
              <Text color={colorMode === "dark" ? "white" : "black"}>Mint Data NFT</Text>
            </Button>
          </Box>
        </Box>
      </Wrap>
      <Box marginTop={10} bgGradient={colorMode === "light" ? "bgWhite" : "linear(to-b, bgDark, #6B46C160, #00C79730)"}>
        <NewCreatorCTA />
      </Box>
      {dataCATAcccount?.programsAllocation?.filter((program: any) => program.chainID === chainID).length > 0 && (
        <>
          <Heading size="lg" fontFamily="Clash-Medium" marginTop="6rem !important">
            Supported Data CAT Programs
          </Heading>
          <Wrap shouldWrapChildren={true} spacingX={5} mt="25px !important" marginBottom="8 !important">
            {dataCATAcccount?.programsAllocation.map((item: any) => (
              <ProgramCard
                key={item.program}
                item={item}
                setIsDrawerOpen={setIsDrawerOpen}
                setPrefilledData={setPrefilledData}
                isDrawerOpen={isDrawerOpen}
                isNew={true}
              />
            ))}
          </Wrap>
        </>
      )}
      <TradeFormModal isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen} dataToPrefill={prefilledData} />;
    </Stack>
  );
};
