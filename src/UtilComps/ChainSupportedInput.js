import React from 'react';
import { IoConstructOutline } from "react-icons/io5";
import { noChainSupport } from 'libs/util';
import { useChainMeta } from 'store/ChainMetaContext';

export default function ChainSupportedInput({feature, children}) {
  const { chainMeta: _chainMeta } = useChainMeta();

  if (!noChainSupport(feature, _chainMeta.networkId)) {
    return children;
  } else {
    if (children.length && children.length > 1) {
      return children;
    } else {
      // NOTE: only supports 1 child nested under parent ChainSupportedInput. e.g. <ChainSupportedInput><Button {...props} /></ChainSupportedInput>
      return React.cloneElement(children, {
        leftIcon: <IoConstructOutline />,
        disabled: true
      });
    }    
  }
}
