"use client";

import { useState } from "react";
import {
  Button,
  Card,
  EmptyState,
  Input,
  PageHeader,
  Select,
  SkeletonCard,
  Textarea
} from "@/components/ui";

export default function DevUiGallery() {
  const [nome, setNome] = useState("");

  return (
    <div className="mx-auto max-w-3xl space-y-12 px-4">
      <PageHeader
        title="Catálogo de UI (desenvolvimento)"
        subtitle="Referência rápida dos componentes em src/components/ui — tema claro/escuro do app."
      />

      <section className="space-y-4" aria-labelledby="dev-ui-buttons">
        <h2
          id="dev-ui-buttons"
          className="text-sm font-semibold uppercase tracking-wide text-od-muted"
        >
          Botões
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Perigo</Button>
          <Button variant="primary" disabled>
            Desabilitado
          </Button>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="dev-ui-fields">
        <h2
          id="dev-ui-fields"
          className="text-sm font-semibold uppercase tracking-wide text-od-muted"
        >
          Campos
        </h2>
        <Card className="space-y-4 p-5">
          <Input
            label="Nome"
            name="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: equipamento"
          />
          <Select label="Categoria" name="cat" value="a" onChange={() => {}}>
            <option value="a">Opção A</option>
            <option value="b">Opção B</option>
          </Select>
          <Textarea
            label="Observações"
            name="obs"
            value=""
            onChange={() => {}}
            rows={3}
            placeholder="Texto longo"
          />
        </Card>
      </section>

      <section className="space-y-4" aria-labelledby="dev-ui-alerts">
        <h2
          id="dev-ui-alerts"
          className="text-sm font-semibold uppercase tracking-wide text-od-muted"
        >
          Alertas
        </h2>
        <div className="space-y-3">
          <div className="alert alert-error">
            Exemplo de mensagem de erro alinhada aos tokens do tema.
          </div>
          <div className="alert alert-success">Exemplo de feedback de sucesso.</div>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="dev-ui-feedback">
        <h2
          id="dev-ui-feedback"
          className="text-sm font-semibold uppercase tracking-wide text-od-muted"
        >
          Estado vazio e carregamento
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <EmptyState
            title="Nenhum item"
            description="Use este bloco quando listas ou filtros não retornam dados."
            actionLabel="Nova ação"
            onAction={() => {}}
          />
          <Card className="p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-od-muted">
              Skeleton
            </p>
            <SkeletonCard lines={2} />
          </Card>
        </div>
      </section>

      <p className="text-center text-xs text-od-muted">
        Rota só disponível em desenvolvimento. Em produção retorna 404.
      </p>
    </div>
  );
}
