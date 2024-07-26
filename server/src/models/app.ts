import { ClientType } from 'shared'
import { adapterConfig } from 'configs'
import {
  formatUtil,
  validateUtil,
} from 'utils'

export interface Common {
  id: number;
  clientId: string;
  name: string;
  type: ClientType;
  secret: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Raw extends Common {
  redirectUris: string;
}

export interface Record extends Common {
  redirectUris: string[];
}

export interface ApiRecord extends Record {
  scopes?: string[];
}

export interface Create {
  name: string;
  type: ClientType;
  redirectUris: string;
}

export interface Update {
  redirectUris?: string;
  deletedAt?: string | null;
}

const TableName = adapterConfig.TableName.App

const format = (raw: Raw): Record => {
  return {
    ...raw,
    redirectUris: raw.redirectUris ? raw.redirectUris.split(',') : [],
  }
}

export const convertToApiRecord = (
  record: Record,
  scopes: string[] | null,
): ApiRecord => {
  const result: ApiRecord = record
  if (scopes) result.scopes = scopes

  return result
}

export const getByClientId = async (
  db: D1Database, clientId: string,
) => {
  const stmt = db.prepare(`SELECT * FROM ${TableName} WHERE clientId = $1 AND deletedAt IS NULL`).bind(clientId)
  const app = await stmt.first() as Raw | null
  if (!app) return app

  return format(app)
}

export const getAll = async (
  db: D1Database, includeDeleted: boolean = false,
) => {
  let query = `SELECT * FROM ${TableName}`
  if (!includeDeleted) query = `${query} WHERE deletedAt IS NULL`
  const stmt = db.prepare(query)
  const { results: apps }: { results: Raw[] } = await stmt.all()
  return apps.map((app) => format(app))
}

export const getById = async (
  db: D1Database, id: number, includeDeleted: boolean = false,
) => {
  let query = `SELECT * FROM ${TableName} WHERE id = $1`
  if (!includeDeleted) query = `${query} AND deletedAt IS NULL`
  const stmt = db.prepare(query).bind(id)
  const app = await stmt.first() as Raw | null
  if (!app) return app

  return format(app)
}

export const create = async (
  db: D1Database, create: Create,
) => {
  const query = `INSERT INTO ${TableName} (name, type, redirectUris) values ($1, $2, $3)`
  const stmt = db.prepare(query).bind(
    create.name,
    create.type,
    create.redirectUris,
  )
  const result = await validateUtil.d1Run(stmt)
  if (!result.success) return null
  const id = result.meta.last_row_id
  return getById(
    db,
    id,
  )
}

export const update = async (
  db: D1Database, id: number, update: Update,
) => {
  const updateKeys: (keyof Update)[] = [
    'redirectUris', 'deletedAt',
  ]
  const stmt = formatUtil.d1UpdateQuery(
    db,
    TableName,
    id,
    updateKeys,
    update,
  )

  const result = await validateUtil.d1Run(stmt)
  if (!result.success) return null
  return getById(
    db,
    id,
  )
}
