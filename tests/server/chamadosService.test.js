import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const chamadosRepository = require('../../src/server/repositories/chamadosRepository')
const chamadosService = require('../../src/server/services/chamadosService')

describe('chamadosService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('list aplica filtro de usuário para usuários comuns', async () => {
    const spy = vi
      .spyOn(chamadosRepository, 'listWithFilters')
      .mockResolvedValue({ items: [], total: 0 })

    await chamadosService.list(7, {
      listarTodos: false,
      filtros: { status: 'aberto', page: '1', limit: '10' }
    })

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        usuarioId: 7,
        status: 'aberto',
        page: 1,
        limit: 10
      })
    )
  })

  it('list nega quando usuário comum tenta filtrar por outro usuarioId', async () => {
    await expect(
      chamadosService.list(7, {
        listarTodos: false,
        filtros: { usuarioId: '8' }
      })
    ).rejects.toMatchObject({ statusCode: 403 })
  })

  it('update bloqueia atribuição de técnico quando não permitido', async () => {
    await expect(
      chamadosService.update(
        1,
        { tecnicoId: 9 },
        7,
        { atualizarQualquer: false, podeAtribuir: false }
      )
    ).rejects.toMatchObject({ statusCode: 403 })
  })

  it('update passa usuarioId quando não é atualização ampla', async () => {
    const spy = vi
      .spyOn(chamadosRepository, 'atualizarComDetalhes')
      .mockResolvedValue({ id: 1, status: 'em_andamento' })

    const result = await chamadosService.update(
      1,
      { status: 'em_andamento' },
      7,
      { atualizarQualquer: false, podeAtribuir: false }
    )

    expect(spy).toHaveBeenCalledWith(
      1,
      { status: 'em_andamento' },
      { usuarioId: 7 }
    )
    expect(result?.id).toBe(1)
  })

  it('update passa usuarioId=null em atualização ampla (TI/admin)', async () => {
    const spy = vi
      .spyOn(chamadosRepository, 'atualizarComDetalhes')
      .mockResolvedValue({ id: 1 })

    await chamadosService.update(
      1,
      { status: 'concluido' },
      7,
      { atualizarQualquer: true, podeAtribuir: true }
    )

    expect(spy).toHaveBeenCalledWith(
      1,
      { status: 'concluido' },
      { usuarioId: null }
    )
  })
})
