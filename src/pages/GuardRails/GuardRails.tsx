import React, { useEffect, useState } from "react";
import { Flex, Heading } from "@chakra-ui/react";
import { guardRailsInfo } from "../../libs/config";
import { GuardRailsCards } from "./components/guardRailsCards";

export const GuardRails: React.FC = () => {
  const { activeGuardrails: active, historicGuardrails: historic, upcomingGuardrails: upcoming } = guardRailsInfo;
  const [activeGuardrails, setActiveGuardrails] = useState<typeof guardRailsInfo.activeGuardrails>(guardRailsInfo.activeGuardrails);
  const [historicGuardrails, setHistoricGuardrails] = useState<typeof guardRailsInfo.historicGuardrails>(guardRailsInfo.historicGuardrails);
  const [upcomingGuardrails, setUpcomingGuardrails] = useState<typeof guardRailsInfo.upcomingGuardrails>(guardRailsInfo.upcomingGuardrails);

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
        <GuardRailsCards item={activeGuardrails} title="Active Guardrails" badgeColor="teal.200" />
        <GuardRailsCards item={historicGuardrails} title="History Guardrails" badgeColor="red.200" />
        <GuardRailsCards item={upcomingGuardrails} title="Upcoming Guardrails" badgeColor="gray.400" />
      </Flex>
    </Flex>
  );
};
