import React from "react";
import { Badge, Box, Flex, Text } from "@chakra-ui/react";
import { auto } from "@popperjs/core";
import { i } from "@chakra-ui/toast/dist/toast.types-24f022fd";

interface GuardRailSectionProps {
  value?: any;
  title: string;
  acceptedTokens?: string[] | null;
  badgeColor: number;
}

const GuardRailSection: React.FC<GuardRailSectionProps> = (props) => {
  const { value, title, acceptedTokens, badgeColor } = props;
  const badgeColorsArray = ["#00C79726", "#FFFFFF26", "#0F0F0F20"];
  const badgeColorString: string = badgeColorsArray[badgeColor];
  return (
    <Flex py={2}>
      <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
        {title}:&nbsp;
        <Box overflowX={auto}>
          {acceptedTokens &&
            acceptedTokens.map((token, index) => (
              <Badge key={index} backgroundColor={badgeColorString} fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor={badgeColor === 0 ? "teal.200" : "white"} fontSize="md" fontWeight="500">
                  {token}
                </Text>
              </Badge>
            ))}
        </Box>
      </Text>
      {(value || value === 0) && (
        <Badge backgroundColor={badgeColorString} fontSize="0.8em" m={1} borderRadius="md">
          <Text as="p" px={3} py={1.5} textColor={badgeColor === 0 ? "teal.200" : "white"} fontSize="md" fontWeight="500">
            {value}
          </Text>
        </Badge>
      )}
    </Flex>
  );
};

export default GuardRailSection;
