"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConfirm } from "@/contexts/confirmContext";
import { useToast } from "@/contexts/toastContext";
import { listarUsuarios, excluirUsuario } from "@/services/api/usuariosApi";
import { EmptyState, Input, PageHeader, Select } from "@/components/ui";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(null);
  const [busca, setBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [menuAbertoId, setMenuAbertoId] = useState(null);
  const { confirm } = useConfirm();
  const toast = useToast();
  const menuRef = useRef(null);
  const menuButtonRefs = useRef({});
  const menuItemRefs = useRef({});

  async function carregarUsuarios() {
    setCarregando(true);
    setErro(null);
    try {
      const data = await listarUsuarios();
      setUsuarios(data);
    } catch (error) {
      setErro(error.message || "Erro ao carregar usuários");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const fecharMenu = useCallback(() => {
    const idAtual = menuAbertoId;
    setMenuAbertoId(null);
    if (idAtual && menuButtonRefs.current[idAtual]) {
      menuButtonRefs.current[idAtual].focus();
    }
  }, [menuAbertoId]);

  useEffect(() => {
    if (!menuAbertoId) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        fecharMenu();
      }
    }

    function handlePointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        fecharMenu();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    const primeiroItem = menuItemRefs.current[menuAbertoId];
    if (primeiroItem) {
      primeiroItem.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [menuAbertoId, fecharMenu]);

  async function handleExcluir(id) {
    const confirmado = await confirm({
      title: "Excluir usuário",
      description: "Essa ação remove o usuário do sistema. Deseja continuar?",
      confirmLabel: "Excluir"
    });
    if (!confirmado) return;
    setErro(null);
    setSucesso(null);
    try {
      await excluirUsuario(id);
      setSucesso("Usuário excluído com sucesso");
      carregarUsuarios();
      toast.success("Usuário excluído com sucesso.");
    } catch (error) {
      setErro(error.message || "Erro ao excluir usuário");
      toast.error(error.message || "Erro ao excluir usuário.");
    }
  }

  function abrirMenu(id) {
    setMenuAbertoId((atual) => (atual === id ? null : id));
  }

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return usuarios.filter((usuario) => {
      const correspondeBusca =
        !termo ||
        [usuario.nome, usuario.email, usuario.tipo]
          .filter(Boolean)
          .some((valor) => valor.toLowerCase().includes(termo));

      const correspondeTipo = tipoFiltro === "todos" || usuario.tipo === tipoFiltro;

      const correspondeStatus =
        statusFiltro === "todos" || (statusFiltro === "ativos" ? usuario.ativo : !usuario.ativo);

      return correspondeBusca && correspondeTipo && correspondeStatus;
    });
  }, [busca, statusFiltro, tipoFiltro, usuarios]);

  const usuariosAdmin = usuarios.filter((usuario) => usuario.admin).length;
  const usuariosTi = usuarios.filter((usuario) => usuario.tipo === "ti").length;
  const usuariosAtivos = usuarios.filter((usuario) => usuario.ativo).length;

  return (
    <div>
      <PageHeader
        title="Usuários"
        subtitle="Visualize a equipe e as permissões."
        actions={
          <Link href="/usuarios/novo" className="btn btn-primary btn-md">
            Novo usuário
          </Link>
        }
      />

      <div className="table-card">
        <div className="table-header">
          <div>
            <strong>Equipe cadastrada</strong>
            <p className="table-header__subtitle">
              Busque ou filtre por perfil e status. Para cadastrar, use o botão acima.
            </p>
          </div>
        </div>

        {(erro || sucesso) && (
          <div className="table-card__alerts">
            {erro && <div className="alert alert-error">{erro}</div>}
            {sucesso && <div className="alert alert-success">{sucesso}</div>}
          </div>
        )}

        <div className="table-actions">
          <div className="table-search-row table-search-row--users">
            <Input
              label="Buscar usuários"
              hideLabel
              className="table-search"
              placeholder="Buscar por nome, email ou perfil"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            <Select
              label="Tipo"
              hideLabel
              className="table-filter table-filter--compact"
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
            >
              <option value="todos">Todos os perfis</option>
              <option value="comum">Comum</option>
              <option value="ti">TI</option>
            </Select>

            <Select
              label="Status"
              hideLabel
              className="table-filter table-filter--compact"
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
            >
              <option value="todos">Todos os status</option>
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
            </Select>
          </div>
        </div>

        <div className="table-toolbar">
          <div className="table-toolbar__summary">
            <strong>{usuariosFiltrados.length}</strong>
            <span>
              de {usuarios.length} usuário{usuarios.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="table-toolbar__stats">
            <span className="mini-stat">
              <strong>{usuariosAtivos}</strong>
              <span>ativos</span>
            </span>
            <span className="mini-stat">
              <strong>{usuariosTi}</strong>
              <span>TI</span>
            </span>
            <span className="mini-stat">
              <strong>{usuariosAdmin}</strong>
              <span>admins</span>
            </span>
          </div>
        </div>

        <table className="chamados-table usuarios-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Tipo</th>
              <th>Admin</th>
              <th>Ativo</th>
              <th className="acoes-col">Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregando && (
              <tr>
                <td colSpan="6">Carregando...</td>
              </tr>
            )}
            {!carregando && usuariosFiltrados.length === 0 && (
              <tr>
                <td colSpan="6">
                  <EmptyState
                    title="Nenhum usuário encontrado"
                    description="Tente ajustar a busca ou os filtros para localizar alguém da equipe."
                  />
                </td>
              </tr>
            )}
            {usuariosFiltrados.map((u) => {
              const primeiroItemRef = (node) => {
                if (node) menuItemRefs.current[u.id] = node;
              };

              return (
                <tr key={u.id}>
                  <td data-label="Nome">
                    <strong className="cell-title">{u.nome}</strong>
                    {u.admin && <div className="secondary-text">Administrador</div>}
                  </td>
                  <td data-label="Email">{u.email}</td>
                  <td data-label="Tipo">
                    <span className={`role-badge role-badge--${u.tipo}`}>
                      {u.tipo === "ti" ? "TI" : "Comum"}
                    </span>
                  </td>
                  <td data-label="Admin">
                    <span
                      className={`role-badge ${u.admin ? "role-badge--admin" : "role-badge--neutral"}`}
                    >
                      {u.admin ? "Sim" : "Não"}
                    </span>
                  </td>
                  <td data-label="Ativo">
                    <span
                      className={`role-badge ${u.ativo ? "role-badge--active" : "role-badge--inactive"}`}
                    >
                      {u.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td data-label="Ações" className="cell-actions">
                    <div
                      className="acoes-menu"
                      ref={(node) => {
                        if (menuAbertoId === u.id) {
                          menuRef.current = node;
                        }
                      }}
                    >
                      <button
                        type="button"
                        className="acoes-trigger"
                        aria-haspopup="menu"
                        aria-expanded={menuAbertoId === u.id}
                        aria-controls={`acoes-menu-usuario-${u.id}`}
                        onClick={() => abrirMenu(u.id)}
                        ref={(node) => {
                          if (node) menuButtonRefs.current[u.id] = node;
                        }}
                      >
                        <span className="sr-only">Abrir ações</span>
                        <span aria-hidden="true">⋮</span>
                      </button>

                      {menuAbertoId === u.id && (
                        <div
                          id={`acoes-menu-usuario-${u.id}`}
                          role="menu"
                          className="acoes-dropdown"
                        >
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              fecharMenu();
                              handleExcluir(u.id);
                            }}
                            ref={primeiroItemRef}
                          >
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
