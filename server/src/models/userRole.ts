import { adapterConfig } from 'configs'
import {
  timeUtil, validateUtil,
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
  const setQueries: string[] = []
  const binds = []

  const parsedUpdate = {
    ...update,
    updatedAt: timeUtil.getDbCurrentTime(),
  }
  const updateKeys: (keyof Update)[] = [
    'deletedAt',
  ]
  updateKeys.forEach((key) => {
    const value = parsedUpdate[key]
    if (value === undefined) return
    setQueries.push(`${key} = $${setQueries.length + 1}`)
    binds.push(value)
  })

  binds.push(id)
  const query = `UPDATE ${TableName} set ${setQueries.join(',')} where id = $${setQueries.length + 1}`
  const stmt = db.prepare(query).bind(...binds)

  const result = await validateUtil.d1Run(stmt)
  return result.success
}
