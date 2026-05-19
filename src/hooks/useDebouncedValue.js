"use client";

import { useEffect, useState } from "react";

/**
 * Retorna `value` debounced após `delay` ms de estabilidade.
 * Útil para evitar disparos a cada tecla em campos de busca.
 */
export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
