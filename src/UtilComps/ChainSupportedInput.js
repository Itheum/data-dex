import React from "react";
import { isDisabled } from "@chakra-ui/utils";
import { IoConstructOutline } from "react-icons/io5";
import { notSupportedOnChain } from "libs/util";
import { useChainMeta } from "store/ChainMetaContext";

export default function ChainSupportedInput({ feature, children }) {
  const { chainMeta: _chainMeta } = useChainMeta();

  if (notSupportedOnChain(feature, _chainMeta.networkId)) {
    if (children.length && children.length > 1) {
      return children;
    } else {
      // NOTE: only supports 1 child nested under parent ChainSupportedInput. e.g. <ChainSupportedInput><Button {...props} /></ChainSupportedInput>
      return React.cloneElement(children, {
        leftIcon: <IoConstructOutline />,
        disabled: true,
        isDisabled: true,
        variant: "outline",
        _disabled: {
          ...children.props._disabled,
          cursor: "not-allowed",
          opacity: 0.6,
        },
      });
    }
  } else {
    return children;
  }
}
