import { useEffect, useState } from "react";

/** Откладывает обновление значения (удобно для полей цены/радиуса, чтобы не дёргать API на каждый символ). */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
