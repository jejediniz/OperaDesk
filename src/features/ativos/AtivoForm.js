"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Package } from "lucide-react";
import { STATUS_ATIVO_LABEL, CATEGORIAS_ATIVO_SUGESTOES } from "@/constants/ativos";
import { criarAtivo, atualizarAtivo } from "@/services/api/ativosApi";
import { Button, Card, Input, Select, Textarea } from "@/components/ui";
import { useToast } from "@/contexts/toastContext";

export function emptyAtivoForm() {
  return {
    nome: "",
    numeroPatrimonio: "",
    numeroSerie: "",
    categoria: "",
    marca: "",
    modelo: "",
    descricao: "",
    status: "disponivel",
    setor: "",
    localizacao: "",
    responsavel: "",
    observacoes: ""
  };
}

export function ativoToForm(val) {
  if (!val) return emptyAtivoForm();
  return {
    nome: val.nome ?? "",
    numeroPatrimonio: val.numeroPatrimonio ?? "",
    numeroSerie: val.numeroSerie ?? "",
    categoria: val.categoria ?? "",
    marca: val.marca ?? "",
    modelo: val.modelo ?? "",
    descricao: val.descricao ?? "",
    status: val.status ?? "disponivel",
    setor: val.setor ?? "",
    localizacao: val.localizacao ?? "",
    responsavel: val.responsavel ?? "",
    observacoes: val.observacoes ?? ""
  };
}

function buildPayload(form) {
  return {
    nome: form.nome.trim(),
    numeroPatrimonio: form.numeroPatrimonio.trim(),
    numeroSerie: form.numeroSerie.trim() || null,
    categoria: form.categoria.trim() || null,
    marca: form.marca.trim() || null,
    modelo: form.modelo.trim() || null,
    descricao: form.descricao.trim() || null,
    status: form.status,
    setor: form.setor.trim() || null,
    localizacao: form.localizacao.trim() || null,
    responsavel: form.responsavel.trim() || null,
    observacoes: form.observacoes.trim() || null
  };
}

export default function AtivoForm({
  modo = "novo",
  ativoId,
  initial,
  embedded = false,
  onSaved,
  onCancelEdit
}) {
  const router = useRouter();
  const categoriasListId = useId().replace(/:/g, "");
  const [form, setForm] = useState(() =>
    modo === "editar" ? ativoToForm(initial) : emptyAtivoForm()
  );
  const [campoErro, setCampoErro] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [erroBase, setErroBase] = useState(null);
  const toast = useToast();

  const titulo = modo === "editar" ? "Editar patrimônio" : "Registrar no patrimônio";

  useEffect(() => {
    if (modo === "editar" && initial) {
      setForm(ativoToForm(initial));
    }
  }, [modo, initial]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setCampoErro({});
    setErroBase(null);

    const nome = form.nome?.trim?.() ?? "";
    const numero = form.numeroPatrimonio?.trim?.() ?? "";
    const nextCampo = {};
    if (!nome) nextCampo.nome = "Informe o nome do bem.";
    if (!numero) nextCampo.numeroPatrimonio = "Informe o número de patrimônio.";
    if (Object.keys(nextCampo).length) {
      setCampoErro(nextCampo);
      setErroBase("Preencha os campos obrigatórios em destaque.");
      return;
    }

    setEnviando(true);
    try {
      const payload = buildPayload(form);
      const resultado =
        modo === "editar" && ativoId
          ? await atualizarAtivo(ativoId, payload)
          : await criarAtivo(payload);

      if (!resultado?.id) {
        setErroBase(
          "Não recebemos o registro confirmado do servidor. Verifique sua conexão e tente novamente."
        );
        return;
      }

      toast.success(modo === "editar" ? "Registro atualizado." : "Bem cadastrado no patrimônio.");
      if (embedded && typeof onSaved === "function") {
        onSaved(resultado);
      } else {
        router.push("/ativos");
        router.refresh();
      }
      return;
    } catch (err) {
      const base =
        typeof err?.message === "string" && err.message.trim()
          ? err.message.trim()
          : "Não foi possível salvar.";
      const detalhes = err?.details;
      let mensagem = base;
      if (
        base === "Dados inválidos" &&
        Array.isArray(detalhes) &&
        detalhes.length > 0 &&
        typeof detalhes[0]?.message === "string"
      ) {
        mensagem =
          detalhes
            .map((d) => d.message)
            .filter(Boolean)
            .join(" · ") || base;
      }
      setErroBase(mensagem);
      if (Array.isArray(detalhes) && detalhes.length) {
        const next = {};
        for (const d of detalhes) {
          if (d.field) next[d.field] = d.message;
        }
        setCampoErro(next);
      }
    } finally {
      setEnviando(false);
    }
  }

  const cardShell =
    "form-section patrimonio-card rounded-2xl border-od-border/90 bg-od-card shadow-sm dark:border-od-border dark:bg-od-bg " +
    (embedded ? "!p-4" : "");

  return (
    <div
      className={
        embedded
          ? "patrimonio-form-embedded"
          : "anim-fade-stack mx-auto max-w-[920px] px-4 pb-20 pt-4 text-od-text"
      }
    >
      {!embedded && (
        <>
          <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <div
                className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-od-text to-od-bg text-white shadow-lg shadow-od-text/25 dark:from-od-surface-soft dark:to-od-border/40 dark:text-od-text dark:shadow-none sm:flex"
                aria-hidden
              >
                <Package className="size-7" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-od-muted">
                  Inventário corporativo
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-od-text [font-family:var(--font-display)]">
                  {titulo}
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-od-muted">
                  Controle interno do que entra no patrimônio e para qual setor ou local o bem é
                  destinado. Sem venda nem valores financeiros.
                </p>
              </div>
            </div>
            <Link
              href="/ativos"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl border border-od-border bg-od-card px-4 text-sm font-medium text-od-text-soft shadow-sm transition-colors hover:bg-od-surface-soft dark:border-od-border-strong dark:bg-od-surface dark:text-od-text dark:hover:bg-od-surface-muted"
            >
              Voltar à lista
            </Link>
          </header>

          <div className="mb-6 rounded-xl border border-od-border/90 bg-od-surface-soft/80 px-4 py-3 text-sm leading-relaxed text-od-text-soft dark:border-od-border dark:bg-od-surface/40 dark:text-od-text-soft">
            Use <strong className="font-semibold text-od-text">setor</strong>,{" "}
            <strong className="font-semibold text-od-text">localização</strong> e{" "}
            <strong className="font-semibold text-od-text">responsável</strong> quando o bem sair do
            estoque geral ou for alocado a uma área ou pessoa, sempre dentro da empresa.
          </div>
        </>
      )}

      {erroBase && (
        <div
          className="mb-4 rounded-xl border border-red-200/90 bg-red-50/95 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/35 dark:text-red-200"
          role="alert"
        >
          {erroBase}
        </div>
      )}

      <form onSubmit={onSubmit} className={`ativos-form ${embedded ? "gap-4" : ""}`} noValidate>
        <Card className={cardShell}>
          <h3 className="form-section__eyebrow">1 · Identificação do bem</h3>
          <p className="form-section__hint patrimonio-card__hint">
            Dados que identificam o item no inventário (patrimônio, série, tipo).
          </p>
          <div className="patrimonio-field-grid">
            <Input
              label="Nome do bem *"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              error={campoErro.nome}
              required
              placeholder="Ex.: Notebook Dell latitude"
            />
            <Input
              label="Número de patrimônio *"
              name="numeroPatrimonio"
              value={form.numeroPatrimonio}
              onChange={handleChange}
              error={campoErro.numeroPatrimonio}
              required
            />
            <Input
              label="Número de série"
              name="numeroSerie"
              value={form.numeroSerie}
              onChange={handleChange}
            />
            <Input
              label="Categoria"
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              list={categoriasListId}
              placeholder="Tipo do equipamento ou mobiliário"
            />
            <datalist id={categoriasListId}>
              {CATEGORIAS_ATIVO_SUGESTOES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <Input label="Marca" name="marca" value={form.marca} onChange={handleChange} />
            <Input label="Modelo" name="modelo" value={form.modelo} onChange={handleChange} />
          </div>
        </Card>

        <Card className={cardShell}>
          <h3 className="form-section__eyebrow">2 · Situação atual</h3>
          <p className="form-section__hint patrimonio-card__hint">
            Situação operacional do bem (disponível, em uso por um setor, manutenção, etc.).
          </p>
          <Select label="Situação *" name="status" value={form.status} onChange={handleChange}>
            {Object.entries(STATUS_ATIVO_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Textarea
            label="Descrição"
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
            rows={3}
            placeholder="Detalhes opcionais, características ou observações técnicas"
          />
        </Card>

        <Card className={cardShell}>
          <h3 className="form-section__eyebrow">3 · Onde está na empresa</h3>
          <p className="form-section__hint patrimonio-card__hint">
            Destino interno quando o bem deixa o estoque geral ou muda de lugar — não é venda nem
            saída externa.
          </p>
          <div className="patrimonio-field-grid">
            <Input
              label="Setor / departamento"
              name="setor"
              value={form.setor}
              onChange={handleChange}
              placeholder="Ex.: Financeiro, TI, Recepção"
            />
            <Input
              label="Localização física"
              name="localizacao"
              value={form.localizacao}
              onChange={handleChange}
              placeholder="Sala, andar, prédio, estante…"
            />
            <Input
              label="Quem está com o bem"
              name="responsavel"
              value={form.responsavel}
              onChange={handleChange}
              placeholder="Nome da pessoa ou equipe responsável no momento"
            />
          </div>
        </Card>

        <Card className={cardShell}>
          <h3 className="form-section__eyebrow">4 · Observações</h3>
          <p className="form-section__hint patrimonio-card__hint">
            Informações livres sobre o histórico do bem dentro da empresa.
          </p>
          <Textarea
            label="Observações gerais"
            name="observacoes"
            value={form.observacoes}
            onChange={handleChange}
            rows={4}
          />
        </Card>

        <div className="patrimonio-form-actions flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          {embedded ? (
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-medium text-od-muted transition-colors hover:bg-od-surface-muted hover:text-od-text dark:text-od-muted dark:hover:bg-od-surface-muted dark:hover:text-od-text"
              onClick={() => onCancelEdit?.()}
            >
              Voltar aos detalhes
            </button>
          ) : (
            <Link
              href="/ativos"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-od-border bg-od-card px-4 text-sm font-medium text-od-text-soft shadow-sm transition-colors hover:bg-od-surface-soft dark:border-od-border-strong dark:bg-od-surface dark:text-od-text dark:hover:bg-od-surface-muted"
            >
              Cancelar
            </Link>
          )}
          <Button type="submit" disabled={enviando} className="btn-md !rounded-xl">
            {enviando ? "Salvando…" : "Salvar registro"}
          </Button>
        </div>
      </form>
    </div>
  );
}
