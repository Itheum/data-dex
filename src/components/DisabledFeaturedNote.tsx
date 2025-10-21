import { Box } from "@chakra-ui/react";
import { DISABLE_POST_AITHRA_SUNSET_FEATURES } from "libs/config";

export const DisabledFeaturedNote = () => {
  if (!DISABLE_POST_AITHRA_SUNSET_FEATURES) {
    return null;
  }

  return (
    <Box fontSize="sm" mt="1 !important" bg="orange.500" p={2} rounded="md" color="white">
      This feature is disabled due to the EOS upgrade. See banner on top of the page.
    </Box>
  );
};
