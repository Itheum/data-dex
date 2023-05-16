import React, { useEffect, useState } from "react";
import { Badge, Box, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { guardRailsInfo } from "../../libs/config";

export const GuardRails: React.FC = () => {
  const { activeGuardrails: active, historicGuardrails: historic, upcomingGuardrails: upcoming } = guardRailsInfo;
  const [activeGuardrails, setActiveGuardrails] = useState<typeof guardRailsInfo.activeGuardrails>();
  const [historicGuardrails, setHistoricGuardrails] = useState<typeof guardRailsInfo.historicGuardrails>();
  const [upcomingGuardrails, setUpcomingGuardrails] = useState<typeof guardRailsInfo.upcomingGuardrails>();

  useEffect(() => {
    setActiveGuardrails(active);
    setHistoricGuardrails(historic);
    setUpcomingGuardrails(upcoming);
  }, [activeGuardrails, historicGuardrails, upcomingGuardrails]);

  return (
    <Flex as="div" flexDirection="column" mt={10} mx={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }}>
      <Heading size="xl" fontWeight="medium">
        Guard Rails
      </Heading>
      <Flex gap={4} w="full" justifyContent="space-between" mt={5}>
        <Box border="1px solid transparent" borderColor="#00C79750" borderRadius="16px" p={5}>
          <Text as="h2" px={10} fontWeight="500" fontSize="xl">
            Active Guardrails
          </Text>
          <Stack mt={5}>
            <Text as="div" pl={3} fontSize="lg">
              Buyer fee:&nbsp;
              <Badge color="teal.200" fontSize="0.8em">
                {activeGuardrails?.buyer_fee ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Seller fee:&nbsp;
              <Badge color="teal.200" fontSize="0.8em">
                {activeGuardrails?.seller_fee ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Seller fee:&nbsp;
              <Badge color="teal.200" fontSize="0.8em">
                {activeGuardrails?.percentage_cut_from_seller ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Seller fee:&nbsp;
              <Badge color="teal.200" fontSize="0.8em">
                {activeGuardrails?.percentage_cut_from_buyer ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Seller fee:&nbsp;
              <Badge color="teal.200" fontSize="0.8em">
                {activeGuardrails?.discount_fee_percentage_seller ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Seller fee:&nbsp;
              <Badge color="teal.200" fontSize="0.8em">
                {activeGuardrails?.discount_fee_percentage_buyer ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Seller fee:&nbsp;
              <Badge color="teal.200" fontSize="0.8em">
                {activeGuardrails?.maximum_payment_fees ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Seller fee:&nbsp;
              <Badge color="teal.200" fontSize="0.8em">
                {activeGuardrails?.accepted_payments ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Seller fee:&nbsp;
              <Badge color="teal.200" fontSize="0.8em">
                {activeGuardrails?.accepted_tokens ?? "-"}
              </Badge>
            </Text>
          </Stack>
        </Box>
        <Box border="1px solid transparent" borderColor="#00C79750" borderRadius="16px" p={5}>
          <Text as="h2" px={10} fontWeight="500" fontSize="xl">
            History Guardrails
          </Text>
          <Stack mt={5}>
            <Text as="div" pl={3} fontSize="lg">
              Buyer fee:&nbsp;
              {historicGuardrails?.buyer_fee.map((bf, index) => {
                return (
                  <Badge color="red.200" fontSize="0.8em" key={index} mx={1}>
                    {bf ?? "-"}
                  </Badge>
                );
              })}
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Seller fee:&nbsp;
              <Badge color="red.200" fontSize="0.8em">
                {historicGuardrails?.seller_fee ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Seller fee:&nbsp;
              <Badge color="red.200" fontSize="0.8em">
                {historicGuardrails?.percentage_cut_from_seller ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Seller fee:&nbsp;
              <Badge color="red.200" fontSize="0.8em">
                {historicGuardrails?.percentage_cut_from_buyer ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Seller fee:&nbsp;
              <Badge color="red.200" fontSize="0.8em">
                {historicGuardrails?.discount_fee_percentage_seller ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Seller fee:&nbsp;
              <Badge color="red.200" fontSize="0.8em">
                {historicGuardrails?.discount_fee_percentage_buyer ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Seller fee:&nbsp;
              <Badge color="red.200" fontSize="0.8em">
                {historicGuardrails?.maximum_payment_fees ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Seller fee:&nbsp;
              <Badge color="red.200" fontSize="0.8em">
                {historicGuardrails?.accepted_payments ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Seller fee:&nbsp;
              <Badge color="red.200" fontSize="0.8em">
                {historicGuardrails?.accepted_tokens ?? "-"}
              </Badge>
            </Text>
          </Stack>
        </Box>{" "}
        <Box border="1px solid transparent" borderColor="#00C79750" borderRadius="16px" p={5}>
          <Text as="h2" px={10} fontWeight="500" fontSize="xl">
            Upcoming Guardrails
          </Text>
          <Stack mt={5}>
            <Text as="div" pl={3} fontSize="lg">
              Buyer fee:&nbsp;
              <Badge color="gray.400" fontSize="0.8em">
                {upcomingGuardrails?.buyer_fee ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Seller fee:&nbsp;
              <Badge color="gray.400" fontSize="0.8em">
                {upcomingGuardrails?.seller_fee ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Seller fee:&nbsp;
              <Badge color="gray.400" fontSize="0.8em">
                {upcomingGuardrails?.percentage_cut_from_seller ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Seller fee:&nbsp;
              <Badge color="gray.400" fontSize="0.8em">
                {upcomingGuardrails?.percentage_cut_from_buyer ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Seller fee:&nbsp;
              <Badge color="gray.400" fontSize="0.8em">
                {upcomingGuardrails?.discount_fee_percentage_seller ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Seller fee:&nbsp;
              <Badge color="gray.400" fontSize="0.8em">
                {upcomingGuardrails?.discount_fee_percentage_buyer ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Seller fee:&nbsp;
              <Badge color="gray.400" fontSize="0.8em">
                {upcomingGuardrails?.maximum_payment_fees ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Seller fee:&nbsp;
              <Badge color="gray.400" fontSize="0.8em">
                {upcomingGuardrails?.accepted_payments ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Seller fee:&nbsp;
              <Badge color="gray.400" fontSize="0.8em">
                {upcomingGuardrails?.accepted_tokens ?? "-"}
              </Badge>
            </Text>
          </Stack>
        </Box>
      </Flex>
    </Flex>
  );
};
