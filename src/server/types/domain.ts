export type UserTipo = 'comum' | 'ti'

export interface UserPublic {
  id: number
  nome: string
  email: string
  tipo: UserTipo
  admin: boolean
  ativo: boolean
  created_at?: string | Date
  updated_at?: string | Date
}

export interface UserRecord extends UserPublic {
  senha_hash: string
}

export type ChamadoStatus =
  | 'aberto'
  | 'em_andamento'
  | 'aguardando_cliente'
  | 'concluido'
  | 'cancelado'

export type ChamadoPrioridade = 'baixa' | 'media' | 'alta' | 'urgente'

export interface ChamadoResumo {
  id: number
  titulo: string
  descricao: string
  status: ChamadoStatus
  prioridade: ChamadoPrioridade
  setor?: string | null
  usuario_id: number
  tecnico_id?: number | null
  created_at: string | Date
  updated_at: string | Date
}

export interface Chamado extends ChamadoResumo {
  solicitante?: Pick<UserPublic, 'id' | 'nome' | 'email'> | null
  tecnico?: Pick<UserPublic, 'id' | 'nome' | 'email'> | null
}

export interface ChamadoInteracao {
  id: number
  chamado_id: number
  autor_id: number
  mensagem: string
  tipo: 'publica' | 'interna'
  created_at: string | Date
  autor?: Pick<UserPublic, 'id' | 'nome' | 'email' | 'tipo' | 'admin'> | null
}

export interface AuthLoginInput {
  email: string
  senha: string
}

export interface AuthLoginResult {
  token: string
  usuario: UserPublic
}

export interface Paginated<T> {
  items: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface HttpError extends Error {
  statusCode: number
  code?: string
  details?: unknown
}
