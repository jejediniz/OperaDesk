"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/toastContext";
import { criarUsuario } from "@/services/api/usuariosApi";
import { Button, Input, PageHeader, Select } from "@/components/ui";

export default function UsuarioNovo() {
  const router = useRouter();
  const toast = useToast();
  const [erro, setErro] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    tipo: "comum",
    admin: false,
    ativo: true
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.nome || !form.email || !form.senha) {
      setErro("Nome, email e senha são obrigatórios");
      return;
    }

    setErro(null);
    setSalvando(true);
    try {
      await criarUsuario(form);
      toast.success("Usuário criado com sucesso.");
      router.push("/usuarios");
    } catch (error) {
      setErro(error.message || "Erro ao criar usuário");
      toast.error(error.message || "Erro ao criar usuário.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="usuario-novo-page">
      <div className="usuario-novo-page__column">
        <PageHeader
          title="Novo usuário"
          subtitle="Cadastre acesso e permissões para alguém passar a usar o OperaDesk."
          actions={
            <Link href="/usuarios" className="btn btn-secondary btn-md">
              Voltar à lista
            </Link>
          }
        />

        <form
          onSubmit={handleSubmit}
          className="form-card form-card--standalone form-card--usuario-novo"
        >
          {erro && <div className="alert alert-error">{erro}</div>}

          <div className="form-section">
            <h3 className="form-section__eyebrow">Identificação</h3>
            <Input
              label="Nome"
              name="nome"
              placeholder="Nome completo"
              value={form.nome}
              onChange={handleChange}
              required
              autoComplete="name"
            />

            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="email@exemplo.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />

            <Input
              label="Senha inicial"
              type="password"
              name="senha"
              placeholder="Mínimo seguro recomendado: 8+ caracteres"
              value={form.senha}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-section form-section--bordered">
            <h3 className="form-section__eyebrow" id="sec-perfil">
              Perfil no sistema
            </h3>
            <p className="form-section__hint">
              Quem é <strong>Comum</strong> abre chamados; técnico de <strong>TI</strong> atende a
              fila. Use <strong>Administrador</strong> só para quem precisa gerenciar usuários e
              permissões amplas.
            </p>

            <Select label="Tipo de usuário" name="tipo" value={form.tipo} onChange={handleChange}>
              <option value="comum">Solicitante (comum)</option>
              <option value="ti">Técnico de TI</option>
            </Select>

            <div className="usuario-novo-checkboxes" role="group" aria-labelledby="sec-perfil">
              <label className="checkbox-field">
                <input type="checkbox" name="admin" checked={form.admin} onChange={handleChange} />
                <span>Administrador (acesso de gestão global)</span>
              </label>

              <label className="checkbox-field">
                <input type="checkbox" name="ativo" checked={form.ativo} onChange={handleChange} />
                <span>Conta ativa (pode acessar o sistema)</span>
              </label>
            </div>
          </div>

          <div className="form-actions form-actions--usuario-novo">
            <Button type="submit" variant="primary" disabled={salvando}>
              {salvando ? "Salvando..." : "Criar usuário"}
            </Button>
            <Link href="/usuarios" className="btn btn-ghost btn-md">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
