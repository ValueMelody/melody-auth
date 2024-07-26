import { ClientType } from 'shared'
import { adapterConfig } from 'configs'
import {
  formatUtil,
  validateUtil,
} from 'utils'

export interface Record {
  id: number;
  name: string;
  type: ClientType;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Create {
  name: string;
  type: ClientType;
}

export interface Update {
  name?: string;
  deletedAt?: string | null;
}

const TableName = adapterConfig.TableName.Scope

export const getAll = async (
  db: D1Database, includeDeleted: boolean = false,
) => {
  let query = `SELECT * FROM ${TableName}`
  if (!includeDeleted) query = `${query} WHERE deletedAt IS NULL`
  const stmt = db.prepare(query)
  const { results: scopes }: { results: Record[] } = await stmt.all()
  return scopes
}

export const getById = async (
  db: D1Database,
  id: number,
  includeDeleted: boolean = false,
) => {
  let query = `SELECT * FROM ${TableName} WHERE id = $1`
  if (!includeDeleted) query = `${query} AND deletedAt IS NULL`

  const stmt = db.prepare(query)
    .bind(id)
  const scope = await stmt.first() as Record | null
  return scope
}

export const create = async (
  db: D1Database, create: Create,
) => {
  const query = `INSERT INTO ${TableName} (name, type) values ($1, $2)`
  const stmt = db.prepare(query).bind(
    create.name,
    create.type,
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
    'name', 'deletedAt',
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
