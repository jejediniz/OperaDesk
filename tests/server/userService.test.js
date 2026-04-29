import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import bcrypt from 'bcrypt'

const userRepository = require('../../src/server/repositories/userRepository')
const userService = require('../../src/server/services/userService')

describe('userService.changeOwnPassword', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('atualiza quando a senha atual está correta', async () => {
    const hash = await bcrypt.hash('senha-antiga', 4)
    vi.spyOn(userRepository, 'findCredentialsForPasswordChange').mockResolvedValue({
      id: 1,
      senha_hash: hash,
      ativo: true
    })
    const updateSpy = vi.spyOn(userRepository, 'update').mockResolvedValue({ id: 1 })

    await userService.changeOwnPassword(1, {
      senhaAtual: 'senha-antiga',
      senhaNova: 'nova-senha-123'
    })

    expect(updateSpy).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        senha_hash: expect.any(String)
      })
    )
    expect(updateSpy.mock.calls[0][1].senha_hash).not.toBe(hash)
  })

  it('rejeita quando a senha atual está errada', async () => {
    const hash = await bcrypt.hash('certa', 4)
    vi.spyOn(userRepository, 'findCredentialsForPasswordChange').mockResolvedValue({
      id: 2,
      senha_hash: hash,
      ativo: true
    })

    await expect(
      userService.changeOwnPassword(2, {
        senhaAtual: 'errada',
        senhaNova: 'nova-senha-123'
      })
    ).rejects.toMatchObject({ statusCode: 401 })
  })

  it('rejeita quando nova senha igual à atual', async () => {
    await expect(
      userService.changeOwnPassword(1, {
        senhaAtual: 'mesma123',
        senhaNova: 'mesma123'
      })
    ).rejects.toMatchObject({ statusCode: 400 })
  })
})
