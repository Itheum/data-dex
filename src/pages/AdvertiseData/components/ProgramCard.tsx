import React, { Dispatch, SetStateAction } from "react";
import { Badge, Box, Button, Image, Text, useColorMode } from "@chakra-ui/react";

interface ProgramCardProps {
  item: Record<any, any>;
  setIsDrawerOpen: Dispatch<SetStateAction<boolean>>;
  setPrefilledData: (item: any) => void;
  isDrawerOpen: boolean;
  isNew: boolean;
}

const ProgramCard: React.FC<ProgramCardProps> = (props) => {
  const { item, setPrefilledData, setIsDrawerOpen, isDrawerOpen, isNew } = props;
  const { colorMode } = useColorMode();

  return (
    <Box maxW="xs" overflow="hidden" mt={5} border=".01rem solid transparent" borderColor="#00C79740" borderRadius="0.75rem">
      <Image src={`https://itheum-static.s3-ap-southeast-2.amazonaws.com/dex-${item.additionalInformation?.img}.png`} alt="" rounded="lg" />

      <Box p="6">
        <Box display="flex" alignItems="baseline">
          {isNew && (
            <Badge borderRadius="sm" px="2" py="0.08rem" colorScheme="teal" mr="2">
              New
            </Badge>
          )}
          <Box mt="1" fontWeight="semibold" as="h4" lineHeight="tight" noOfLines={1}>
            {item.additionalInformation?.programName}
          </Box>
        </Box>
        <Button
          mt="3"
          colorScheme="teal"
          variant="outline"
          borderRadius="xl"
          onClick={() => {
            setIsDrawerOpen(!isDrawerOpen);
            setPrefilledData(item);
          }}>
          <Text color={colorMode === "dark" ? "white" : "black"}>Mint Data NFT</Text>
        </Button>
      </Box>
    </Box>
  );
};

export default ProgramCard;
