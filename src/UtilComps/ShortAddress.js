import React from "react";
import { Text, Tooltip } from "@chakra-ui/react";

export default function ShortAddress({ address, fontSize = "xs" }) {
  return (
    <Tooltip label="click to copy" aria-label="click to copy" fontSize="xs">
      <Text
        as={"span"}
        size={fontSize}
        onClick={() => {
          navigator.clipboard.writeText(address);
        }}
        style={{ cursor: "pointer" }}>
        {`${address.substring(0, 6)}...${address.slice(-4)}`}
      </Text>
    </Tooltip>
  );
}
