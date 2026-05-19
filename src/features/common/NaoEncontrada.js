"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export default function NaoEncontrada() {
  const router = useRouter();

  return (
    <section className="not-found">
      <div className="not-found__content">
        <span className="not-found__eyebrow">Erro 404</span>
        <h1>Página não encontrada</h1>
        <p>O endereço informado não existe ou não está disponível para o seu perfil.</p>
        <Button type="button" onClick={() => router.push("/")}>
          Voltar ao dashboard
        </Button>
      </div>
    </section>
  );
}
