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
    <Box maxW="22.4rem" borderWidth="1px" overflow="hidden" border=".1rem solid transparent" backgroundColor="none">
      <Image
        src={`https://itheum-static.s3-ap-southeast-2.amazonaws.com/dex-${item.additionalInformation?.img}.png`}
        alt=""
        height="13.375rem"
        width={{ base: "auto", md: "355px" }}
        border="1px solid transparent"
        borderColor="#00C797"
        borderRadius="16px"
      />

      <Box paddingTop="6" paddingBottom="2">
        <Box display="flex" alignItems="center">
          {isNew && (
            <Badge borderRadius="sm" px="2" py="0.08rem" colorScheme="teal">
              New
            </Badge>
          )}
          <Box ml="2" fontWeight="semibold" fontFamily="Clash-Medium" fontSize="2xl" noOfLines={1}>
            {item.additionalInformation?.programName}
          </Box>
        </Box>
        <Button
          mt="2"
          colorScheme="teal"
          variant="outline"
          borderRadius="xl"
          onClick={() => {
            setIsDrawerOpen(!isDrawerOpen);
            setPrefilledData(item);
          }}>
          <Text color={colorMode === "dark" ? "white" : "black"}>Create Data</Text>
        </Button>
      </Box>
    </Box>
  );
};

export default ProgramCard;
