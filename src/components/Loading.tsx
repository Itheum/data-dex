import React from "react";
import { Box, Center, CircularProgress } from "@chakra-ui/react";

const ProgressBar = () => {
  return (
    <Box position="absolute" bg="#1b1b1b1" h="100vh">
      <Center h="100vh">
        <CircularProgress isIndeterminate color="green.300" />
      </Center>
    </Box>
  );
};

export default ProgressBar;
