import React, { FC } from "react";
import { Text, Tooltip } from "@chakra-ui/react";
import { IAddress } from "@multiversx/sdk-core/out";

type ShortAddressProps = {
  address: IAddress;
  fontSize?: string;
};

export const ShortAddress: FC<ShortAddressProps> = (props) => {
  const { address, fontSize = 'xs'} = props;
  return (
    <Tooltip label="click to copy" aria-label="click to copy" fontSize="xs">
      <Text
        as={"span"}
        size={fontSize}
        onClick={() => {
          navigator.clipboard.writeText(address.toString());
        }}
        style={{ cursor: "pointer" }}>
        {`${address.toString().substring(0, 6)}...${address.toString().slice(-4)}`}
      </Text>
    </Tooltip>
  );
};
