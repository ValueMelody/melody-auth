import { adapterConfig } from 'configs'
import {
  formatUtil, validateUtil,
} from 'utils'

export interface Record {
  id: number;
  appId: number;
  scopeId: number;
  scopeName: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Create {
  appId: number;
  scopeId: number;
}

export interface Update {
  updatedAt?: string;
  deletedAt?: string | null;
}

const TableName = adapterConfig.TableName.AppScope

export const getAllByAppId = async (
  db: D1Database,
  appId: number,
): Promise<Record[]> => {
  const query = `
    SELECT ${TableName}.id, ${TableName}.appId,
    ${TableName}.scopeId, ${adapterConfig.TableName.Scope}.name as scopeName,
    ${TableName}.createdAt, ${TableName}.updatedAt,
    ${TableName}.deletedAt
    FROM ${TableName} LEFT JOIN ${adapterConfig.TableName.Scope}
      ON ${adapterConfig.TableName.Scope}.id = ${TableName}.scopeId
    WHERE appId = $1 AND ${TableName}.deletedAt IS NULL
  `
  const stmt = db.prepare(query)
    .bind(appId)
  const { results: appScopes }: { results: Record[] } = await stmt.all()
  return appScopes
}

export const create = async (
  db: D1Database, create: Create,
): Promise<true> => {
  const query = `INSERT INTO ${TableName} (appId, scopeId) values ($1, $2)`
  const stmt = db.prepare(query).bind(
    create.appId,
    create.scopeId,
  )
  const result = await validateUtil.d1Run(stmt)
  return result.success
}

export const update = async (
  db: D1Database, id: number, update: Update,
): Promise<true> => {
  const updateKeys: (keyof Update)[] = [
    'deletedAt', 'updatedAt',
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

export const remove = async (
  db: D1Database, scopeId: number,
): Promise<true> => {
  const stmt = formatUtil.d1SoftDeleteQuery(
    db,
    TableName,
    scopeId,
    'scopeId',
  )

  await validateUtil.d1Run(stmt)
  return true
}
