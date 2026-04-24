import { PRIORIDADE_LABEL, STATUS_LABEL } from "../../config/chamados";

export default function ChamadoRow({
  chamado,
  selecionado,
  isTi,
  isAdmin,
  menuAberto,
  onAlternarSelecao,
  onToggleMenu,
  onFecharMenu,
  onAbrirConversa,
  onAssumir,
  onEditar,
  onConcluir,
  onRemover,
  menuRef,
  buttonRef,
  primeiroItemRef,
}) {
  const podeConcluir =
    (isTi || isAdmin) && !["concluido", "fechado"].includes(chamado.status);
  const temAcoes = isTi || isAdmin;

  function withFechar(handler) {
    return () => {
      onFecharMenu();
      handler();
    };
  }

  return (
    <article className="management-row">
      <div className="management-row__select">
        <input
          type="checkbox"
          aria-label={`Selecionar chamado ${chamado.titulo}`}
          checked={selecionado}
          onChange={() => onAlternarSelecao(chamado.id)}
        />
      </div>

      <div className="management-row__status">
        <span className={`status status-${chamado.status}`}>
          {STATUS_LABEL[chamado.status]}
        </span>
      </div>

      <div className="management-row__priority">
        <span className={`prioridade-badge prioridade-${chamado.prioridade}`}>
          {PRIORIDADE_LABEL[chamado.prioridade] || chamado.prioridade}
        </span>
      </div>

      <div className="management-row__requester">
        <strong>{chamado.solicitante?.nome || "—"}</strong>
        {chamado.setor && (
          <div className="secondary-text">Setor: {chamado.setor}</div>
        )}
        {chamado.solicitante?.tipo && (
          <div className="secondary-text">{chamado.solicitante.tipo}</div>
        )}
      </div>

      <div className="management-row__title">
        <strong className="cell-title">{chamado.titulo}</strong>
        <div className="secondary-text">ID #{chamado.id}</div>
      </div>

      <div className="management-row__tech">
        <strong>{chamado.tecnico?.nome || "—"}</strong>
      </div>

      <div className="management-row__actions">
        {temAcoes ? (
          <div
            className="acoes-menu"
            ref={(node) => {
              if (menuAberto) menuRef.current = node;
            }}
          >
            <button
              type="button"
              className="acoes-trigger"
              aria-haspopup="menu"
              aria-expanded={menuAberto}
              aria-controls={`acoes-menu-${chamado.id}`}
              onClick={() => onToggleMenu(chamado.id)}
              ref={buttonRef}
            >
              <span className="sr-only">Abrir ações</span>
              <span aria-hidden="true">⋮</span>
            </button>

            {menuAberto && (
              <div
                id={`acoes-menu-${chamado.id}`}
                role="menu"
                className="acoes-dropdown"
              >
                {isTi && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={withFechar(() => onAbrirConversa(chamado))}
                    ref={primeiroItemRef}
                  >
                    Conversa
                  </button>
                )}
                {isTi && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={withFechar(() => onAssumir(chamado.id))}
                  >
                    Assumir
                  </button>
                )}
                {isAdmin && !isTi && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={withFechar(() => onAbrirConversa(chamado))}
                    ref={primeiroItemRef}
                  >
                    Conversa
                  </button>
                )}
                {isTi && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={withFechar(() => onEditar(chamado))}
                  >
                    Editar
                  </button>
                )}
                {podeConcluir && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={withFechar(() => onConcluir(chamado.id))}
                    ref={!isTi ? primeiroItemRef : null}
                  >
                    Concluir
                  </button>
                )}
                {isAdmin && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={withFechar(() => onRemover(chamado.id))}
                    ref={!isTi && !podeConcluir ? primeiroItemRef : null}
                  >
                    Excluir
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <span className="secondary-text">—</span>
        )}
      </div>
    </article>
  );
}
