import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import bcrypt from 'bcrypt'

const userRepository = require('../../src/server/repositories/userRepository')
const authService = require('../../src/server/services/authService')

describe('authService.login', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('retorna token e dados públicos quando as credenciais são válidas', async () => {
    const senhaHash = await bcrypt.hash('admin123', 4)

    vi.spyOn(userRepository, 'findByEmail').mockResolvedValue({
      id: 1,
      nome: 'Admin',
      email: 'admin@operadesk.local',
      senha_hash: senhaHash,
      tipo: 'ti',
      admin: true,
      ativo: true
    })

    const result = await authService.login({
      email: 'admin@operadesk.local',
      senha: 'admin123'
    })

    expect(result.token).toBeTruthy()
    expect(result.usuario).toMatchObject({
      id: 1,
      email: 'admin@operadesk.local',
      admin: true,
      tipo: 'ti'
    })
    expect(result.usuario.senha_hash).toBeUndefined()
  })

  it('falha com 401 quando o usuário não existe', async () => {
    vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(null)

    await expect(
      authService.login({ email: 'x@y.com', senha: '123456' })
    ).rejects.toMatchObject({ statusCode: 401 })
  })

  it('falha com 403 quando o usuário está inativo', async () => {
    vi.spyOn(userRepository, 'findByEmail').mockResolvedValue({
      id: 2,
      email: 'a@b.com',
      senha_hash: 'hash',
      ativo: false
    })

    await expect(
      authService.login({ email: 'a@b.com', senha: '123456' })
    ).rejects.toMatchObject({ statusCode: 403 })
  })

  it('falha com 401 quando a senha está incorreta', async () => {
    const senhaHash = await bcrypt.hash('senha-certa', 4)

    vi.spyOn(userRepository, 'findByEmail').mockResolvedValue({
      id: 3,
      email: 'a@b.com',
      senha_hash: senhaHash,
      ativo: true,
      tipo: 'comum',
      admin: false
    })

    await expect(
      authService.login({ email: 'a@b.com', senha: 'senha-errada' })
    ).rejects.toMatchObject({ statusCode: 401 })
  })
})
