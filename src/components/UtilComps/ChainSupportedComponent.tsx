import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useWallet } from "@solana/wallet-adapter-react";
import { IS_DEVNET, notSupportedOnChain } from "libs/config";
import { SolEnvEnum } from "libs/Solana/config";

export default function ChainSupportedComponent({ feature, children }: { feature: any; children: any }) {
  const { chainID: mxChainID } = useGetNetworkConfig();
  const { connected } = useWallet();
  const chainID = connected ? (IS_DEVNET ? SolEnvEnum.devnet : SolEnvEnum.mainnet) : mxChainID;
  if (notSupportedOnChain(feature, chainID)) {
    if (children.length && children.length > 1) {
      return children;
    } else {
      // NOTE: only supports 1 child nested under parent ChainSupportedInput. e.g. <ChainSupportedInput><Comp {...props} /></ChainSupportedInput>
      return null;
    }
  } else {
    return children;
  }
}
