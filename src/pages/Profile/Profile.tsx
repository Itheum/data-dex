import React from "react";
import { Flex } from "@chakra-ui/react";
import { DataCreatorInfo } from "./components/DataCreatorInfo";
import { DataCreatorTabs } from "./components/DataCreatorTabs";

export const Profile: React.FC = () => {
  return (
    <Flex flexDirection="column">
      <DataCreatorInfo />
      <DataCreatorTabs tabState={1} />
    </Flex>
  );
};
