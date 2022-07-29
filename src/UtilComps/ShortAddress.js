import { Text, Tooltip } from '@chakra-ui/react';

export default function ShortAddress({address, fontSize = 'xs'}) {
  return (
    <Tooltip label="click to copy" aria-label="click to copy" fontSize="xs">
      <Text fontSize={fontSize} 
        onClick={() => {navigator.clipboard.writeText(address);}} style={{cursor: 'pointer'}}>
          {`${address.substring(0, 6)}...${address.slice(-4)}`}
      </Text>
    </Tooltip>
  );
}
