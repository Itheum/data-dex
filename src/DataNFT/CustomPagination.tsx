import React, { FC } from 'react';
import { Flex } from '@chakra-ui/layout';
import { IconButton, Tooltip, Text, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, Select, NumberDecrementStepper } from '@chakra-ui/react';
import { ArrowLeftIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

// const PAGE_SIZES: number[] = [8, 16, 24];

interface PropsType {
  pageCount: number,
  pageIndex: number,
  pageSize: number,
  gotoPage: (e: number) => void,
  // setPageSize: (e: number) => void,
}

export const CustomPagination: FC<PropsType> = ({
  pageCount,
  pageIndex,
  pageSize,
  gotoPage,
  // setPageSize,
}) => {
  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex < pageCount - 1;
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

  return (<>
    <Flex justifyContent='space-between' m={4} alignItems='center'>
        <Flex>
          <Tooltip label='First Page'>
            <IconButton
              colorScheme="teal"
              size='sm'
              aria-label='First Page'
              onClick={() => gotoPage(0)}
              isDisabled={!canPreviousPage}
              icon={<ArrowLeftIcon h={3} w={3} />}
              mr={2}
            />
          </Tooltip>
          <Tooltip label='Previous Page'>
            <IconButton
              colorScheme="teal"
              size='sm'
              aria-label='Previous Page'
              onClick={previousPage}
              isDisabled={!canPreviousPage}
              icon={<ChevronLeftIcon h={6} w={6} />}
            />
          </Tooltip>
        </Flex>

        <Flex alignItems='center' mx={2} fontSize='sm'>
          <Text flexShrink='0'>
            Page{' '}
            <Text fontWeight='bold' as='span'>
              {pageIndex + 1}
            </Text>{' '}
            of{' '}
            <Text fontWeight='bold' as='span'>
              {pageCount}
            </Text>
          </Text>
          {' '}
          {/* <NumberInput
            colorScheme="teal"
            size='sm'
            ml={2}
            mr={2}
            w={20}
            min={1}
            max={pageCount}
            onChange={(valueAsString: string, valueAsNumber: number) => {
              const page = valueAsNumber ? valueAsNumber - 1 : 0;
              gotoPage(page);
            }}
            defaultValue={pageIndex + 1}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <Select
            colorScheme="teal"
            size='sm'
            w={32}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
            }}
          >
            {PAGE_SIZES.map((ps: number) => (
              <option key={ps} value={ps}>
                Show {ps}
              </option>
            ))}
          </Select> */}
        </Flex>

        <Flex>
          <Tooltip label='Next Page'>
            <IconButton
              colorScheme="teal"
              size='sm'
              aria-label='Next Page'
              onClick={nextPage}
              isDisabled={!canNextPage}
              icon={<ChevronRightIcon h={6} w={6} />}
            />
          </Tooltip>
          <Tooltip label='Last Page'>
            <IconButton
              colorScheme="teal"
              size='sm'
              aria-label='Last Page'
              onClick={() => gotoPage(pageCount - 1)}
              isDisabled={!canNextPage}
              icon={<ArrowRightIcon h={3} w={3} />}
              ml={2}
            />
          </Tooltip>
        </Flex>
      </Flex>
  </>);
}