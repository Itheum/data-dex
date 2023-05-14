import { notSupportedOnChain } from "libs/utils";
import { useChainMeta } from "store/ChainMetaContext";

export default function ChainSupportedComponent({ feature, children }) {
  const { chainMeta: _chainMeta } = useChainMeta();

  if (notSupportedOnChain(feature, _chainMeta.networkId)) {
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
