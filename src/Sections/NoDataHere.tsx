import React from "react";
import { Text, Flex, Icon } from "@chakra-ui/react";
import { FaAngellist } from "react-icons/fa";

export const NoDataHere = () => {
  return (
    <Flex direction={"column"} justify={"center"} align={"center"} minW={"full"}>
      <Text marginTop={"6"}>Nothing here yet...</Text>
      <Icon as={FaAngellist} boxSize={"10"} marginTop={"3"} />
    </Flex>
  );
};
