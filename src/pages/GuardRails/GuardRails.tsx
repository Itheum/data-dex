import React, { useEffect, useState } from "react";
import { Badge, Box, Flex, Heading, Stack, Tag, TagLabel, TagLeftIcon, Text } from "@chakra-ui/react";
import { guardRailsInfo, whitelistWallets } from "../../libs/config";
import { GuardRailsCards } from "./components/guardRailsCards";
import { useMarketStore } from "../../store";
import { FaWallet } from "react-icons/fa";
import ShortAddress from "../../components/UtilComps/ShortAddress";

export const GuardRails: React.FC = () => {
  const { historicGuardrails: historic, upcomingGuardrails: upcoming } = guardRailsInfo;
  const [historicGuardrails, setHistoricGuardrails] = useState<typeof guardRailsInfo.historicGuardrails>(guardRailsInfo.historicGuardrails);
  const [upcomingGuardrails, setUpcomingGuardrails] = useState<typeof guardRailsInfo.upcomingGuardrails>(guardRailsInfo.upcomingGuardrails);
  const [whitelistedAddress, setWhitelistedAddress] = useState<React.ReactNode>();

  const marketRequirements = useMarketStore((state) => state.marketRequirements);

  useEffect(() => {
    setHistoricGuardrails(historic);
    setUpcomingGuardrails(upcoming);
  }, [historicGuardrails, upcomingGuardrails]);

  useEffect(() => {
    const whitelistMap = (
      <>
        {whitelistWallets.map((wl, index) => {
          return (
            <Tag key={index} size="lg" variant="subtle" colorScheme="cyan" m={1.5} maxW="200px">
              <TagLeftIcon boxSize="12px" as={FaWallet} />
              <TagLabel>
                <ShortAddress address={wl} />
              </TagLabel>
            </Tag>
          );
        })}
      </>
    );
    setWhitelistedAddress(whitelistMap);
  }, []);

  return (
    <Flex as="div" flexDirection="column" mt={10} mx={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }}>
      <Heading size="xl" fontWeight="medium">
        Guard Rails
      </Heading>
      <Flex gap={4} w="full" justifyContent="space-between" mt={5} flexWrap="wrap">
        <Box border="1px solid transparent" borderColor="#00C79750" borderRadius="22px" p={5} maxWidth="22rem">
          <Text as="h2" px={10} fontWeight="500" fontSize="xl">
            Active Guardrails
          </Text>
          <Stack mt={5}>
            <Text as="div" pl={3} fontSize="lg">
              Buyer fee:&nbsp;
              {marketRequirements?.buyer_fee ? (
                <Badge color="teal.200" fontSize="0.8em" mx={1}>
                  {marketRequirements?.buyer_fee ?? "-"}
                </Badge>
              ) : (
                "-"
              )}
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Seller fee:&nbsp;
              <Badge color="teal.200" fontSize="0.8em">
                {marketRequirements?.seller_fee ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              % cut from seller:&nbsp;
              <Badge color="teal.200" fontSize="0.8em">
                {marketRequirements?.percentage_cut_from_seller ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              % cut from buyer:&nbsp;
              <Badge color="teal.200" fontSize="0.8em">
                {marketRequirements?.percentage_cut_from_buyer ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Discount fee % seller:&nbsp;
              <Badge color="teal.200" fontSize="0.8em">
                {marketRequirements?.discount_fee_percentage_seller ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Discount fee % buyer:&nbsp;
              <Badge color="teal.200" fontSize="0.8em">
                {marketRequirements?.discount_fee_percentage_buyer ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Accepted payments:&nbsp;
              <Badge color="teal.200" fontSize="0.8em">
                {marketRequirements?.accepted_payments ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Accepted tokens:&nbsp;
              <Badge color="teal.200" fontSize="0.8em">
                {marketRequirements?.accepted_tokens ?? "-"}
              </Badge>
            </Text>
          </Stack>
        </Box>
        <GuardRailsCards item={historicGuardrails} title="History Guardrails" badgeColor="red.200" />
        <GuardRailsCards item={upcomingGuardrails} title="Upcoming Guardrails" badgeColor="gray.400" />
      </Flex>
      <Box border="1px solid transparent" borderColor="#00C79750" borderRadius="15px" my={5} w="full">
        <Heading size="lg" fontWeight="medium" py={3} pl={3}>
          Whitelisted addresses
        </Heading>
        <Flex flexWrap="wrap" mx="7" mb="5">
          {whitelistedAddress}
        </Flex>
      </Box>
    </Flex>
  );
};
