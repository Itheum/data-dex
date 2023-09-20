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
      borderColor: "#FFFFFF40",
      padding: "8px",
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
      padding: "8px",
      marginTop: "0.4rem",
      fontSize: "16px",
      width: "170px",
      height: "45px",
      textIndent: "0.9rem",
    },
  };
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>, isStartDate: boolean) => {
    const value = event.target.value;
    const startDate = isStartDate ? (value ? new Date(value).getTime() / 1000 : null) : (columnFilterValue as [number, number])?.[0] ?? null;
    let endDate = isStartDate ? (columnFilterValue as [number, number])?.[1] ?? null : value ? new Date(value).getTime() / 1000 : null;

    if (endDate !== null) {
      const dateObj = new Date(endDate * 1000);
      dateObj.setHours(23, 59, 0, 0);
      endDate = dateObj.getTime() / 1000;
    }

    column.setFilterValue([startDate, endDate]);
  };

  return column.id === "age" ? (
    <Box>
      <Box display="flex" gap={2}>
        <input
          type="date"
          style={styles.textInput}
          value={(columnFilterValue as [number, number])?.[0] ? new Date((columnFilterValue as [number, number])?.[0] * 1000).toISOString().split("T")[0] : ""}
          onChange={(event) => handleDateChange(event, true)}
          max={new Date().toISOString().split("T")[0]}
        />
        <input
          type="date"
          style={styles.textInput}
          value={(columnFilterValue as [number, number])?.[1] ? new Date((columnFilterValue as [number, number])?.[1] * 1000).toISOString().split("T")[0] : ""}
          onChange={(event) => handleDateChange(event, false)}
          max={new Date().toISOString().split("T")[0]}
        />
      </Box>
    </Box>
  ) : typeof firstValue === "number" ? (
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
