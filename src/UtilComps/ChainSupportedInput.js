import React from 'react';
import { IoConstructOutline } from 'react-icons/io5';
import { notSupportedOnChain } from 'libs/util';
import { useChainMeta } from 'store/ChainMetaContext';
import { isDisabled } from '@chakra-ui/utils';

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
        isDisabled: true
      });

    } 
  } else {   

    return children;
  }
}
