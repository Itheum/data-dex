import React from "react";
import { Text, Flex, Icon } from "@chakra-ui/react";
import { FaEyeSlash } from "react-icons/fa";

export const NoDataHere = ({ imgFromTop = "10rem", customMsg = "Nothing here yet..." }: { imgFromTop?: string; customMsg?: string }) => {
  return (
    <Flex direction={"column"} justify={"center"} align={"center"} minW={"full"} opacity=".5">
      <Text marginTop={imgFromTop}>{customMsg !== "" ? customMsg : "Nothing here yet..."}</Text>
      <Icon as={FaEyeSlash} boxSize={"10"} marginTop={"3"} />
    </Flex>
  );
};
