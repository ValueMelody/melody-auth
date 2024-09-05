import { ClientType } from 'shared'
import {
  adapterConfig, errorConfig,
} from 'configs'
import { dbUtil } from 'utils'

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
  isActive: number;
}

export interface Record extends Common {
  redirectUris: string[];
  isActive: boolean;
}

export interface ApiRecord extends Record {
  scopes: string[];
}

export interface Create {
  name: string;
  type: ClientType;
  redirectUris: string;
}

export interface Update {
  name?: string;
  redirectUris?: string;
  isActive?: number;
  deletedAt?: string | null;
  updatedAt?: string;
}

const TableName = adapterConfig.TableName.App

const format = (raw: Raw): Record => {
  return {
    ...raw,
    isActive: !!raw.isActive,
    redirectUris: raw.redirectUris ? raw.redirectUris.split(',') : [],
  }
}

export const getByClientId = async (
  db: D1Database, clientId: string,
): Promise<Record | null> => {
  const stmt = db.prepare(`SELECT * FROM ${TableName} WHERE "clientId" = $1 AND "deletedAt" IS NULL`).bind(clientId)
  const app = await stmt.first() as Raw | null
  if (!app) return null

  return format(app)
}

export const getAll = async (db: D1Database): Promise<Record[]> => {
  const query = `SELECT * FROM ${TableName} WHERE "deletedAt" IS NULL ORDER BY id ASC`
  const stmt = db.prepare(query)
  const { results: apps }: { results: Raw[] } = await stmt.all()
  return apps.map((app) => format(app))
}

export const getById = async (
  db: D1Database, id: number,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE id = $1 AND "deletedAt" IS NULL`
  const stmt = db.prepare(query).bind(id)
  const app = await stmt.first() as Raw | null
  if (!app) return app

  return format(app)
}

export const create = async (
  db: D1Database, create: Create,
): Promise<Record> => {
  const query = `INSERT INTO ${TableName} (name, type, "redirectUris") values ($1, $2, $3)`
  const stmt = db.prepare(query).bind(
    create.name,
    create.type,
    create.redirectUris,
  )
  const result = await dbUtil.d1Run(stmt)
  if (!result.success) throw new errorConfig.InternalServerError()
  const id = result.meta.last_row_id
  const record = await getById(
    db,
    id,
  )
  if (!record) throw new errorConfig.InternalServerError()
  return record
}

export const update = async (
  db: D1Database, id: number, update: Update,
): Promise<Record> => {
  const updateKeys: (keyof Update)[] = [
    'name', 'redirectUris', 'isActive', 'deletedAt', 'updatedAt',
  ]
  const stmt = dbUtil.d1UpdateQuery(
    db,
    TableName,
    id,
    updateKeys,
    update,
  )

  const result = await dbUtil.d1Run(stmt)
  if (!result.success) throw new errorConfig.InternalServerError()
  const record = await getById(
    db,
    id,
  )
  if (!record) throw new errorConfig.InternalServerError()
  return record
}

export const remove = async (
  db: D1Database, id: number,
): Promise<true> => {
  const stmt = dbUtil.d1SoftDeleteQuery(
    db,
    TableName,
    id,
  )

  await dbUtil.d1Run(stmt)
  return true
}
