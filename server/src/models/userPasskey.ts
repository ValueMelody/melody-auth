import {
  adapterConfig, errorConfig,
} from 'configs'
import { dbUtil } from 'utils'

export interface Record {
  id: number;
  userId: number;
  credentialId: string;
  publicKey: string;
  counter: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Update {
  counter?: number;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface Create {
  userId: number;
  credentialId: string;
  publicKey: string;
  counter: number;
}

const TableName = adapterConfig.TableName.UserPasskey

export const create = async (
  db: D1Database, create: Create,
): Promise<true> => {
  const query = `INSERT INTO ${TableName} ("userId", "credentialId", "publicKey", "counter") values ($1, $2, $3, $4)`
  const stmt = db.prepare(query).bind(
    create.userId,
    create.credentialId,
    create.publicKey,
    create.counter,
  )
  const result = await dbUtil.d1Run(stmt)
  return result.success
}

export const getByUser = async (
  db: D1Database, userId: number,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE "userId" = $1 AND "deletedAt" IS NULL`
  const stmt = db.prepare(query)
    .bind(userId)
  const passkey = await stmt.first() as Record | null
  return passkey ?? null
}

export const update = async (
  db: D1Database, id: number, update: Update,
): Promise<boolean> => {
  const updateKeys: (keyof Update)[] = [
    'counter', 'updatedAt', 'deletedAt',
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
  return result.success
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
