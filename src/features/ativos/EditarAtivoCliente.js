"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { buscarAtivo } from "@/services/api/ativosApi";
import AtivoForm from "./AtivoForm";

export default function EditarAtivoCliente() {
  const { id } = useParams();
  const [ativo, setAtivo] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let cancel = false;
    setErro(null);
    async function load() {
      try {
        const data = await buscarAtivo(id);
        if (!cancel) setAtivo(data);
      } catch (e) {
        if (!cancel) setErro(e?.message || "Erro ao carregar ativo");
      }
    }
    load();
    return () => {
      cancel = true;
    };
  }, [id]);

  if (erro) {
    return (
      <div className="anim-fade-stack">
        <PageHeader
          title="Ativo não disponível"
          subtitle={erro}
          actions={
            <Link href="/ativos" className="btn btn-secondary btn-md">
              Voltar
            </Link>
          }
        />
      </div>
    );
  }

  if (!ativo) {
    return <p className="loading">Carregando…</p>;
  }

  return <AtivoForm modo="editar" ativoId={id} initial={ativo} />;
}
