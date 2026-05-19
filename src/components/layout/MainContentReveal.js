"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Revela blocos de topo-nível do conteúdo principal ao entrar na viewport (IntersectionObserver nativo).
 */
export default function MainContentReveal({ children }) {
  const ref = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;

    const candidates = [...root.querySelectorAll(":scope > *")];
    candidates.forEach((el, i) => {
      el.classList.add("od-reveal");
      el.style.setProperty("--od-reveal-delay", `${Math.min(i * 48, 192)}ms`);
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("od-reveal--visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.04 }
    );

    candidates.forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
      candidates.forEach((el) => {
        el.classList.remove("od-reveal", "od-reveal--visible");
        el.style.removeProperty("--od-reveal-delay");
      });
    };
  }, [pathname]);

  return <div ref={ref}>{children}</div>;
}
