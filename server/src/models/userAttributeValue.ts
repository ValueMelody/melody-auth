import {
  adapterConfig, errorConfig,
} from 'configs'
import { dbUtil } from 'utils'

export interface Record {
  id: number;
  userId: number;
  userAttributeId: number;
  value: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Create {
  userId: number;
  userAttributeId: number;
  value: string;
}

export interface Update {
  value: string;
}

const TableName = adapterConfig.TableName.UserAttributeValue

export const create = async (
  db: D1Database, create: Create,
): Promise<true> => {
  const query = `INSERT INTO ${TableName} ("userId", "userAttributeId", "value") values ($1, $2, $3)`
  const stmt = db.prepare(query).bind(
    create.userId,
    create.userAttributeId,
    create.value,
  )
  const result = await dbUtil.d1Run(stmt)
  if (!result.success) throw new errorConfig.InternalServerError()
  return true
}

export const update = async (
  db: D1Database, id: number, update: Update,
): Promise<true> => {
  const updateKeys: (keyof Update)[] = [
    'value',
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
  return true
}

export const getAllByUserId = async (
  db: D1Database, userId: number,
): Promise<Record[]> => {
  const query = `SELECT * FROM ${TableName} WHERE "userId" = $1 AND "deletedAt" IS NULL`
  const stmt = db.prepare(query).bind(userId)
  const { results: userAttributeValues }: { results: Record[] } = await stmt.all()
  return userAttributeValues
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
