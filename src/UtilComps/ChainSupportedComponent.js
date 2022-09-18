import { noChainSupport } from 'libs/util';
import { useChainMeta } from 'store/ChainMetaContext';

export default function ChainSupportedComponent({ feature, children }) {
  const { chainMeta: _chainMeta } = useChainMeta();

  if (!noChainSupport(feature, _chainMeta.networkId)) {
    return children;
  } else {
    if (children.length && children.length > 1) {
      return children;
    } else {
      // NOTE: only supports 1 child nested under parent ChainSupportedInput. e.g. <ChainSupportedInput><Comp {...props} /></ChainSupportedInput>
      return null
    }    
  }
}
