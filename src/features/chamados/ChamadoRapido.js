"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/contexts/authContext";
import { useChamados } from "@/contexts/chamadosContext";
import { useToast } from "@/contexts/toastContext";
import { Button, Card, Input, Select, Textarea } from "@/components/ui";

const DEMANDAS_PADRAO = [
  "Computador não liga",
  "Internet lenta",
  "Erro em sistema",
  "Impressora não funciona",
  "Solicitação de acesso",
  "Outro problema"
];

const FORM_INICIAL = {
  titulo: "",
  descricao: "",
  prioridade: "media",
  setor: ""
};

const RASCUNHO_KEY = "operadesk:abrir-chamado:rascunho";
const TITULO_MIN = 5;
const DESCRICAO_MIN = 15;

function validarCampo(nome, valor) {
  const valorTrim = (valor ?? "").trim();
  if (nome === "titulo") {
    if (!valorTrim) return "Informe o problema ou assunto.";
    if (valorTrim.length < TITULO_MIN) return `Use pelo menos ${TITULO_MIN} caracteres.`;
    return null;
  }
  if (nome === "descricao") {
    if (!valorTrim) return "Descreva o que está acontecendo.";
    if (valorTrim.length < DESCRICAO_MIN)
      return `Detalhe um pouco mais (mínimo de ${DESCRICAO_MIN} caracteres).`;
    return null;
  }
  return null;
}

export default function ChamadoRapido() {
  const { usuario } = useAuth();
  const isTi = usuario?.tipo === "ti";
  const { criarChamado } = useChamados();
  const toast = useToast();

  const [form, setForm] = useState(() => {
    if (typeof window === "undefined") return FORM_INICIAL;
    try {
      const armazenado = window.localStorage.getItem(RASCUNHO_KEY);
      if (armazenado) {
        return { ...FORM_INICIAL, ...JSON.parse(armazenado) };
      }
    } catch {
      // ignora rascunho corrompido
    }
    return FORM_INICIAL;
  });

  const [tocados, setTocados] = useState({});
  const [erroEnvio, setErroEnvio] = useState(null);
  const [sucesso, setSucesso] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [rascunhoSalvo, setRascunhoSalvo] = useState(false);
  const submetidoRef = useRef(false);

  const erros = useMemo(
    () => ({
      titulo: validarCampo("titulo", form.titulo),
      descricao: validarCampo("descricao", form.descricao)
    }),
    [form.titulo, form.descricao]
  );

  const formularioValido = !erros.titulo && !erros.descricao;

  const temRascunho = Boolean(form.titulo.trim() || form.descricao.trim() || form.setor.trim());

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!temRascunho) {
      window.localStorage.removeItem(RASCUNHO_KEY);
      setRascunhoSalvo(false);
      return;
    }
    const handle = window.setTimeout(() => {
      try {
        window.localStorage.setItem(RASCUNHO_KEY, JSON.stringify(form));
        setRascunhoSalvo(true);
      } catch {
        // ignora limites de storage
      }
    }, 400);
    return () => window.clearTimeout(handle);
  }, [form, temRascunho]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((atual) => ({ ...atual, [name]: value }));
  }

  function handleBlur(e) {
    setTocados((atual) => ({ ...atual, [e.target.name]: true }));
  }

  function limparRascunho() {
    setForm(FORM_INICIAL);
    setTocados({});
    setErroEnvio(null);
    setSucesso(null);
    setRascunhoSalvo(false);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(RASCUNHO_KEY);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    submetidoRef.current = true;
    setTocados({ titulo: true, descricao: true });

    if (!formularioValido) {
      setErroEnvio("Revise os campos destacados antes de enviar.");
      return;
    }

    setErroEnvio(null);
    setSucesso(null);
    setCarregando(true);
    try {
      await criarChamado({
        titulo: form.titulo.trim(),
        descricao: form.descricao.trim(),
        prioridade: isTi ? form.prioridade : "media",
        setor: form.setor.trim() || undefined
      });

      limparRascunho();
      setSucesso("Chamado aberto com sucesso!");
      toast.success("Chamado enviado para a fila com sucesso.");
    } catch (error) {
      setErroEnvio(error.message || "Erro ao abrir chamado");
      toast.error(error.message || "Erro ao abrir chamado.");
    } finally {
      setCarregando(false);
    }
  }

  const mostrarErro = (nome) =>
    (tocados[nome] || submetidoRef.current) && erros[nome] ? erros[nome] : null;

  return (
    <div className="center-page">
      <Card className="open-ticket">
        <h2>Abrir Chamado</h2>
        <p>Escolha uma demanda ou descreva o problema para o suporte.</p>

        {erroEnvio && <div className="alert alert-error">{erroEnvio}</div>}
        {sucesso && <div className="alert alert-success">{sucesso}</div>}

        <form onSubmit={handleSubmit} className="open-form" noValidate>
          <Input
            label="Problema ou assunto"
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            onBlur={handleBlur}
            list="demandas-padrao"
            placeholder="Ex.: Impressora não funciona"
            helperText={
              mostrarErro("titulo") ? undefined : "Digite livremente ou escolha uma sugestão comum"
            }
            error={mostrarErro("titulo")}
            required
          />
          <datalist id="demandas-padrao">
            {DEMANDAS_PADRAO.map((demanda) => (
              <option key={demanda} value={demanda} />
            ))}
          </datalist>

          <Textarea
            label="Descrição"
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Descreva o que está acontecendo com o máximo de detalhes"
            helperText={
              mostrarErro("descricao")
                ? undefined
                : `${form.descricao.length} caracteres • mínimo ${DESCRICAO_MIN}`
            }
            error={mostrarErro("descricao")}
            required
          />

          <Input
            label="Setor"
            name="setor"
            value={form.setor}
            onChange={handleChange}
            placeholder="Ex.: Financeiro, RH, Comercial"
          />

          {isTi && (
            <Select
              label="Prioridade"
              name="prioridade"
              value={form.prioridade}
              onChange={handleChange}
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </Select>
          )}

          <div className="form-actions form-actions--split">
            <div className="form-actions__hint">
              {temRascunho ? (
                <>
                  {rascunhoSalvo ? "Rascunho salvo automaticamente" : "Salvando rascunho..."}{" "}
                  <button
                    type="button"
                    className="link-button"
                    onClick={limparRascunho}
                    disabled={carregando}
                  >
                    Limpar rascunho
                  </button>
                </>
              ) : (
                <span className="form-actions__hint-empty">
                  Seu progresso é salvo enquanto você digita.
                </span>
              )}
            </div>
            <Button type="submit" variant="primary" disabled={carregando || !formularioValido}>
              {carregando ? "Enviando..." : "Abrir Chamado"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
