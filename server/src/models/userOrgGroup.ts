import { adapterConfig } from 'configs'
import { dbUtil } from 'utils'

export interface Record {
  id: number;
  userId: number;
  orgGroupId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface RecordWithGroupName extends Record {
  orgGroupName: string;
}

export interface UserOrgGroup {
  orgGroupId: number;
  orgGroupName: string;
}

export interface Create {
  userId: number;
  orgGroupId: number;
}

const TableName = adapterConfig.TableName.UserOrgGroup

export const create = async (
  db: D1Database, create: Create,
): Promise<true> => {
  const query = `INSERT INTO ${TableName} ("userId", "orgGroupId") values ($1, $2)`
  const stmt = db.prepare(query).bind(
    create.userId,
    create.orgGroupId,
  )
  const result = await dbUtil.d1Run(stmt)
  return result.success
}

export const getAllByUser = async (
  db: D1Database, userId: number,
): Promise<RecordWithGroupName[]> => {
  const query = `
    SELECT ${TableName}.*, ${adapterConfig.TableName.OrgGroup}.name as "orgGroupName"
    FROM ${TableName} LEFT JOIN ${adapterConfig.TableName.OrgGroup}
      ON ${adapterConfig.TableName.OrgGroup}.id = ${TableName}."orgGroupId"
    WHERE "userId" = $1 AND ${TableName}."deletedAt" IS NULL
  `
  const stmt = db.prepare(query)
    .bind(userId)
  const { results: userOrgGroups }: { results: RecordWithGroupName[] } = await stmt.all()
  return userOrgGroups
}

export const getAllByOrgGroup = async (
  db: D1Database, orgGroupId: number,
): Promise<Record[]> => {
  const query = `
    SELECT * FROM ${TableName} WHERE "orgGroupId" = $1 AND "deletedAt" IS NULL
  `
  const stmt = db.prepare(query)
    .bind(orgGroupId)
  const { results: userOrgGroups }: { results: Record[] } = await stmt.all()
  return userOrgGroups
}

export const getByUserAndOrgGroup = async (
  db: D1Database,
  userId: number,
  orgGroupId: number,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE "userId" = $1 AND "orgGroupId" = $2 AND "deletedAt" IS NULL`

  const stmt = db.prepare(query)
    .bind(
      userId,
      orgGroupId,
    )
  const userOrgGroup = await stmt.first() as Record | null
  return userOrgGroup
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

export const removeByUser = async (
  db: D1Database, userId: number,
): Promise<true> => {
  const stmt = dbUtil.d1SoftDeleteQuery(
    db,
    TableName,
    userId,
    'userId',
  )

  await dbUtil.d1Run(stmt)
  return true
}
