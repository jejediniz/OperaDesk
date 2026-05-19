"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/authContext";
import AlternarTema from "./AlternarTema";
import AlterarSenhaModal from "@/features/auth/AlterarSenhaModal";

export default function Cabecalho() {
  const { estaAutenticado, logout, usuario } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);
  const [navAberta, setNavAberta] = useState(false);
  const [senhaModalAberta, setSenhaModalAberta] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const firstItemRef = useRef(null);

  const isAdmin = usuario?.admin === true;
  const isTi = usuario?.tipo === "ti";

  const linkClass = (href, exact = false) => {
    const isActive = exact ? pathname === href : pathname?.startsWith(href);
    return `nav-btn${isActive ? " active" : ""}`;
  };

  async function handleLogout() {
    setMenuAberto(false);
    await logout();
    router.push("/login");
  }

  useEffect(() => {
    setNavAberta(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuAberto) return;

    function handleClickFora(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setMenuAberto(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuAberto(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleClickFora);
    document.addEventListener("keydown", handleKeyDown);

    const focusTimer = window.setTimeout(() => {
      firstItemRef.current?.focus();
    }, 0);

    return () => {
      document.removeEventListener("mousedown", handleClickFora);
      document.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [menuAberto]);

  useEffect(() => {
    if (!navAberta) return;
    function onKey(event) {
      if (event.key === "Escape") setNavAberta(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [navAberta]);

  if (!estaAutenticado) return null;

  const nomeUsuario = usuario?.nome?.trim() || usuario?.email || "Usuário";
  const primeiroNome = nomeUsuario.split(" ")[0];
  const iniciais =
    nomeUsuario
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase() ?? "")
      .join("") || "?";
  const papelUsuario = isAdmin ? "Administrador" : isTi ? "Técnico TI" : "Solicitante";

  return (
    <header className="app-header">
      <a href="#main-content" className="skip-link">
        Ir para o conteúdo principal
      </a>
      <div className="app-header__bg" aria-hidden="true" />
      <div className="app-header__top app-header__top--split app-header__top--fullbleed">
        <div className="app-header__top-left">
          <button
            type="button"
            className={`nav-toggle${navAberta ? " is-open" : ""}`}
            aria-label={navAberta ? "Fechar menu de navegação" : "Abrir menu de navegação"}
            aria-expanded={navAberta}
            aria-controls="navegacao-principal"
            onClick={() => setNavAberta((aberta) => !aberta)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>

          <Link
            href="/"
            className="app-header__brand app-header__brand--wordmark"
            aria-label="OperaDesk, ir ao início"
          >
            <span className="app-header__logo-scale">
              <Image
                src="/img/operadesk-wordmark-dark-ui.png"
                width={2515}
                height={689}
                alt=""
                aria-hidden="true"
                className="brand-logo brand-logo--header-wordmark"
                sizes="(max-width: 768px) min(52vw, 220px) 240px"
                priority
              />
            </span>
          </Link>
        </div>

        <div
          id="navegacao-principal"
          className={`app-header__nav-wrap app-header__nav-wrap--bar${navAberta ? " is-open" : ""}`}
        >
          <nav className="top-nav" aria-label="Navegação principal">
            <Link href="/" className={linkClass("/", true)}>
              Dashboard
            </Link>

            <Link href="/abrir-chamado" className={linkClass("/abrir-chamado")}>
              Abrir Chamado
            </Link>

            {(isTi || isAdmin) && (
              <Link href="/chamados" className={linkClass("/chamados")}>
                Gestão de Chamados
              </Link>
            )}

            {(isTi || isAdmin) && (
              <Link href="/ativos" className={linkClass("/ativos")}>
                Patrimônio
              </Link>
            )}

            <Link href="/meus-chamados" className={linkClass("/meus-chamados")}>
              Meus Chamados
            </Link>

            {isAdmin && (
              <Link href="/usuarios" className={linkClass("/usuarios")}>
                Usuários
              </Link>
            )}
          </nav>
        </div>

        <div className="app-header__actions">
          <div className="theme-switch-field">
            <span className="theme-switch-field__label" aria-hidden>
              Escuro
            </span>
            <AlternarTema className="theme-switch--header" />
          </div>

          <div className="user-menu" ref={containerRef}>
            <button
              type="button"
              ref={triggerRef}
              className="user-chip user-chip--button"
              aria-haspopup="menu"
              aria-expanded={menuAberto}
              onClick={() => setMenuAberto((aberto) => !aberto)}
            >
              <span className="user-chip__avatar" aria-hidden="true">
                {iniciais}
              </span>
              <span className="user-chip__info">
                <span className="user-chip__name">{primeiroNome}</span>
                <span className="user-chip__role">{papelUsuario}</span>
              </span>
              <span className="user-chip__caret" aria-hidden="true">
                ▾
              </span>
            </button>

            {menuAberto && (
              <div className="user-menu__dropdown" role="menu">
                <div className="user-menu__header">
                  <span className="user-menu__name">{nomeUsuario}</span>
                  {usuario?.email && <span className="user-menu__email">{usuario.email}</span>}
                  <span
                    className={`user-menu__role-badge user-menu__role-badge--${
                      isAdmin ? "admin" : isTi ? "ti" : "comum"
                    }`}
                  >
                    {papelUsuario}
                  </span>
                </div>
                <div className="user-menu__divider" role="separator" />
                <button
                  type="button"
                  ref={firstItemRef}
                  role="menuitem"
                  className="user-menu__item"
                  onClick={() => {
                    setMenuAberto(false);
                    setSenhaModalAberta(true);
                  }}
                >
                  Alterar senha
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="user-menu__item user-menu__item--danger"
                  onClick={handleLogout}
                >
                  <span aria-hidden="true">⏻</span>
                  Sair da conta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {navAberta && (
        <div
          className="app-header__nav-backdrop"
          aria-hidden="true"
          onClick={() => setNavAberta(false)}
        />
      )}
      <AlterarSenhaModal open={senhaModalAberta} onClose={() => setSenhaModalAberta(false)} />
    </header>
  );
}
