import { useTheme } from "../contextos/themeContext";

export default function AlternarTema({ className = "" }) {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      className={`theme-switch ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={
        isDark
          ? "Tema escuro ativo. Alternar para tema claro."
          : "Tema claro. Alternar para tema escuro."
      }
    >
      <span className="theme-switch__track">
        <span className="theme-switch__thumb" />
      </span>
    </button>
  );
}
