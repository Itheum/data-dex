import React from "react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { IoConstructOutline } from "react-icons/io5";
import { notSupportedOnChain } from "libs/config";

export default function ChainSupportedInput({ feature, children }: { feature: any; children: any }) {
  const {
    network: { chainId: chainID },
  } = useGetNetworkConfig();

  if (notSupportedOnChain(feature, chainID)) {
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
