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

/*
sessionStorage vs localStorage:
For localStorage, data stored in localStorage persists until explicitly deleted. 
Changes made are saved and available for all current and future 
visits to the site. We use this mostly so we can allow user to right-click and open 
logged in views in a new tab or browser.

For sessionStorage, changes are only available per tab. 
Changes made are saved and available for the current page in that 
tab until it is closed. Once it is closed, the stored data is deleted.

*/
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
