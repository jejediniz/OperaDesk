"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTORS =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function useFocusTrap({ active, onClose }) {
  const containerRef = useRef(null);
  const initialFocusRef = useRef(null);
  const lastFocusedElementRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;

    lastFocusedElementRef.current = document.activeElement;
    window.requestAnimationFrame(() => {
      initialFocusRef.current?.focus?.();
    });

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key !== "Tab" || !containerRef.current) return;

      const focusable = containerRef.current.querySelectorAll(FOCUSABLE_SELECTORS);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      lastFocusedElementRef.current?.focus?.();
    };
  }, [active, onClose]);

  return { containerRef, initialFocusRef };
}
