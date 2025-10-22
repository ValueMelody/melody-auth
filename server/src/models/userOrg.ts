import { adapterConfig } from 'configs'
import { dbUtil } from 'utils'

export interface Record {
  id: number;
  userId: number;
  orgId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Create {
  userId: number;
  orgId: number;
}

export interface Update {
  orgId?: number;
  updatedAt?: string;
  deletedAt?: string | null;
}

const TableName = adapterConfig.TableName.UserOrg

export const getByUser = async (
  db: D1Database, userId: number,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE "userId" = $1 AND "deletedAt" IS NULL`
  const stmt = db.prepare(query)
    .bind(userId)
  const userOrg = await stmt.first() as Record | null
  return userOrg
}

export const getByUserAndOrg = async (
  db: D1Database, userId: number, orgId: number,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE "userId" = $1 AND "orgId" = $2 AND "deletedAt" IS NULL`
  const stmt = db.prepare(query)
    .bind(
      userId,
      orgId,
    )
  const userOrg = await stmt.first() as Record | null
  return userOrg
}

export const getAllByUser = async (
  db: D1Database, userId: number,
): Promise<Record[]> => {
  const query = `SELECT * FROM ${TableName} WHERE "userId" = $1 AND "deletedAt" IS NULL`
  const stmt = db.prepare(query)
    .bind(userId)
  const { results: userOrgs }: { results: Record[] } = await stmt.all()
  return userOrgs
}

export const create = async (
  db: D1Database, create: Create,
): Promise<true> => {
  const query = `INSERT INTO ${TableName} ("userId", "orgId") values ($1, $2)`
  const stmt = db.prepare(query).bind(
    create.userId,
    create.orgId,
  )
  const result = await dbUtil.d1Run(stmt)
  return result.success
}

export const update = async (
  db: D1Database, id: number, update: Update,
): Promise<true> => {
  const updateKeys: (keyof Update)[] = [
    'orgId', 'updatedAt', 'deletedAt',
  ]
  const stmt = dbUtil.d1UpdateQuery(
    db,
    TableName,
    id,
    updateKeys,
    update,
  )

  const result = await dbUtil.d1Run(stmt)
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
  const result = await dbUtil.d1Run(stmt)
  return result.success
}
