import { NavLink } from "react-router-dom";
import { useAuth } from "../contextos/authContext";
import { Button } from "../components/ui";

export default function Cabecalho() {
  const { estaAutenticado, logout, usuario } = useAuth();

  const isAdmin = usuario?.admin === true;
  const isTi = usuario?.tipo === "ti";

  const linkClass = ({ isActive }) =>
    `nav-btn${isActive ? " active" : ""}`;

  if (!estaAutenticado) return null;

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__title">
          <img
            src="/img/logo.png"
            alt="Deskora"
            className="brand-logo brand-logo--header"
          />
          <p className="app-header__subtitle">
            Gerencie solicitações, acompanhe o time e mantenha a TI agil.
          </p>
        </div>

        <nav className="top-nav">
          <NavLink to="/" className={linkClass}>
            Dashboard
          </NavLink>

          {(isTi || isAdmin) && (
            <NavLink to="/chamados" className={linkClass}>
              Gestão de Chamados
            </NavLink>
          )}

          <NavLink to="/abrir-chamado" className={linkClass}>
            Abrir Chamado
          </NavLink>

          <NavLink to="/meus-chamados" className={linkClass}>
            Meus Chamados
          </NavLink>

          {isAdmin && (
            <NavLink to="/usuarios" className={linkClass}>
              Usuários
            </NavLink>
          )}
          <Button variant="ghost" className="nav-btn logout" onClick={logout}>
            Sair
          </Button>
        </nav>
      </div>
    </header>
  );
}
