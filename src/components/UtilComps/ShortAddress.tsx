import React from "react";
import { Text, Tooltip, useToast } from "@chakra-ui/react";

export default function ShortAddress({
  address,
  fontSize = "xs",
  marginLeftSet = "auto",
  tooltipLabel,
  isCopyAddress,
}: {
  address?: string;
  fontSize?: string;
  marginLeftSet?: string;
  tooltipLabel?: string;
  isCopyAddress?: boolean;
}) {
  const toast = useToast();
  const internalAddress = address || "";
  return (
    <Tooltip label={tooltipLabel} aria-label={tooltipLabel} fontSize={fontSize}>
      {isCopyAddress ? (
        <Text
          ml={marginLeftSet}
          as={"span"}
          fontSize={fontSize}
          onClick={() => {
            navigator.clipboard.writeText(internalAddress);

            toast({
              title: "Address is copied to clipboard",
              status: "success",
              isClosable: true,
            });
          }}
          style={{ cursor: "pointer" }}>
          {`${internalAddress.substring(0, 6)}...${internalAddress.slice(-4)}`}
        </Text>
      ) : (
        <Text ml={marginLeftSet} as={"span"} fontSize={fontSize} style={{ cursor: "pointer" }}>
          {`${internalAddress.substring(0, 6)}...${internalAddress.slice(-4)}`}
        </Text>
      )}
    </Tooltip>
  );
}
