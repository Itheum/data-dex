import React from "react";
import { Box, Flex, Skeleton, Stack } from "@chakra-ui/react";

type SkeletonLoadingListProps = {
  skeletonType?: "horizontal" | "vertical";
  items?: number;
  children?: React.ReactNode | React.ReactNode[];
};

export const SkeletonLoadingList: React.FC<SkeletonLoadingListProps> = (props) => {
  const { skeletonType = "vertical", items = 10, children } = props;
  return (
    <Flex wrap="wrap" gap="2">
      {skeletonType === "horizontal" && (
        <Stack w="14rem" h="38rem">
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
        </Stack>
      )}

      {skeletonType === "vertical" &&
        [...Array(items)].map((_, i) => {
          return (
            <Box key={i} maxW="xs" borderWidth="1px" borderRadius="lg" overflow="hidden" mb="1rem" mr="1rem" position="relative" w="14rem" h="41.9rem">
              <Skeleton h="98.4%" m="5px" borderRadius="lg">
                {children}
              </Skeleton>
            </Box>
          );
        })}
    </Flex>
  );
};
