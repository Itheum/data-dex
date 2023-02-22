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
    <Flex wrap="wrap" gap="3">
      {skeletonType === "horizontal" && (
        <Stack w="15.5rem" h="40rem">
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
        </Stack>
      )}

      {skeletonType === "vertical" &&
        [...Array(items)].map((_, i) => {
          return (
            <Box key={i} maxW="xs" borderWidth="1px" borderRadius="lg" overflow="hidden" mb="1rem" position="relative" w="13.5rem">
              <Skeleton h="39.3rem" m="5px">
                {children}
              </Skeleton>
            </Box>
          );
        })}
    </Flex>
  );
};
