"use client";

import Link from "next/link";
import { formatDateTime } from "@/utils/formatters";
import StatusAtivoBadge from "./StatusAtivoBadge";

export default function AtivoDetalhesView({ ativo }) {
  if (!ativo) return null;

  return (
    <div className="ativos-detalhe anim-fade-stack">
      <div className="ativos-detalhe__toolbar">
        <Link href="/ativos" className="btn btn-secondary btn-md">
          Voltar
        </Link>
        <Link href={`/ativos/${ativo.id}/editar`} className="btn btn-primary btn-md">
          Editar
        </Link>
      </div>

      <header className="ativos-detalhe__hero">
        <div>
          <p className="muted">Patrimônio · {ativo.numeroPatrimonio}</p>
          <h2>{ativo.nome}</h2>
          <StatusAtivoBadge status={ativo.status} />
          {!ativo.ativo && (
            <span className="muted" style={{ marginLeft: "0.5rem" }}>
              Cadastro inativado
            </span>
          )}
        </div>
      </header>

      <section className="ativo-detalhe-bloco" aria-labelledby="sec-id">
        <h3 id="sec-id" className="ativo-detalhe-bloco__title">
          Identificação
        </h3>
        <dl className="ativo-detalhe-grid">
          <div className="ativo-detalhe-grid__pair">
            <dt>Série</dt>
            <dd>{ativo.numeroSerie || "—"}</dd>
          </div>
          <div className="ativo-detalhe-grid__pair">
            <dt>Categoria</dt>
            <dd>{ativo.categoria || "—"}</dd>
          </div>
          <div className="ativo-detalhe-grid__pair">
            <dt>Marca</dt>
            <dd>{ativo.marca || "—"}</dd>
          </div>
          <div className="ativo-detalhe-grid__pair">
            <dt>Modelo</dt>
            <dd>{ativo.modelo || "—"}</dd>
          </div>
          <div className="ativo-detalhe-grid__pair ativo-detalhe-grid__pair--wide">
            <dt>Descrição</dt>
            <dd>{ativo.descricao || "—"}</dd>
          </div>
        </dl>
      </section>

      <section className="ativo-detalhe-bloco" aria-labelledby="sec-sit">
        <h3 id="sec-sit" className="ativo-detalhe-bloco__title">
          Situação
        </h3>
        <dl className="ativo-detalhe-grid">
          <div className="ativo-detalhe-grid__pair">
            <dt>Status atual</dt>
            <dd>
              <StatusAtivoBadge status={ativo.status} />
            </dd>
          </div>
        </dl>
      </section>

      <section className="ativo-detalhe-bloco" aria-labelledby="sec-empresa">
        <h3 id="sec-empresa" className="ativo-detalhe-bloco__title">
          Uso interno na empresa
        </h3>
        <p className="muted ativo-detalhe-bloco__intro">
          Alocação a setores e pessoas — não representa venda nem saída definitiva para fora.
        </p>
        <dl className="ativo-detalhe-grid">
          <div className="ativo-detalhe-grid__pair">
            <dt>Setor / departamento</dt>
            <dd>{ativo.setor || "—"}</dd>
          </div>
          <div className="ativo-detalhe-grid__pair">
            <dt>Localização</dt>
            <dd>{ativo.localizacao || "—"}</dd>
          </div>
          <div className="ativo-detalhe-grid__pair">
            <dt>Responsável no momento</dt>
            <dd>{ativo.responsavel || "—"}</dd>
          </div>
        </dl>
      </section>

      <section className="ativo-detalhe-bloco">
        <h3 className="ativo-detalhe-bloco__title">Observações</h3>
        <p className="ativo-detalhe-texto">{ativo.observacoes || "—"}</p>
      </section>

      <section className="ativo-detalhe-bloco muted">
        <h3 className="ativo-detalhe-bloco__title">Registro no sistema</h3>
        <dl className="ativo-detalhe-meta">
          <div>
            <dt>Primeira inclusão no controle</dt>
            <dd>{formatDateTime(ativo.criadoEm)}</dd>
          </div>
          <div>
            <dt>Última alteração</dt>
            <dd>{formatDateTime(ativo.atualizadoEm)}</dd>
          </div>
          <div>
            <dt>Registro ativo</dt>
            <dd>{ativo.ativo ? "Sim" : "Não (inativado nas listagens padrão)"}</dd>
          </div>
        </dl>
      </section>

      <section className="ativo-historico">
        <h3>Movimentações entre setores</h3>
        <div className="muted-box">
          Histórico detalhado de entradas e transferências será exibido aqui futuramente. Por enquanto,
          atualize setor, local e responsável ao mudar o destino do bem.
        </div>
      </section>
    </div>
  );
}
