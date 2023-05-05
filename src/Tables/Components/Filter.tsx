import React, { useMemo } from "react";
import { Box } from "@chakra-ui/react";
import { Column, Table } from "@tanstack/react-table";
import DebouncedInput from "./DebouncedInput";

export default function Filter({ column, table }: { column: Column<any, unknown>; table: Table<any> }) {
  const firstValue = table.getPreFilteredRowModel().flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  const sortedUniqueValues = useMemo(
    () => (typeof firstValue === "number" ? [] : Array.from(column.getFacetedUniqueValues().keys()).sort()),
    [column.getFacetedUniqueValues()]
  );

  const styles = {
    numberInput: {
      lineHeight: "1.25rem",
      border: "1px solid",
      borderRadius: "0.375rem",
      padding: "2px",
      marginTop: "0.24rem",
      fontSize: "16px",
      width: "170px",
      height: "45px",
    },
    textInput: {
      lineHeight: "1.25rem",
      border: "1px solid",
      borderRadius: "12px",
      borderColor: "#FFFFFF40",
      padding: "2px",
      marginTop: "0.4rem",
      fontSize: "16px",
      width: "170px",
      height: "45px",
      textIndent: "0.6rem",
    },
  };

  return typeof firstValue === "number" ? (
    <Box>
      <Box display={"flex"} gap={2}>
        <DebouncedInput
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? "")}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? "")}
          value={(columnFilterValue as [number, number])?.[0] ?? ""}
          onChange={(value) => column.setFilterValue((old: [number, number]) => [value, old?.[1]])}
          placeholder={`Min ${column.getFacetedMinMaxValues()?.[0] ? `(${column.getFacetedMinMaxValues()?.[0]})` : ""}`}
          style={styles.numberInput}
        />
        <DebouncedInput
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? "")}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? "")}
          value={(columnFilterValue as [number, number])?.[1] ?? ""}
          onChange={(value) => column.setFilterValue((old: [number, number]) => [old?.[0], value])}
          placeholder={`Max ${column.getFacetedMinMaxValues()?.[1] ? `(${column.getFacetedMinMaxValues()?.[1]})` : ""}`}
          style={styles.numberInput}
        />
      </Box>
    </Box>
  ) : (
    <Box>
      <datalist id={column.id + "list"}>
        {sortedUniqueValues.slice(0, 5000).map((value: any) => {
          return <option value={value} key={value} />;
        })}
      </datalist>
      <DebouncedInput
        type="text"
        value={(columnFilterValue ?? "") as string}
        onChange={(value) => column.setFilterValue(value)}
        placeholder={`Search (${column.getFacetedUniqueValues().size})`}
        style={styles.textInput}
        className="filter"
        list={column.id + "list"}
      />
    </Box>
  );
}
