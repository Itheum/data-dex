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
    <Flex wrap="wrap" gap="1" justifyContent={"center"}>
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
            <Box key={i} maxW="xs" borderWidth="1px" borderRadius="lg" overflow="hidden" mb="1rem" mx="0.4rem" position="relative" w="13.3rem" h="41.9rem">
              <Stack h="98.4%" justifyContent="center" pt={5} mx={2}>
                <Skeleton h="30%"></Skeleton>
                <Skeleton h="68.4%"></Skeleton>
              </Stack>
              {/*{children}*/}
            </Box>
          );
        })}
    </Flex>
  );
};
