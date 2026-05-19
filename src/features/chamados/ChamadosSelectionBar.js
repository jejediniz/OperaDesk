"use client";

import { Button } from "@/components/ui";

export default function ChamadosSelectionBar({
  selecionadosCount,
  quantidadeConcluiveis,
  isTi,
  onAssumirSelecionados,
  onConcluirSelecionados
}) {
  if (selecionadosCount === 0) return null;

  return (
    <div className="selection-toolbar">
      <div className="selection-toolbar__summary">
        <strong>{selecionadosCount}</strong>
        <span>
          chamado{selecionadosCount === 1 ? "" : "s"} selecionado
          {selecionadosCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="selection-toolbar__actions">
        {isTi && (
          <Button type="button" variant="secondary" size="sm" onClick={onAssumirSelecionados}>
            Assumir selecionados
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onConcluirSelecionados}
          disabled={!quantidadeConcluiveis}
        >
          Concluir selecionados
        </Button>
      </div>
    </div>
  );
}
