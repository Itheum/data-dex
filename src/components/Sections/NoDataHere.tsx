import React from "react";
import { Text, Flex, Icon } from "@chakra-ui/react";
import { RiCloudOffFill } from "react-icons/ri";

export const NoDataHere = () => {
  return (
    <Flex direction={"column"} justify={"center"} align={"center"} minW={"full"}>
      <Text marginTop={"6"}>Nothing here yet...</Text>
      <Icon as={RiCloudOffFill} boxSize={"10"} marginTop={"3"} />
    </Flex>
  );
};
