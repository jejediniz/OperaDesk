import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../contextos/authContext";
import { Button } from "../components/ui";
import AlternarTema from "./AlternarTema";

export default function Cabecalho() {
  const { estaAutenticado, logout, usuario } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAdmin = usuario?.admin === true;
  const isTi = usuario?.tipo === "ti";

  const linkClass = (href, exact = false) => {
    const isActive = exact ? pathname === href : pathname?.startsWith(href);
    return `nav-btn${isActive ? " active" : ""}`;
  };

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  if (!estaAutenticado) return null;

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link href="/" className="app-header__brand">
          <span className="app-header__logo-scale">
            <img
              src="/img/simbolo%20-%20fundo%20transparente.png"
              alt="OperaDesk"
              className="brand-logo brand-logo--header"
            />
          </span>
          <span className="app-header__tagline">
            Central de chamados
          </span>
        </Link>

        <div className="app-header__nav-wrap">
          <nav className="top-nav" aria-label="Navegação principal">
            <Link href="/" className={linkClass("/", true)}>
              Dashboard
            </Link>

            <Link
              href="/abrir-chamado"
              className={`nav-btn nav-btn--primary${pathname === "/abrir-chamado" ? " active" : ""}`}
            >
              Abrir Chamado
            </Link>

            {(isTi || isAdmin) && (
              <Link href="/chamados" className={linkClass("/chamados")}>
                Gestão de Chamados
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
          <Button variant="ghost" className="nav-btn logout" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
