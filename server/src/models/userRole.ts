import { adapterConfig } from 'configs'
import {
  formatUtil,
  validateUtil,
} from 'utils'

export interface Record {
  id: number;
  userId: number;
  roleId: number;
  roleName: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Update {
  deletedAt?: string | null;
}

export interface Create {
  userId: number;
  roleId: number;
}

const TableName = adapterConfig.TableName.UserRole

export const getAllByUserId = async (
  db: D1Database,
  userId: number,
  includeDeleted: boolean = false,
) => {
  let query = `
    SELECT ${TableName}.id, ${TableName}.userId,
    ${TableName}.roleId, ${adapterConfig.TableName.Role}.name as roleName,
    ${TableName}.createdAt, ${TableName}.updatedAt,
    ${TableName}.deletedAt
    FROM ${TableName} LEFT JOIN ${adapterConfig.TableName.Role}
      ON ${adapterConfig.TableName.Role}.id = ${TableName}.roleId
    WHERE userId = $1
  `
  if (!includeDeleted) query = `${query} AND ${TableName}.deletedAt IS NULL`

  const stmt = db.prepare(query)
    .bind(userId)
  const { results: userRoles }: { results: Record[] } = await stmt.all()
  return userRoles
}

export const create = async (
  db: D1Database, create: Create,
) => {
  const query = `INSERT INTO ${TableName} (userId, roleId) values ($1, $2)`
  const stmt = db.prepare(query).bind(
    create.userId,
    create.roleId,
  )
  const result = await validateUtil.d1Run(stmt)
  return result.success
}

export const update = async (
  db: D1Database, id: number, update: Update,
) => {
  const updateKeys: (keyof Update)[] = [
    'deletedAt',
  ]
  const stmt = formatUtil.d1UpdateQuery(
    db,
    TableName,
    id,
    updateKeys,
    update,
  )

  const result = await validateUtil.d1Run(stmt)
  return result.success
}
