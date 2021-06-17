import {Text, Tooltip} from '@chakra-ui/react';

export default function ShortAddress({address}) {
  return (
    <Tooltip label={address} aria-label={address}>
      <Text fontSize="sm">...{address.slice(-6)}</Text>
    </Tooltip>
  );
}
