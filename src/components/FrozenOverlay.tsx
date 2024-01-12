import React from "react";
import { Box, Text } from "@chakra-ui/layout";

type FrozenOverlayPropType = {
  isVisible: boolean | undefined;
};

export default function FrozenOverlay(props: FrozenOverlayPropType) {
  const { isVisible } = props;
  return (
    <Box
      position="absolute"
      top="0"
      bottom="0"
      left="0"
      right="0"
      height="100%"
      width="100%"
      backgroundColor="blackAlpha.800"
      rounded="lg"
      visibility={isVisible ? "visible" : "collapse"}
      backdropFilter="auto"
      backdropBlur="6px">
      <Box fontSize="24px" fontWeight="500" lineHeight="38px" position="absolute" top="45%" textAlign="center" textColor="teal.200" px="2">
        - FROZEN -{" "}
        <Text fontSize="16px" fontWeight="400" textColor="white" lineHeight="25px" px={3}>
          Data NFT is under investigation by the DAO as there was a complaint received against it
        </Text>
      </Box>
    </Box>
  );
}
