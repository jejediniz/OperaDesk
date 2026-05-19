"use client";

import { Button, Input, Select, Textarea } from "@/components/ui";

export default function ChamadoEditModal({
  open,
  form,
  onChange,
  onSubmit,
  onClose,
  podeDefinirPrioridade,
  tecnicos,
  erro
}) {
  if (!open) return null;

  return (
    <div className="edit-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="edit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-chamado-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="edit-modal__header">
          <div>
            <h3 id="edit-chamado-title">Editar chamado</h3>
            <p>Atualize os dados operacionais sem sair da fila.</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </div>

        <form onSubmit={onSubmit} className="edit-modal__form">
          {erro && <div className="alert alert-error">{erro}</div>}

          <Input
            label="Título"
            name="titulo"
            placeholder="Título do chamado"
            value={form.titulo}
            onChange={onChange}
            required
          />

          <Textarea
            label="Descrição"
            name="descricao"
            placeholder="Conte o que precisa ser resolvido"
            value={form.descricao}
            onChange={onChange}
            required
          />

          <Input
            label="Setor"
            name="setor"
            placeholder="Ex.: Financeiro, RH, Comercial"
            value={form.setor}
            onChange={onChange}
          />

          {podeDefinirPrioridade ? (
            <Select
              label="Prioridade"
              name="prioridade"
              value={form.prioridade}
              onChange={onChange}
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </Select>
          ) : (
            <Input label="Prioridade" value="Definida pelo técnico" disabled readOnly />
          )}

          <Select
            label="Técnico responsável"
            name="tecnicoId"
            value={form.tecnicoId}
            onChange={onChange}
          >
            <option value="">Sem atribuição</option>
            {tecnicos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </Select>

          <Select label="Status" name="status" value={form.status} onChange={onChange}>
            <option value="aberto">Aberto</option>
            <option value="em_andamento">Em andamento</option>
            <option value="concluido">Concluído</option>
          </Select>

          <div className="edit-modal__actions">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Atualizar chamado
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
