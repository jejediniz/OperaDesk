export default function Rodape() {
  return (
    <footer className="app-footer">
      <div className="app-footer__inner">
        <span className="app-footer__logo-scale">
          <img
            src="/img/operadesk-symbol-transparent.png"
            width={1360}
            height={1024}
            alt="OperaDesk"
            className="brand-logo brand-logo--footer"
            decoding="async"
          />
        </span>
        <p className="app-footer__text">
          Central de chamados com foco em agilidade, clareza e operação diária.
        </p>
      </div>
    </footer>
  );
}
