import React from "react";
import { Text, Flex, Icon } from "@chakra-ui/react";
import { FaEyeSlash } from "react-icons/fa";

export const NoDataHere = ({ imgFromTop = "10rem" } : { imgFromTop? : string }) => {
  return (
    <Flex direction={"column"} justify={"center"} align={"center"} minW={"full"} opacity=".5">
      <Text marginTop={imgFromTop}>Nothing here yet...</Text>
      <Icon as={FaEyeSlash} boxSize={"10"} marginTop={"3"} />
    </Flex>
  );
};
