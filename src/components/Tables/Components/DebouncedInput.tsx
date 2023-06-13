import React, { InputHTMLAttributes, useEffect, useState } from "react";
import { SearchIcon } from "@chakra-ui/icons";

export default function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <>
      <div style={{ position: "relative" }}>
        <input {...props} value={value} onChange={(e) => setValue(e.target.value)} />
        <div style={{ position: "absolute", top: "55%", left: "8px", transform: "translateY(-50%)" }}>
          <SearchIcon /> {/* Icon prefix */}
        </div>
      </div>
    </>
  );
}
