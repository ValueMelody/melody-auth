import { ClientType } from 'shared'
import {
  adapterConfig, errorConfig,
} from 'configs'
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
  updatedAt?: string;
  deletedAt?: string | null;
}

const TableName = adapterConfig.TableName.Scope

export const getAll = async (db: D1Database): Promise<Record[]> => {
  const query = `SELECT * FROM ${TableName} WHERE deletedAt IS NULL ORDER BY id ASC`
  const stmt = db.prepare(query)
  const { results: scopes }: { results: Record[] } = await stmt.all()
  return scopes
}

export const getById = async (
  db: D1Database,
  id: number,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE id = $1 AND deletedAt IS NULL`

  const stmt = db.prepare(query)
    .bind(id)
  const scope = await stmt.first() as Record | null
  return scope
}

export const create = async (
  db: D1Database, create: Create,
): Promise<Record> => {
  const query = `INSERT INTO ${TableName} (name, type) values ($1, $2)`
  const stmt = db.prepare(query).bind(
    create.name,
    create.type,
  )
  const result = await validateUtil.d1Run(stmt)
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
    'name', 'deletedAt', 'updatedAt',
  ]
  const stmt = formatUtil.d1UpdateQuery(
    db,
    TableName,
    id,
    updateKeys,
    update,
  )

  const result = await validateUtil.d1Run(stmt)
  if (!result.success) throw new errorConfig.InternalServerError()
  const record = await getById(
    db,
    id,
  )
  if (!record) throw new errorConfig.InternalServerError()
  return record
}
