import React, { Suspense } from "react";
import { Flex } from "@chakra-ui/react";
import { DataCreatorInfo } from "./components/DataCreatorInfo";
import { DataCreatorTabs } from "./components/DataCreatorTabs";
import { Spinner } from "@chakra-ui/spinner";

interface PropsType {
  tabState?: number;
}

export const Profile: React.FC<PropsType> = ({ tabState }) => {
  return (
    <Flex flexDirection="column">
      <Suspense fallback={<Spinner color="teal.200" />}>
        <DataCreatorInfo />
        <DataCreatorTabs tabState={tabState ? tabState : 1} />
      </Suspense>
    </Flex>
  );
};
