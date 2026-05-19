function isAdmin(user) {
  return user?.admin === true;
}

function isTi(user) {
  return user?.tipo === "ti";
}

function isTiOuAdmin(user) {
  return isAdmin(user) || isTi(user);
}

function canListAllChamados(user) {
  return isTiOuAdmin(user);
}

function canViewChamado(user, chamado) {
  if (!chamado) return false;
  if (isTiOuAdmin(user)) return true;
  return Number(chamado.usuario_id) === Number(user?.id);
}

function canUpdateAnyChamado(user) {
  return isTi(user);
}

function canAssignTecnico(user) {
  return isTiOuAdmin(user);
}

function canDeleteAnyChamado(user) {
  return isAdmin(user);
}

function canViewInternalNotes(user) {
  return isTiOuAdmin(user);
}

function canCreateInternalNote(user) {
  return isTiOuAdmin(user);
}

module.exports = {
  canAssignTecnico,
  canCreateInternalNote,
  canDeleteAnyChamado,
  canListAllChamados,
  canUpdateAnyChamado,
  canViewChamado,
  canViewInternalNotes,
  isAdmin,
  isTi,
  isTiOuAdmin
};
