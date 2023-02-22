import React from "react";
import { Box, Flex, Skeleton, Stack } from "@chakra-ui/react";
import { dataNftMarketCardHeight } from "../libs/util";

type SkeletonLoadingListProps = {
  skeletonType?: "horizontal" | "vertical";
  items?: number;
  children?: React.ReactNode | React.ReactNode[];
};

export const SkeletonLoadingList: React.FC<SkeletonLoadingListProps> = (props) => {
  const { skeletonType = "vertical", items = 8, children } = props;
  return (
    <Flex wrap="wrap" gap="2">
      {skeletonType === "horizontal" && (
        <Stack w="14rem" h={dataNftMarketCardHeight}>
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
        </Stack>
      )}

      {skeletonType === "vertical" &&
        [...Array(items)].map((_, i) => {
          return (
            <Box key={i} maxW="xs" borderWidth="1px" borderRadius="lg" overflow="wrap" mr="1rem" mb="1rem" position="relative" w="14rem" h="38rem">
              <Skeleton h="37.3rem" m="5px">
                {children}
              </Skeleton>
            </Box>
          );
        })}
    </Flex>
  );
};
