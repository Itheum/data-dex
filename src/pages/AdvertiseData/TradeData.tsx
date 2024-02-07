import React, { useState } from "react";
import { Badge, Box, Button, Heading, Image, Stack, Text, useColorMode, Wrap } from "@chakra-ui/react";
import { TradeFormModal } from "./components/TradeFormModal";
import { dataCATDemoUserData } from "../../libs/config";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";

export const TradeData: React.FC = () => {
  const [dataCATAcccount] = useState<Record<any, any>>(dataCATDemoUserData);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [prefilledData, setPrefilledData] = useState(null);
  const { colorMode } = useColorMode();
  const { chainID } = useGetNetworkConfig();

  return (
    <Stack mt={10} mx={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }}>
      <Heading size="xl" fontFamily="Clash-Medium">
        Mint Data
      </Heading>
      <Heading size="1rem" opacity=".7" fontFamily="Satoshi-Medium" fontWeight="light">
        Connect, mint and trade your datasets as Data NFTs in our Data NFT Marketplace
      </Heading>
      <Wrap shouldWrapChildren={true} spacing={5} display={"flex"} justifyContent={{ base: "center", md: "start" }} overflow={"unset"}>
        <Box maxW="xs" overflow="hidden" mt={5} border=".01rem solid transparent" borderColor="#00C79740" borderRadius="0.75rem">
          <Image src="https://itheum-static.s3.ap-southeast-2.amazonaws.com/data-stream.png" alt="" rounded="lg" />

          <Box p="6">
            <Box display="flex" alignItems="baseline">
              <Box mt="1" fontWeight="semibold" as="h4" lineHeight="tight" noOfLines={1}>
                Any Data Stream as Data NFT-FT
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
              <Text color={colorMode === "dark" ? "white" : "black"}>Advertise Data</Text>
            </Button>
          </Box>
        </Box>
      </Wrap>
      {dataCATAcccount?.programsAllocation?.filter((program: any) => program.chainID === chainID).length > 0 && (
        <>
          <Heading size="lg" fontFamily="Clash-Medium" marginTop="6rem !important">
            Supported Data CAT Programs
          </Heading>
          <Wrap shouldWrapChildren={true} spacingX={5} mt="25px !important" marginBottom="8 !important">
            {dataCATAcccount?.programsAllocation
              .filter((program: any) => program.chainID === chainID)
              .map((item: any) => (
                <Box key={item.program} maxW="22.4rem" borderWidth="1px" overflow="hidden" border=".1rem solid transparent" backgroundColor="none">
                  <Image
                    src={`https://itheum-static.s3-ap-southeast-2.amazonaws.com/dex-${item.additionalInformation?.img}.png`}
                    alt=""
                    height="13.375rem"
                    width={{ base: "auto", md: "355px" }}
                    border="1px solid transparent"
                    borderColor="#00C797"
                    borderRadius="16px"
                  />

                  <Box paddingTop="6" paddingBottom="2">
                    <Box display="flex" alignItems="center">
                      <Badge borderRadius="sm" px="2" py="0.08rem" colorScheme="teal">
                        {" "}
                        New
                      </Badge>
                      <Box ml="2" fontWeight="semibold" fontFamily="Clash-Medium" fontSize="2xl" noOfLines={1}>
                        {item.additionalInformation?.programName}
                      </Box>
                    </Box>
                    <Button
                      mt="2"
                      colorScheme="teal"
                      variant="outline"
                      borderRadius="xl"
                      onClick={() => {
                        setIsDrawerOpen(!isDrawerOpen);
                        setPrefilledData(item);
                      }}>
                      <Text color={colorMode === "dark" ? "white" : "black"}>Trade Program Data</Text>
                    </Button>
                  </Box>
                </Box>
              ))}
          </Wrap>
        </>
      )}
      <TradeFormModal isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen} dataToPrefill={prefilledData} />;
    </Stack>
  );
};
