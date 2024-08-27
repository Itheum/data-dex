import React from "react";
import { Tooltip } from "@chakra-ui/react";

type ImageTooltipProps = {
  description: string;
  children: React.ReactNode;
};

export const ImageTooltip: React.FC<ImageTooltipProps> = (props) => {
  const { description, children } = props;

  return (
    <Tooltip label={description} fontSize="md">
      <span>{children}</span>
    </Tooltip>
  );
};
