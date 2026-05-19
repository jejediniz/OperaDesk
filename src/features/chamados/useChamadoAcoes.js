"use client";

import { useCallback } from "react";
import { useConfirm } from "@/contexts/confirmContext";
import { useToast } from "@/contexts/toastContext";
import { STATUS_FECHADOS } from "@/constants/chamados";

export function useChamadoAcoes({ usuario, atualizarMutation, excluirMutation, setErro }) {
  const { confirm } = useConfirm();
  const toast = useToast();

  const reportar = useCallback(
    (mensagemErro, error) => {
      const msg = error?.message || mensagemErro;
      setErro(msg);
      toast.error(msg);
    },
    [setErro, toast]
  );

  const remover = useCallback(
    async (id) => {
      const ok = await confirm({
        title: "Excluir chamado",
        description: "Essa ação remove o chamado da lista. Deseja continuar?",
        confirmLabel: "Excluir"
      });
      if (!ok) return;

      try {
        await excluirMutation.mutateAsync(id);
        toast.success("Chamado excluído com sucesso.");
      } catch (error) {
        reportar("Erro ao excluir chamado", error);
      }
    },
    [confirm, excluirMutation, reportar, toast]
  );

  const assumirChamado = useCallback(
    async (id) => {
      try {
        await atualizarMutation.mutateAsync({
          id,
          dados: { tecnicoId: usuario.id }
        });
        toast.success("Chamado assumido com sucesso.");
      } catch (error) {
        reportar("Erro ao assumir chamado", error);
      }
    },
    [atualizarMutation, reportar, toast, usuario?.id]
  );

  const concluirChamado = useCallback(
    async (id) => {
      const ok = await confirm({
        title: "Concluir chamado",
        description: "O chamado será marcado como concluído. Deseja continuar?",
        confirmLabel: "Concluir",
        variant: "primary"
      });
      if (!ok) return;

      try {
        await atualizarMutation.mutateAsync({
          id,
          dados: { status: "concluido" }
        });
        toast.success("Chamado concluído com sucesso.");
      } catch (error) {
        reportar("Erro ao concluir chamado", error);
      }
    },
    [atualizarMutation, confirm, reportar, toast]
  );

  const concluirSelecionados = useCallback(
    async (chamadosFiltrados, selecionados, onSuccess) => {
      const elegiveis = chamadosFiltrados.filter(
        (c) => selecionados.includes(c.id) && !STATUS_FECHADOS.includes(c.status)
      );
      if (!elegiveis.length) return;

      const ok = await confirm({
        title: "Concluir chamados selecionados",
        description: `Os ${elegiveis.length} chamados selecionados serão concluídos.`,
        confirmLabel: "Concluir",
        variant: "primary"
      });
      if (!ok) return;

      try {
        await Promise.all(
          elegiveis.map((c) =>
            atualizarMutation.mutateAsync({
              id: c.id,
              dados: { status: "concluido" }
            })
          )
        );
        onSuccess?.();
        toast.success("Chamados concluídos com sucesso.");
      } catch (error) {
        reportar("Erro ao concluir chamados selecionados", error);
      }
    },
    [atualizarMutation, confirm, reportar, toast]
  );

  const assumirSelecionados = useCallback(
    async (chamadosFiltrados, selecionados, onSuccess) => {
      const elegiveis = chamadosFiltrados.filter((c) => selecionados.includes(c.id));
      if (!elegiveis.length) return;

      const ok = await confirm({
        title: "Assumir chamados selecionados",
        description: `Você será definido como responsável por ${elegiveis.length} chamado(s).`,
        confirmLabel: "Assumir",
        variant: "primary"
      });
      if (!ok) return;

      try {
        await Promise.all(
          elegiveis.map((c) =>
            atualizarMutation.mutateAsync({
              id: c.id,
              dados: { tecnicoId: usuario.id }
            })
          )
        );
        onSuccess?.();
        toast.success("Chamados assumidos com sucesso.");
      } catch (error) {
        reportar("Erro ao assumir chamados selecionados", error);
      }
    },
    [atualizarMutation, confirm, reportar, toast, usuario?.id]
  );

  return {
    assumirChamado,
    assumirSelecionados,
    concluirChamado,
    concluirSelecionados,
    remover
  };
}
