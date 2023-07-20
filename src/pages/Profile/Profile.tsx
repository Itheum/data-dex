import React from "react";
import { Flex } from "@chakra-ui/react";
import { DataCreatorInfo } from "./components/DataCreatorInfo";
import { DataCreatorTabs } from "./components/DataCreatorTabs";

interface PropsType {
  tabState?: number;
}

export const Profile: React.FC<PropsType> = ({ tabState }) => {
  return (
    <Flex flexDirection="column">
      <DataCreatorInfo />
      <DataCreatorTabs tabState={tabState ? tabState : 1} />
    </Flex>
  );
};
