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
import { NoDataHere } from "components/Sections/NoDataHere";
import { isValidNumericCharacter } from "libs/utils";
import Filter from "./Filter";
import { DataTableProps, fuzzyFilter } from "./tableUtils";

const styles = {
  table: {
    border: "1px solid ",
    borderColor: "#00C79740",
    borderRadius: "20px",
  },
  tbody: {
    borderBottom: "1px solid #00C79740",
  },
  th: {
    backgroundColor: "#00c7970d",
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
        <Button border={1} borderRadius={"lg"} padding={1} onClick={() => table.setPageIndex(0)} isDisabled={!table.getCanPreviousPage()}>
          <ArrowLeftIcon mx={3} />
        </Button>
        <Button border={1} borderRadius={"lg"} padding={1} onClick={() => table.previousPage()} isDisabled={!table.getCanPreviousPage()}>
          <ArrowBackIcon mx={3} />
        </Button>
        <Button border={1} borderRadius={"lg"} colorScheme="teal" marginBottom={2} onClick={() => setColumnFilters([])} isDisabled={columnFilters.length === 0}>
          <RepeatIcon marginRight={2} /> Reset filters
        </Button>
        <Button border={1} borderRadius={"lg"} padding={1} onClick={() => table.nextPage()} isDisabled={!table.getCanNextPage()}>
          <ArrowForwardIcon mx={3} />
        </Button>
        <Button
          border={1}
          borderRadius={"lg"}
          padding={1}
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          isDisabled={!table.getCanNextPage() || table.getState().pagination.pageIndex >= table.getPageCount() - 1}>
          <ArrowRightIcon mx={3} />
        </Button>
      </Flex>
      <div style={{ maxHeight: "100%", overflowX: "scroll" }}>
        <Table border="1px solid" borderRadius="lg" borderColor="#00C79740" my="6" style={{ borderCollapse: "separate", borderSpacing: "0" }}>
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
          {
            table.getRowModel().rows && table.getRowModel().rows.length > 0 && (
              <Tbody style={styles.tbody}>
                {table.getRowModel().rows.map((row) => {
                  return (
                    <Tr key={row.id} borderColor="#00C79740">
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <Td fontSize="lg !important" key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </Td>
                        );
                      })}
                    </Tr>
                  );
                })}
              </Tbody>
            )
          }
        </Table>
        {
          !(table.getRowModel().rows && table.getRowModel().rows.length > 0) && (
            <Flex justifyContent="center" w="full" mb="4rem">
              <NoDataHere imgFromTop="4rem" />
            </Flex>
          )
        }
      </div>
      {table && table.getPageCount() > 0 && (
        <VStack gap={2} alignItems={"center"} justifyContent={"center"}>
          <VStack>
            <Text as={"span"} display={"flex"} alignItems={"center"} gap={1}>
              Page
              <strong>{table.getState().pagination.pageIndex + 1}</strong>
              of
              <strong>{table.getPageCount()}</strong>
            </Text>
          </VStack>
          <HStack marginBottom="7 !important">
            <Text as={"span"} minWidth={"6rem"}>
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
      )}
    </Box>
  );
}
