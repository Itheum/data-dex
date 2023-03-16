import { useState, useEffect } from "react";

function tryJsonParse(value: string | null): string | null {
  try {
    if (value) {
      return JSON.parse(value);
    }
  } catch {
    /* empty */
  }
  return null;
}

export const useLocalStorage = (storageKey: string, fallbackState: any) => {
  const [value, setValue] = useState(tryJsonParse(localStorage.getItem(storageKey)) ?? fallbackState);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(value));
  }, [value, storageKey]);

  return [value, setValue];
};

export const useSessionStorage = (storageKey: string, fallbackState: any) => {
  const [value, setValue] = useState(tryJsonParse(sessionStorage.getItem(storageKey)) ?? fallbackState);

  useEffect(() => {
    if (storageKey) {
      if (value === null) {
        sessionStorage.removeItem(storageKey);
      } else {
        sessionStorage.setItem(storageKey, JSON.stringify(value));
      }
    }
  }, [value, storageKey]);

  return [value, setValue];
};
