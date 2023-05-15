import React, { FC, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Text, Tooltip } from "@chakra-ui/react";

// const PAGE_SIZES: number[] = [8, 16, 24];

interface PropsType {
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  gotoPage: (e: number) => void;
  disabled: boolean;
  // setPageSize: (e: number) => void,
}

export const CustomPagination: FC<PropsType> = ({
  pageCount,
  pageIndex,
  pageSize,
  gotoPage,
  disabled,
  // setPageSize,
}) => {
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
    <Flex justifyContent="center" alignItems="center" mt={{ base: 0, lg: "5" }}>
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

      <Flex alignItems="center" mx={2} fontSize="sm">
        <Text flexShrink="0">
          Page{" "}
          <Text fontWeight="bold" as="span">
            {pageIndex + 1}
          </Text>{" "}
          of{" "}
          <Text fontWeight="bold" as="span">
            {pageCount}
          </Text>
        </Text>{" "}
      </Flex>

      <Flex paddingLeft={{ base: "50px", md: "0px" }} paddingRight={{ base: "10px", md: "0px" }}>
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
