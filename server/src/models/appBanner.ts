import {
  adapterConfig, errorConfig,
} from 'configs'
import { dbUtil } from 'utils'

export interface Record {
  id: number;
  bannerId: number;
  appId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Create {
  bannerId: number;
  appId: number;
}

export interface Update {
  deletedAt?: string;
}

const TableName = adapterConfig.TableName.AppBanner

export const getAll = async (db: D1Database): Promise<Record[]> => {
  const query = `SELECT * FROM ${TableName} WHERE "deletedAt" IS NULL ORDER BY id ASC`

  const stmt = db.prepare(query)
  const { results: appBanners }: { results: Record[] } = await stmt.all()
  return appBanners
}

export const getById = async (
  db: D1Database, id: number,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE id = $1 AND "deletedAt" IS NULL`

  const stmt = db.prepare(query)
    .bind(id)
  const appBanner = await stmt.first() as Record | null
  return appBanner
}

export const getAllByBannerId = async (
  db: D1Database, bannerId: number,
): Promise<Record[]> => {
  const query = `SELECT * FROM ${TableName} WHERE "deletedAt" IS NULL AND "bannerId" = $1 ORDER BY id ASC`

  const stmt = db.prepare(query).bind(bannerId)
  const { results: appBanners }: { results: Record[] } = await stmt.all()
  return appBanners
}

export const getAllByAppId = async (
  db: D1Database, appId: number,
): Promise<Record[]> => {
  const query = `SELECT * FROM ${TableName} WHERE "deletedAt" IS NULL AND "appId" = $1 ORDER BY id ASC`

  const stmt = db.prepare(query).bind(appId)
  const { results: appBanners }: { results: Record[] } = await stmt.all()
  return appBanners
}

export const create = async (
  db: D1Database, create: Create,
): Promise<Record> => {
  const query = `INSERT INTO "${TableName}" ("bannerId", "appId") values ($1, $2)`
  const stmt = db.prepare(query).bind(
    create.bannerId,
    create.appId,
  )
  const result = await dbUtil.d1Run(stmt)
  if (!result.success) throw new errorConfig.InternalServerError()
  const id = result.meta.last_row_id

  const record = await getById(
    db,
    id,
  )
  if (!record) throw new errorConfig.InternalServerError()
  return record
}

export const removeByBannerId = async (
  db: D1Database, bannerId: number,
): Promise<true> => {
  const stmt1 = dbUtil.d1SoftDeleteQuery(
    db,
    TableName,
    bannerId,
    'bannerId',
  )

  await dbUtil.d1Run(stmt1)
  return true
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
