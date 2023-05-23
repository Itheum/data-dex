import React from "react";
import { HStack, Box, Text, Tooltip } from "@chakra-ui/react";

export default function IconButton({
  disabled,
  icon,
  l1,
  l2,
  selected,
  onclickFunc
} : {
  disabled: any,
  icon: any,
  l1: any,
  l2: any,
  selected: any,
  onclickFunc: () => void,
}) {
  return (
    <HStack
      opacity={disabled && ".4"}
      fontSize="xl"
      borderWidth=".1rem"
      borderRadius="lg"
      p="3"
      w="350px"
      backgroundColor={selected && "teal"}
      cursor="pointer"
      onClick={onclickFunc || null}>
      {icon}
      <Tooltip label={disabled && "Coming soon..."}>
        <Box>
          {l1}
          <Text fontSize="sm">{l2}</Text>
        </Box>
      </Tooltip>
    </HStack>
  );
}
