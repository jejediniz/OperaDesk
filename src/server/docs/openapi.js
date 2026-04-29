const {
  PRIORIDADE_VALUES,
  STATUS_VALUES
} = require('../validators/chamadosSchemas')

const ApiResponseEnvelope = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    message: { type: 'string' },
    data: {}
  },
  required: ['success', 'message']
}

const ErrorEnvelope = {
  type: 'object',
  properties: {
    success: { const: false },
    error: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        details: { type: 'array', items: { type: 'object' } }
      },
      required: ['message']
    }
  },
  required: ['success', 'error']
}

const Usuario = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    nome: { type: 'string' },
    email: { type: 'string', format: 'email' },
    tipo: { type: 'string', enum: ['comum', 'ti'] },
    admin: { type: 'boolean' },
    ativo: { type: 'boolean' }
  }
}

const Chamado = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    titulo: { type: 'string' },
    descricao: { type: 'string' },
    status: { type: 'string', enum: STATUS_VALUES },
    prioridade: { type: 'string', enum: PRIORIDADE_VALUES },
    setor: { type: 'string', nullable: true },
    usuario_id: { type: 'integer' },
    tecnico_id: { type: 'integer', nullable: true },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
    solicitante: { $ref: '#/components/schemas/Usuario' },
    tecnico: { $ref: '#/components/schemas/Usuario', nullable: true }
  }
}

const ChamadoMetrics = {
  type: 'object',
  properties: {
    total: { type: 'integer' },
    abertos: { type: 'integer' },
    em_andamento: { type: 'integer' },
    concluidos: { type: 'integer' },
    alta_prioridade_pendentes: { type: 'integer' },
    sem_tecnico: { type: 'integer' }
  }
}

const PaginationMeta = {
  type: 'object',
  properties: {
    page: { type: 'integer' },
    limit: { type: 'integer' },
    total: { type: 'integer' },
    totalPages: { type: 'integer' }
  }
}

const okJson = (description, schemaRef) => ({
  description,
  content: {
    'application/json': {
      schema: schemaRef
        ? {
            allOf: [
              ApiResponseEnvelope,
              { type: 'object', properties: { data: schemaRef } }
            ]
          }
        : ApiResponseEnvelope
    }
  }
})

const errorJson = (description) => ({
  description,
  content: { 'application/json': { schema: ErrorEnvelope } }
})

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'OperaDesk API',
    version: '1.1.0',
    description:
      'API de autenticação, usuários e chamados. Autenticação via cookie httpOnly emitido em /auth/login.'
  },
  servers: [{ url: '/api' }],
  tags: [
    { name: 'Auth' },
    { name: 'Users' },
    { name: 'Chamados' },
    { name: 'Interações' },
    { name: 'Health' }
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check (Postgres + serviço)',
        responses: {
          200: { description: 'Aplicação saudável' },
          503: errorJson('Banco indisponível')
        }
      }
    },
    '/health/live': {
      get: {
        tags: ['Health'],
        summary: 'Liveness probe (sem checagens externas)',
        responses: { 200: { description: 'Aplicação viva' } }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Autenticar usuário',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'senha'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  senha: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: okJson('Login realizado com sucesso', { $ref: '#/components/schemas/Usuario' }),
          400: errorJson('Dados inválidos'),
          401: errorJson('Credenciais inválidas'),
          429: errorJson('Muitas tentativas')
        }
      }
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar usuário (apenas admin)',
        security: [{ cookieAuth: [] }],
        responses: {
          201: okJson('Usuário registrado'),
          401: errorJson('Não autenticado'),
          403: errorJson('Acesso restrito a admin'),
          409: errorJson('Email já cadastrado')
        }
      }
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Encerrar a sessão (limpa o cookie httpOnly)',
        responses: { 204: { description: 'Logout realizado' } }
      }
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Recuperar a sessão atual',
        security: [{ cookieAuth: [] }],
        responses: {
          200: okJson('Sessão válida', { $ref: '#/components/schemas/Usuario' }),
          401: errorJson('Sessão inválida')
        }
      }
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Listar usuários (admin)',
        security: [{ cookieAuth: [] }],
        responses: {
          200: okJson('Usuários listados', {
            type: 'array',
            items: { $ref: '#/components/schemas/Usuario' }
          }),
          403: errorJson('Acesso restrito')
        }
      },
      post: {
        tags: ['Users'],
        summary: 'Criar usuário (admin)',
        security: [{ cookieAuth: [] }],
        responses: {
          201: okJson('Usuário criado', { $ref: '#/components/schemas/Usuario' }),
          409: errorJson('Email já cadastrado')
        }
      }
    },
    '/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Sessão simplificada via cookie',
        security: [{ cookieAuth: [] }],
        responses: { 200: okJson('Acesso autorizado') }
      },
      patch: {
        tags: ['Users'],
        summary: 'Alterar a própria senha',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['senhaAtual', 'senhaNova'],
                properties: {
                  senhaAtual: { type: 'string', minLength: 8 },
                  senhaNova: { type: 'string', minLength: 8, maxLength: 120 }
                }
              }
            }
          }
        },
        responses: {
          200: okJson('Senha atualizada'),
          400: errorJson('Validação ou nova senha inválida'),
          401: errorJson('Senha atual incorreta')
        }
      }
    },
    '/users/tecnicos': {
      get: {
        tags: ['Users'],
        summary: 'Listar técnicos',
        security: [{ cookieAuth: [] }],
        responses: {
          200: okJson('Técnicos listados', {
            type: 'array',
            items: { $ref: '#/components/schemas/Usuario' }
          })
        }
      }
    },
    '/users/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      get: {
        tags: ['Users'],
        security: [{ cookieAuth: [] }],
        summary: 'Buscar usuário por ID (admin)',
        responses: {
          200: okJson('Usuário encontrado', { $ref: '#/components/schemas/Usuario' }),
          404: errorJson('Usuário não encontrado')
        }
      },
      put: {
        tags: ['Users'],
        security: [{ cookieAuth: [] }],
        summary: 'Atualizar usuário (admin)',
        responses: { 200: okJson('Usuário atualizado') }
      },
      delete: {
        tags: ['Users'],
        security: [{ cookieAuth: [] }],
        summary: 'Excluir usuário (admin)',
        responses: { 204: { description: 'Usuário removido' } }
      }
    },
    '/chamados': {
      get: {
        tags: ['Chamados'],
        summary: 'Listar chamados (com paginação, filtros e busca textual)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 200, default: 20 } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: STATUS_VALUES } },
          { name: 'prioridade', in: 'query', schema: { type: 'string', enum: PRIORIDADE_VALUES } },
          { name: 'usuarioId', in: 'query', schema: { type: 'integer', minimum: 1 } },
          {
            name: 'tecnicoId',
            in: 'query',
            description: 'ID do técnico, ou "me" (autenticado) ou "sem" (sem responsável)',
            schema: {
              oneOf: [
                { type: 'integer', minimum: 1 },
                { type: 'string', enum: ['me', 'sem'] }
              ]
            }
          },
          {
            name: 'q',
            in: 'query',
            description: 'Busca textual em título, descrição ou ID',
            schema: { type: 'string', maxLength: 160 }
          }
        ],
        responses: {
          200: {
            description: 'Lista paginada de chamados',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    ApiResponseEnvelope,
                    {
                      type: 'object',
                      properties: {
                        data: { type: 'array', items: { $ref: '#/components/schemas/Chamado' } },
                        meta: { $ref: '#/components/schemas/PaginationMeta' }
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Chamados'],
        summary: 'Criar chamado',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['titulo', 'descricao'],
                properties: {
                  titulo: { type: 'string', minLength: 3, maxLength: 200 },
                  descricao: { type: 'string', minLength: 3, maxLength: 2000 },
                  prioridade: { type: 'string', enum: PRIORIDADE_VALUES },
                  tecnicoId: { type: 'integer', minimum: 1 },
                  setor: { type: 'string', minLength: 2, maxLength: 120 }
                }
              }
            }
          }
        },
        responses: {
          201: okJson('Chamado criado', { $ref: '#/components/schemas/Chamado' }),
          400: errorJson('Dados inválidos')
        }
      }
    },
    '/chamados/metrics': {
      get: {
        tags: ['Chamados'],
        summary: 'Métricas agregadas para o dashboard (escopo conforme papel)',
        security: [{ cookieAuth: [] }],
        responses: {
          200: okJson('Métricas calculadas', { $ref: '#/components/schemas/ChamadoMetrics' })
        }
      }
    },
    '/chamados/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      get: {
        tags: ['Chamados'],
        security: [{ cookieAuth: [] }],
        summary: 'Buscar chamado por ID',
        responses: {
          200: okJson('Chamado encontrado', { $ref: '#/components/schemas/Chamado' }),
          404: errorJson('Chamado não encontrado')
        }
      },
      put: {
        tags: ['Chamados'],
        security: [{ cookieAuth: [] }],
        summary: 'Atualizar chamado',
        responses: {
          200: okJson('Chamado atualizado', { $ref: '#/components/schemas/Chamado' }),
          403: errorJson('Operação não permitida')
        }
      },
      delete: {
        tags: ['Chamados'],
        security: [{ cookieAuth: [] }],
        summary: 'Excluir chamado',
        responses: { 204: { description: 'Chamado removido' } }
      }
    },
    '/chamados/{id}/interacoes': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      get: {
        tags: ['Interações'],
        security: [{ cookieAuth: [] }],
        summary: 'Listar interações do chamado',
        responses: { 200: okJson('Interações listadas') }
      },
      post: {
        tags: ['Interações'],
        security: [{ cookieAuth: [] }],
        summary: 'Criar interação no chamado',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['mensagem'],
                properties: {
                  mensagem: { type: 'string', minLength: 1, maxLength: 4000 },
                  tipo: { type: 'string', enum: ['publica', 'interna'] }
                }
              }
            }
          }
        },
        responses: {
          201: okJson('Interação criada'),
          403: errorJson('Operação não permitida'),
          404: errorJson('Chamado não encontrado')
        }
      }
    }
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'operadesk_session'
      }
    },
    schemas: {
      Usuario,
      Chamado,
      ChamadoMetrics,
      PaginationMeta
    }
  }
}

function renderDocsHtml(jsonUrl) {
  return `<!DOCTYPE html>
  <html lang="pt-BR">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>OperaDesk API Docs</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; background: #f8fafc; color: #111827; }
        main { max-width: 960px; margin: 0 auto; padding: 40px 20px; }
        h1 { margin-bottom: 8px; }
        p { color: #4b5563; line-height: 1.6; }
        pre { background: #0f172a; color: #e2e8f0; padding: 20px; border-radius: 16px; overflow: auto; }
        a { color: #2563eb; }
      </style>
    </head>
    <body>
      <main>
        <h1>OperaDesk API</h1>
        <p>Documentação OpenAPI. Para integração automática, use o arquivo JSON abaixo.</p>
        <p><a href="${jsonUrl}">${jsonUrl}</a></p>
        <pre id="spec">Carregando especificação...</pre>
      </main>
      <script>
        fetch('${jsonUrl}')
          .then((response) => response.json())
          .then((data) => {
            document.getElementById('spec').textContent = JSON.stringify(data, null, 2)
          })
          .catch(() => {
            document.getElementById('spec').textContent = 'Não foi possível carregar a especificação.'
          })
      </script>
    </body>
  </html>`
}

module.exports = {
  spec,
  renderDocsHtml
}
