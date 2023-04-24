import React, { useState } from "react";
import { ArrowBackIcon, ArrowForwardIcon, ArrowLeftIcon, ArrowRightIcon, RepeatIcon, TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Button,
  Text,
  NumberInput,
  NumberInputField,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInputStepper,
  HStack,
  Select,
  Show,
  VStack,
  Flex,
} from "@chakra-ui/react";
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { isValidNumericCharacter } from "libs/util";
import Filter from "./Filter";
import { DataTableProps, fuzzyFilter } from "./tableUtils";

const styles = {
  table: {
    border: "2px solid var(--chakra-colors-teal-200)",
    borderRadius: "1rem",
    fontSize: "16px",
  },
  tbody: {
    borderBottom: "1px solid var(--chakra-colors-teal-200)",
  },
  th: {
    borderBottom: "1px solid var(--chakra-colors-teal-200)",
    borderRight: "1px solid var(--chakra-colors-teal-200)",
    padding: "2px 4px",
  },
};

export function DataTable<Data extends object>({ data, columns }: DataTableProps<Data>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
      globalFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  });

  return (
    <Box className="hidden-overflow-x">
      <Flex justifyContent={"center"} gap={2}>
        <Button border={1} borderRadius={"0.24rem"} padding={1} onClick={() => table.setPageIndex(0)} isDisabled={!table.getCanPreviousPage()}>
          <ArrowLeftIcon />
        </Button>
        <Button border={1} borderRadius={"0.24rem"} padding={1} onClick={() => table.previousPage()} isDisabled={!table.getCanPreviousPage()}>
          <ArrowBackIcon />
        </Button>
        <Button border={1} borderRadius={"0.24rem"} marginBottom={2} onClick={() => setColumnFilters([])} isDisabled={columnFilters.length === 0}>
          <RepeatIcon marginRight={2} /> Reset filters
        </Button>
        <Button border={1} borderRadius={"0.24rem"} padding={1} onClick={() => table.nextPage()} isDisabled={!table.getCanNextPage()}>
          <ArrowForwardIcon />
        </Button>
        <Button
          border={1}
          borderRadius={"0.24rem"}
          padding={1}
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          isDisabled={!table.getCanNextPage() || table.getState().pagination.pageIndex >= table.getPageCount() - 1}>
          <ArrowRightIcon />
        </Button>
      </Flex>
      <Table style={styles.table} className="data-table">
        <Thead style={styles.th}>
          {table.getHeaderGroups().map((headerGroup) => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <Th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <>
                        <Box
                          {...{
                            className: header.column.getCanSort() ? "cursor-pointer select-none" : "",
                            onClick: header.column.getToggleSortingHandler(),
                          }}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <TriangleUpIcon />,
                            desc: <TriangleDownIcon />,
                          }[header.column.getIsSorted() as string] ?? null}
                        </Box>
                        {header.column.getCanFilter() ? (
                          <Box>
                            <Filter column={header.column} table={table} />
                          </Box>
                        ) : null}
                      </>
                    )}
                  </Th>
                );
              })}
            </Tr>
          ))}
        </Thead>
        <Tbody style={styles.tbody}>
          {table.getRowModel().rows.map((row) => {
            return (
              <Tr key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  return <Td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Td>;
                })}
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      <VStack gap={2} alignItems={"center"} justifyContent={"center"} marginTop={4}>
        <VStack>
          <Text as={"span"} display={"flex"} alignItems={"center"} gap={1}>
            Page
            <strong>{table.getState().pagination.pageIndex + 1}</strong>
            of
            <strong>{table.getPageCount()}</strong>
          </Text>
        </VStack>
        <HStack>
          <Text as={"span"} minWidth={"5rem"}>
            Go to page
          </Text>
          <NumberInput
            defaultValue={table.getState().pagination.pageIndex + 1}
            maxWidth={"4.4rem"}
            min={1}
            max={table.getPageCount()}
            isValidCharacter={isValidNumericCharacter}
            onBlur={(e: any) => {
              let page = e ? Number(e.target.value) - 1 : 0;
              page = Math.max(0, page);
              page = Math.min(table.getPageCount() - 1, page);
              table.setPageIndex(page);
            }}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>

          <Show above="md">
            <Select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              maxWidth={200}>
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </Select>
          </Show>
        </HStack>
      </VStack>
    </Box>
  );
}
