import { adapterConfig } from 'configs'
import {
  dbUtil,
  timeUtil,
} from 'utils'

export interface Common {
  id: number;
  userId: number;
  appId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Raw extends Common {
  scopes: string;
}

export interface Record extends Common {
  scopes: string[];
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
  scopes: string[];
}

const TableName = adapterConfig.TableName.UserAppConsent

const format = (raw: Raw): Record => {
  try {
    const scopes = JSON.parse(raw.scopes)
    return {
      ...raw,
      scopes: Array.isArray(scopes)
        ? scopes.filter((scope): scope is string => typeof scope === 'string')
        : [],
    }
  } catch {
    return {
      ...raw,
      scopes: [],
    }
  }
}

export const create = async (
  db: D1Database, create: Create,
): Promise<true> => {
  const query = `INSERT INTO ${TableName} ("userId", "appId", "scopes") values ($1, $2, $3)`
  const stmt = db.prepare(query).bind(
    create.userId,
    create.appId,
    JSON.stringify(create.scopes),
  )
  const result = await dbUtil.d1Run(stmt)
  return result.success
}

export const getByUserAndApp = async (
  db: D1Database, userId: number, appId: number,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE "userId" = $1 AND "appId" = $2 AND "deletedAt" IS NULL`
  const stmt = db.prepare(query)
    .bind(
      userId,
      appId,
    )
  const consent = await stmt.first() as Raw | null
  return consent ? format(consent) : null
}

export const getAllByUser = async (
  db: D1Database, userId: number,
): Promise<RecordWithAppName[]> => {
  const query = `
    SELECT ${TableName}.*, ${adapterConfig.TableName.App}.name as "appName"
    FROM ${TableName} LEFT JOIN ${adapterConfig.TableName.App}
      ON ${adapterConfig.TableName.App}.id = ${TableName}."appId"
    WHERE "userId" = $1 AND ${TableName}."deletedAt" IS NULL
  `
  const stmt = db.prepare(query)
    .bind(userId)
  const { results: appConsents }: { results: (Raw & { appName: string })[] } = await stmt.all()
  return appConsents.map((appConsent) => ({
    ...format(appConsent),
    appName: appConsent.appName,
  }))
}

export const updateScopesByUserAndApp = async (
  db: D1Database, userId: number, appId: number, scopes: string[],
): Promise<true> => {
  const query = `
    UPDATE ${TableName}
    SET "scopes" = $1, "updatedAt" = $2
    WHERE "userId" = $3 AND "appId" = $4 AND "deletedAt" IS NULL
  `
  const stmt = db.prepare(query).bind(
    JSON.stringify(scopes),
    timeUtil.getDbCurrentTime(),
    userId,
    appId,
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

export const removeByUserAndApp = async (
  db: D1Database, userId: number, appId: number,
): Promise<true> => {
  const query = `UPDATE ${TableName} SET "deletedAt" = $1 WHERE "userId" = $2 AND "appId" = $3`
  const stmt = db.prepare(query).bind(
    timeUtil.getDbCurrentTime(),
    userId,
    appId,
  )

  await dbUtil.d1Run(stmt)
  return true
}
