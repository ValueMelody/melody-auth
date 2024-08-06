import { adapterConfig } from 'configs'
import {
  formatUtil,
  timeUtil,
  validateUtil,
} from 'utils'

export interface Record {
  id: number;
  userId: number;
  appId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface RecordWithAppName extends Record {
  appName: string;
}

export interface ConsentedApp {
  appId: number;
  appName: string;
}

export interface Create {
  userId: number;
  appId: number;
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
): Promise<true> => {
  const query = `INSERT INTO ${TableName} (userId, appId) values ($1, $2)`
  const stmt = db.prepare(query).bind(
    create.userId,
    create.appId,
  )
  const result = await validateUtil.d1Run(stmt)
  return result.success
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

export const getAllByUser = async (
  db: D1Database, userId: number,
): Promise<RecordWithAppName[]> => {
  const query = `
    SELECT ${TableName}.*, ${adapterConfig.TableName.App}.name as appName
    FROM ${TableName} LEFT JOIN ${adapterConfig.TableName.App}
      ON ${adapterConfig.TableName.App}.id = ${TableName}.appId
    WHERE userId = $1 AND ${TableName}.deletedAt IS NULL
  `
  const stmt = db.prepare(query)
    .bind(userId)
  const { results: appConsents }: { results: RecordWithAppName[] } = await stmt.all()
  return appConsents
}

export const removeByUser = async (
  db: D1Database, userId: number,
): Promise<true> => {
  const stmt = formatUtil.d1SoftDeleteQuery(
    db,
    TableName,
    userId,
    'userId',
  )

  await validateUtil.d1Run(stmt)
  return true
}

export const removeByUserAndApp = async (
  db: D1Database, userId: number, appId: number,
): Promise<true> => {
  const query = `UPDATE ${TableName} SET deletedAt = $1 WHERE userId = $2 AND appId = $3`
  const stmt = db.prepare(query).bind(
    timeUtil.getDbCurrentTime(),
    userId,
    appId,
  )

  await validateUtil.d1Run(stmt)
  return true
}
