import { useState } from "react";

function useThrottle<T extends (arg: number) => void>(callback: T, delay = 2000): T {
  const [lastExecuted, setLastExecuted] = useState(0);

  return ((arg: number) => {
    const now = Date.now();

    if (now - lastExecuted > delay) {
      setLastExecuted(now);
      callback(arg);
    }
  }) as T;
}

export default useThrottle;
