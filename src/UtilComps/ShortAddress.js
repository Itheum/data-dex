import React from "react";
import { Text, Tooltip } from "@chakra-ui/react";

export default function ShortAddress({ address, fontSize = "xs" }) {
  const internalAddress = address || "";
  return (
    <Tooltip label="click to copy" aria-label="click to copy" fontSize={fontSize}>
      <Text
        as={"span"}
        fontSize={fontSize}
        onClick={() => {
          navigator.clipboard.writeText(internalAddress);
        }}
        style={{ cursor: "pointer" }}>
        {`${internalAddress.substring(0, 6)}...${internalAddress.slice(-4)}`}
      </Text>
    </Tooltip>
  );
}
