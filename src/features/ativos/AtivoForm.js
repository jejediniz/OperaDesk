"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import {
  STATUS_ATIVO_LABEL,
  CATEGORIAS_ATIVO_SUGESTOES,
} from "@/constants/ativos";
import { criarAtivo, atualizarAtivo } from "@/services/api/ativosApi";
import { Button, Card, Input, PageHeader, Select, Textarea } from "@/components/ui";
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
    observacoes: "",
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
    observacoes: val.observacoes ?? "",
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
    observacoes: form.observacoes.trim() || null,
  };
}

export default function AtivoForm({
  modo = "novo",
  ativoId,
  initial,
  embedded = false,
  onSaved,
  onCancelEdit,
}) {
  const router = useRouter();
  const categoriasListId = useId().replace(/:/g, "");
  const [form, setForm] = useState(() =>
    modo === "editar" ? ativoToForm(initial) : emptyAtivoForm(),
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
          "Não recebemos o registro confirmado do servidor. Verifique sua conexão e tente novamente.",
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
        mensagem = detalhes.map((d) => d.message).filter(Boolean).join(" · ") || base;
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

  return (
    <div className={embedded ? "patrimonio-form-embedded" : "anim-fade-stack patrimonio-form-page"}>
      {!embedded && (
        <>
          <PageHeader
            title={titulo}
            subtitle="Controle interno: o que entra no patrimônio da empresa e para qual setor ou local o bem é destinado. Não há venda nem valores financeiros aqui."
            actions={
              <Link href="/ativos" className="btn btn-secondary btn-md">
                Voltar à lista
              </Link>
            }
          />

          <p className="patrimonio-scope-note">
            Use <strong>setor</strong>, <strong>localização</strong> e <strong>responsável</strong> quando o bem sair do
            estoque geral ou for alocado a uma área ou pessoa, sempre dentro da sua empresa.
          </p>
        </>
      )}

      {erroBase && (
        <div className="alert alert-error" role="alert">
          {erroBase}
        </div>
      )}

      <form onSubmit={onSubmit} className="ativos-form" noValidate>
        <Card className="form-section patrimonio-card">
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
            <Input
              label="Marca"
              name="marca"
              value={form.marca}
              onChange={handleChange}
            />
            <Input
              label="Modelo"
              name="modelo"
              value={form.modelo}
              onChange={handleChange}
            />
          </div>
        </Card>

        <Card className="form-section patrimonio-card">
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

        <Card className="form-section patrimonio-card">
          <h3 className="form-section__eyebrow">3 · Onde está na empresa</h3>
          <p className="form-section__hint patrimonio-card__hint">
            Destino interno quando o bem deixa o estoque geral ou muda de lugar — não é venda nem saída
            externa.
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

        <Card className="form-section patrimonio-card">
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

        <div className="form-actions form-actions--split patrimonio-form-actions">
          <Button type="submit" disabled={enviando}>
            {enviando ? "Salvando…" : "Salvar registro"}
          </Button>
          {embedded ? (
            <button type="button" className="btn btn-ghost btn-md" onClick={() => onCancelEdit?.()}>
              Voltar aos detalhes
            </button>
          ) : (
            <Link href="/ativos" className="btn btn-ghost btn-md">
              Cancelar
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}
