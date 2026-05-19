"use client";

import { Button, Input, Select } from "@/components/ui";

export default function ChamadosToolbar({
  busca,
  onBuscaChange,
  statusFiltro,
  onStatusFiltroChange,
  limite,
  onLimiteChange,
  totalFiltrado,
  totalPagina,
  filtrosAtivos,
  onLimparFiltros
}) {
  return (
    <>
      <div className="table-actions">
        <div className="table-search-row">
          <Input
            label="Buscar chamados"
            hideLabel
            className="table-search"
            placeholder="Buscar por título, pessoa ou setor"
            value={busca}
            onChange={(e) => onBuscaChange(e.target.value)}
          />

          <Select
            label="Status"
            hideLabel
            className="table-filter table-filter--compact"
            value={statusFiltro}
            onChange={(e) => onStatusFiltroChange(e.target.value)}
          >
            <option value="todos">Todos os status</option>
            <option value="aberto">Abertos</option>
            <option value="em_andamento">Em andamento</option>
            <option value="concluido">Concluídos</option>
          </Select>

          <label className="table-limit">
            <span>Itens por página</span>
            <select value={limite} onChange={(e) => onLimiteChange(Number(e.target.value))}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>
      </div>

      <div className="table-toolbar">
        <div className="table-toolbar__summary">
          <strong>{totalFiltrado}</strong>
          <span>
            de {totalPagina} chamado{totalPagina === 1 ? "" : "s"} nesta página
          </span>
          {filtrosAtivos > 0 && (
            <span className="table-toolbar__tag">
              {filtrosAtivos} filtro{filtrosAtivos === 1 ? "" : "s"} ativo
              {filtrosAtivos === 1 ? "" : "s"}
            </span>
          )}
        </div>

        <div className="table-toolbar__actions">
          <Button type="button" variant="secondary" size="sm" onClick={onLimparFiltros}>
            Limpar filtros
          </Button>
        </div>
      </div>
    </>
  );
}
