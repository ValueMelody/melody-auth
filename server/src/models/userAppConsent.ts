import {
  adapterConfig, errorConfig,
} from 'configs'
import {
  timeUtil, validateUtil,
} from 'utils'

export interface Record {
  id: number;
  userId: number;
  appId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Create {
  userId: number;
  appId: number;
}

export interface Update {
  deletedAt?: string | null;
  updatedAt?: string | null;
}

const TableName = adapterConfig.TableName.UserAppConsent

export const getById = async (
  db: D1Database,
  id: number,
): Promise<Record | null> => {
  const stmt = db.prepare(`SELECT * FROM ${TableName} WHERE id = $1 AND deletedAt IS NULL`)
    .bind(id)
  const consent = await stmt.first() as Record | null
  return consent
}

export const create = async (
  db: D1Database, create: Create,
): Promise<Record> => {
  const query = `INSERT INTO ${TableName} (userId, appId) values ($1, $2)`
  const stmt = db.prepare(query).bind(
    create.userId,
    create.appId,
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
) => {
  const query = `UPDATE ${TableName} set updatedAt = $1, deletedAt = $2 where id = $3`
  const stmt = db.prepare(query).bind(
    timeUtil.getDbCurrentTime(),
    update.deletedAt,
    id,
  )
  const result = await validateUtil.d1Run(stmt)
  if (!result.success) return null
  return getById(
    db,
    id,
  )
}

export const getByUserAndApp = async (
  db: D1Database, userId: number, appId: number,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE userId = $1 AND appId = $2 AND deletedAt IS NULL`
  const stmt = db.prepare(query)
    .bind(
      userId,
      appId,
    )
  const consent = await stmt.first() as Record | null
  return consent
}