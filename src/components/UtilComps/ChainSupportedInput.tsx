import React from "react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useWallet } from "@solana/wallet-adapter-react";
import { IoConstructOutline } from "react-icons/io5";
import { IS_DEVNET, notSupportedOnChain } from "libs/config";
import { SolEnvEnum } from "libs/Solana/config";

///TODO maybe use this in the future for the disabled tabs in the UI (wallet , menu)
export default function ChainSupportedInput({ feature, children }: { feature: any; children: any }) {
  const { chainID: mxChainID } = useGetNetworkConfig();
  const { connected } = useWallet();
  const chainID = connected ? (IS_DEVNET ? SolEnvEnum.devnet : SolEnvEnum.mainnet) : mxChainID;

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
