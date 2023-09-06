import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { notSupportedOnChain } from "libs/config";

export default function ChainSupportedComponent({ feature, children }: { feature: any; children: any }) {
  const { chainID } = useGetNetworkConfig();

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
