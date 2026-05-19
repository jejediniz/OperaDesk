import { describe, it, expect } from "vitest";

const policies = require("../../src/server/auth/policies");

const admin = { id: 1, admin: true, tipo: "ti" };
const tecnico = { id: 2, admin: false, tipo: "ti" };
const comum = { id: 3, admin: false, tipo: "comum" };

describe("policies", () => {
  it("isAdmin/isTi/isTiOuAdmin", () => {
    expect(policies.isAdmin(admin)).toBe(true);
    expect(policies.isAdmin(tecnico)).toBe(false);
    expect(policies.isTi(tecnico)).toBe(true);
    expect(policies.isTi(comum)).toBe(false);
    expect(policies.isTiOuAdmin(admin)).toBe(true);
    expect(policies.isTiOuAdmin(tecnico)).toBe(true);
    expect(policies.isTiOuAdmin(comum)).toBe(false);
  });

  it("canViewChamado: dono ou TI/admin podem ver", () => {
    const chamado = { usuario_id: 3 };
    expect(policies.canViewChamado(comum, chamado)).toBe(true);
    expect(policies.canViewChamado(admin, chamado)).toBe(true);
    expect(policies.canViewChamado(tecnico, chamado)).toBe(true);
    expect(policies.canViewChamado(comum, { usuario_id: 999 })).toBe(false);
    expect(policies.canViewChamado(comum, null)).toBe(false);
  });

  it("canDeleteAnyChamado é só admin", () => {
    expect(policies.canDeleteAnyChamado(admin)).toBe(true);
    expect(policies.canDeleteAnyChamado(tecnico)).toBe(false);
    expect(policies.canDeleteAnyChamado(comum)).toBe(false);
  });

  it("canUpdateAnyChamado é restrito a usuários TI", () => {
    expect(policies.canUpdateAnyChamado(tecnico)).toBe(true);
    expect(policies.canUpdateAnyChamado(comum)).toBe(false);
  });

  it("canViewInternalNotes/canCreateInternalNote: TI ou admin", () => {
    expect(policies.canViewInternalNotes(admin)).toBe(true);
    expect(policies.canViewInternalNotes(tecnico)).toBe(true);
    expect(policies.canViewInternalNotes(comum)).toBe(false);
    expect(policies.canCreateInternalNote(comum)).toBe(false);
  });
});
