import React from "react";
import { Popover, PopoverTrigger, Text, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverBody, PopoverHeader, useColorMode } from "@chakra-ui/react";

type PopoverTooltipProps = {
  title: string;
  children: React.ReactNode;
};

export const PopoverTooltip: React.FC<PopoverTooltipProps> = (props) => {
  const { title, children } = props;
  const { colorMode } = useColorMode();

  return (
    <Popover>
      <PopoverTrigger>
        <Text as="span" fontSize="sm" opacity=".5" cursor="pointer">
          {`>`} What is this?
        </Text>
      </PopoverTrigger>
      <PopoverContent color={colorMode === "dark" ? "bgWhite" : "#181818"}>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>{title}</PopoverHeader>
        <PopoverBody>{children}</PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
