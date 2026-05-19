"use client";

import { useEffect, useState } from "react";

export function useAnimatedNumber(valor, duracao = 500) {
  const [animado, setAnimado] = useState(0);

  useEffect(() => {
    let inicio = 0;
    const incremento = Math.max(1, Math.ceil(valor / (duracao / 16)));
    let frameId = null;

    function animar() {
      inicio += incremento;

      if (inicio >= valor) {
        setAnimado(valor);
        return;
      }

      setAnimado(inicio);
      frameId = window.requestAnimationFrame(animar);
    }

    animar();

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [valor, duracao]);

  return animado;
}
