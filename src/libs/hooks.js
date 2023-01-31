import { useState, useEffect } from 'react';

export const useLocalStorage = (storageKey, fallbackState) => {
  const [value, setValue] = useState(
    JSON.parse(localStorage.getItem(storageKey)) ?? fallbackState
  );

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(value));
  }, [value, storageKey]);

  return [value, setValue];
}

export const useSessionStorage = (storageKey, fallbackState) => {
  const [value, setValue] = useState(
    JSON.parse(sessionStorage.getItem(storageKey)) ?? fallbackState
  );

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
}
