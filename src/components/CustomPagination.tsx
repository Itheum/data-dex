import React, { FC, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Box, Flex, IconButton, Tooltip } from "@chakra-ui/react";

interface PropsType {
  pageCount: number;
  pageIndex: number;
  gotoPage: (e: number) => void;
  disabled: boolean;
}

export const CustomPagination: FC<PropsType> = ({ pageCount, pageIndex, gotoPage, disabled }) => {
  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex < pageCount - 1;
  const [isInThrottle, setIsInThrottle] = useState(false);
  const previousPage = () => {
    if (canPreviousPage) {
      gotoPage(pageIndex - 1);
    }
  };
  const nextPage = () => {
    if (canNextPage) {
      gotoPage(pageIndex + 1);
    }
  };

  return (
    <Flex justifyContent="center" alignItems="center" gap={3} py={2}>
      <Flex>
        <Tooltip label="First Page">
          <IconButton
            colorScheme="teal"
            size="sm"
            aria-label="First Page"
            onClick={() => {
              gotoPage(0);
              setIsInThrottle(true);
              setTimeout(() => {
                setIsInThrottle(false);
              }, 2000);
            }}
            isDisabled={!canPreviousPage || isInThrottle || disabled}
            icon={<ArrowLeftIcon h={3} w={3} />}
            mr={2}
          />
        </Tooltip>
        <Tooltip label="Previous Page">
          <IconButton
            colorScheme="teal"
            size="sm"
            aria-label="Previous Page"
            onClick={() => {
              previousPage();
              setIsInThrottle(true);
              setTimeout(() => {
                setIsInThrottle(false);
              }, 2000);
            }}
            isDisabled={!canPreviousPage || isInThrottle || disabled}
            icon={<ChevronLeftIcon h={6} w={6} />}
          />
        </Tooltip>
      </Flex>

      <Flex alignItems="center" mx={2} fontSize="sm" w={{ base: "5rem", lg: "auto" }}>
        <Box flexShrink="0">
          Page{" "}
          <Box fontWeight="bold" as="span">
            {pageIndex + 1}
          </Box>{" "}
          of{" "}
          <Box fontWeight="bold" as="span">
            {pageCount}
          </Box>
        </Box>{" "}
      </Flex>

      <Flex>
        <Tooltip label="Next Page">
          <IconButton
            colorScheme="teal"
            size="sm"
            aria-label="Next Page"
            onClick={() => {
              nextPage();
              setIsInThrottle(true);
              setTimeout(() => {
                setIsInThrottle(false);
              }, 2000);
            }}
            isDisabled={!canNextPage || isInThrottle || disabled}
            icon={<ChevronRightIcon h={6} w={6} />}
          />
        </Tooltip>
        <Tooltip label="Last Page">
          <IconButton
            colorScheme="teal"
            size="sm"
            aria-label="Last Page"
            onClick={() => {
              gotoPage(pageCount - 1);
              setIsInThrottle(true);
              setTimeout(() => {
                setIsInThrottle(false);
              }, 2000);
            }}
            isDisabled={!canNextPage || isInThrottle || disabled}
            icon={<ArrowRightIcon h={3} w={3} />}
            ml={2}
          />
        </Tooltip>
      </Flex>
    </Flex>
  );
};
