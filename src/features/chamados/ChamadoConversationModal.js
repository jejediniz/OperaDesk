"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/contexts/authContext";
import { useToast } from "@/contexts/toastContext";
import { useInteracoesChamado, useCriarInteracaoMutation } from "./useChamadosQueries";
import { PRIORIDADE_LABEL, STATUS_LABEL } from "@/constants/chamados";
import { formatDate } from "@/utils/formatters";
import { Button, Textarea } from "@/components/ui";

function getAutorPerfil(autor) {
  if (!autor) return "Sistema";
  if (autor.admin) return "Administrador";
  if (autor.tipo === "ti") return "Técnico";
  return "Usuário";
}

function getDateLabel(value) {
  if (!value) return "";

  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

export default function ChamadoConversationModal({
  chamado,
  open,
  onClose,
  allowInternal = false,
  onUpdated
}) {
  const { usuario } = useAuth();
  const toast = useToast();
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("publica");
  const [erro, setErro] = useState("");
  const timelineRef = useRef(null);

  const chamadoId = open ? chamado?.id : null;

  const interacoesQuery = useInteracoesChamado(chamadoId);
  const criarInteracao = useCriarInteracaoMutation(chamadoId);

  const interacoes = useMemo(() => interacoesQuery.data ?? [], [interacoesQuery.data]);
  const loading = interacoesQuery.isLoading;
  const saving = criarInteracao.isPending;

  useEffect(() => {
    if (!open) {
      setMensagem("");
      setTipoMensagem("publica");
      setErro("");
    }
  }, [open]);

  useEffect(() => {
    if (interacoesQuery.error) {
      setErro(interacoesQuery.error.message || "Erro ao carregar conversa");
    }
  }, [interacoesQuery.error]);

  useEffect(() => {
    if (!open || !timelineRef.current) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    timelineRef.current.scrollTo({
      top: timelineRef.current.scrollHeight,
      behavior: reducedMotion ? "auto" : "smooth"
    });
  }, [interacoes, open]);

  const tituloModal = useMemo(() => {
    if (!chamado) return "Conversa do chamado";
    return `Conversa do chamado #${chamado.id}`;
  }, [chamado]);

  const timelineItems = useMemo(() => {
    const items = [];
    let currentDate = "";

    interacoes.forEach((interacao) => {
      const dateLabel = getDateLabel(interacao.created_at);

      if (dateLabel !== currentDate) {
        currentDate = dateLabel;
        items.push({
          type: "separator",
          key: `separator-${dateLabel}`,
          label: dateLabel
        });
      }

      items.push({
        type: "message",
        key: interacao.id,
        interacao
      });
    });

    return items;
  }, [interacoes]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!mensagem.trim()) {
      setErro("Escreva uma mensagem para continuar.");
      return;
    }

    setErro("");

    try {
      await criarInteracao.mutateAsync({
        mensagem: mensagem.trim(),
        tipo: allowInternal ? tipoMensagem : "publica"
      });

      setMensagem("");
      setTipoMensagem("publica");
      toast.success("Mensagem enviada com sucesso.");
      await onUpdated?.();
    } catch (error) {
      setErro(error.message || "Erro ao enviar mensagem");
      toast.error(error.message || "Erro ao enviar mensagem.");
    }
  }

  if (!open || !chamado) {
    return null;
  }

  return (
    <div className="conversation-overlay" role="presentation" onClick={onClose}>
      <div
        className="conversation-modal"
        role="dialog"
        aria-modal="true"
        aria-busy={loading || saving}
        aria-labelledby="conversation-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="conversation-modal__header">
          <div>
            <h3 id="conversation-title">{tituloModal}</h3>
            <p>Troque mensagens dentro do contexto do atendimento.</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </div>

        <div className="conversation-summary">
          <div className="conversation-summary__main">
            <div className="conversation-summary__badges">
              <span className={`status-badge ${chamado.status || "aberto"}`}>
                {STATUS_LABEL[chamado.status] || chamado.status}
              </span>
              <span className={`prioridade-badge prioridade-${chamado.prioridade || "media"}`}>
                {PRIORIDADE_LABEL[chamado.prioridade] || "Média"}
              </span>
            </div>
            <strong>{chamado.titulo}</strong>
          </div>

          <div className="conversation-summary__meta">
            <span>
              <small>Solicitante</small>
              <strong>{chamado.solicitante?.nome || "—"}</strong>
            </span>
            <span>
              <small>Técnico</small>
              <strong>{chamado.tecnico?.nome || chamado.tecnico_responsavel?.nome || "—"}</strong>
            </span>
            <span>
              <small>Atualizado</small>
              <strong>{formatDate(chamado.updated_at || chamado.created_at)}</strong>
            </span>
          </div>
        </div>

        <div className="conversation-timeline" ref={timelineRef}>
          {loading && <p className="conversation-timeline__feedback">Carregando conversa...</p>}

          {!loading && interacoes.length === 0 && (
            <p className="conversation-timeline__feedback">
              Ainda não existem mensagens neste chamado.
            </p>
          )}

          {!loading &&
            timelineItems.map((item) => {
              if (item.type === "separator") {
                return (
                  <div key={item.key} className="conversation-date-separator">
                    <span>{item.label}</span>
                  </div>
                );
              }

              const { interacao } = item;
              const isOwn = interacao.autor?.id === usuario?.id;
              const autorPerfil = getAutorPerfil(interacao.autor);

              return (
                <article
                  key={item.key}
                  className={`conversation-row ${isOwn ? "conversation-row--own" : ""}`}
                >
                  <div
                    className={`conversation-bubble ${isOwn ? "conversation-bubble--own" : ""} ${
                      interacao.tipo === "interna" ? "conversation-bubble--internal" : ""
                    } ${interacao.autor?.tipo === "ti" || interacao.autor?.admin ? "conversation-bubble--team" : "conversation-bubble--user"}`}
                  >
                    <div className="conversation-bubble__meta">
                      <div className="conversation-bubble__author">
                        <strong>{interacao.autor?.nome || "Usuário"}</strong>
                        <span>{autorPerfil}</span>
                      </div>
                      <div className="conversation-bubble__meta-right">
                        {interacao.tipo === "interna" && (
                          <span className="conversation-bubble__tag">Nota interna</span>
                        )}
                        <time>{formatDate(interacao.created_at)}</time>
                      </div>
                    </div>
                    <div className="conversation-bubble__content">{interacao.mensagem}</div>
                  </div>
                </article>
              );
            })}
        </div>

        <form className="conversation-form" onSubmit={handleSubmit}>
          {allowInternal && (
            <div className="conversation-form__types">
              <button
                type="button"
                className={`filtro-btn ${tipoMensagem === "publica" ? "ativo" : ""}`}
                onClick={() => setTipoMensagem("publica")}
              >
                Mensagem pública
              </button>
              <button
                type="button"
                className={`filtro-btn ${tipoMensagem === "interna" ? "ativo" : ""}`}
                onClick={() => setTipoMensagem("interna")}
              >
                Nota interna
              </button>
            </div>
          )}

          <Textarea
            label="Mensagem"
            hideLabel
            placeholder={
              tipoMensagem === "interna"
                ? "Escreva uma nota visível apenas para a equipe interna"
                : "Escreva uma mensagem para este chamado"
            }
            value={mensagem}
            onChange={(event) => setMensagem(event.target.value)}
            rows={4}
            helperText={
              tipoMensagem === "interna"
                ? "Notas internas não aparecem para o solicitante."
                : undefined
            }
          />

          {erro && <div className="alert alert-error">{erro}</div>}

          <div className="conversation-form__actions">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Enviando mensagem..." : "Enviar mensagem"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
