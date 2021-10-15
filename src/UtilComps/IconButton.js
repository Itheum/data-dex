import { HStack, Box, Text } from '@chakra-ui/react';

export default function IconButton({icon, l1, l2, selected, onclickFunc}) {
  return <HStack 
    fontSize="xl" borderWidth=".1rem" borderRadius="lg" p="3"
    w="350px" backgroundColor={selected && "teal"} cursor="pointer"
    onClick={onclickFunc}>
    {icon}
    <Box>
      {l1}
      <Text fontSize="sm">{l2}</Text>
    </Box>
  </HStack>;
}
