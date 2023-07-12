import React from "react";
import { Flex, Heading } from "@chakra-ui/react";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { DataCreatorInfo } from "./components/DataCreatorInfo";
import { DataCreatorTabs } from "./components/DataCreatorTabs";

export const Profile: React.FC = () => {
  return (
    <Flex flexDirection="column">
      <DataCreatorInfo />
      <DataCreatorTabs />
    </Flex>
  );
};
