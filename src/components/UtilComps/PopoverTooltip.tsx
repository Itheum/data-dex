import React from "react";
import { Popover, PopoverTrigger, Text, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverBody, PopoverHeader, useColorMode } from "@chakra-ui/react";

type PopoverTooltipProps = {
  title: string;
  children: React.ReactNode;
  bodyWidthInPX?: string;
};

export const PopoverTooltip: React.FC<PopoverTooltipProps> = (props) => {
  const { title, children, bodyWidthInPX } = props;
  const { colorMode } = useColorMode();

  return (
    <Popover>
      <PopoverTrigger>
        <Text as="span" fontSize="md" opacity=".5" cursor="pointer">
          {`>`} Tell Me More
        </Text>
      </PopoverTrigger>
      <PopoverContent width={bodyWidthInPX || "300px"} color={colorMode === "dark" ? "bgWhite" : "#181818"}>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>{title}</PopoverHeader>
        <PopoverBody>{children}</PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
