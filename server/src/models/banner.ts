import {
  adapterConfig, errorConfig,
} from 'configs'
import { dbUtil } from 'utils'

export interface Common {
  id: number;
  type: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Raw extends Common {
  locales: string;
  appIds: string;
  isActive: number;
}

export interface Record extends Common {
  locales: {
    locale: string;
    value: string;
  }[];
  appIds: number[];
  isActive: boolean;
}

export interface Create {
  type: string;
  text?: string;
  locales?: string;
}

export interface Update {
  type?: string;
  text?: string;
  locales?: string;
  isActive?: number;
  deletedAt?: string;
  updatedAt?: string;
}

const TableName = adapterConfig.TableName.Banner

export const format = (raw: Raw): Record => {
  const localeJson = raw.locales ? JSON.parse(raw.locales) : {}
  const locales = Object.keys(localeJson).map((locale) => ({
    locale,
    value: localeJson[locale],
  }))
  console.log(raw)
  const appIds = raw.appIds ? raw.appIds.split(',').map(Number) : []
  return {
    ...raw,
    locales,
    appIds,
    isActive: !!raw.isActive,
  }
}

export const getAll = async (db: D1Database): Promise<Record[]> => {
  const query = `
    SELECT ${TableName}.id, ${TableName}.type, ${TableName}.text, ${TableName}.locales, ${TableName}."isActive",
    ${TableName}."createdAt", ${TableName}."updatedAt", ${TableName}."deletedAt",
    GROUP_CONCAT(${adapterConfig.TableName.AppBanner}."appId") as "appIds"
    FROM ${TableName}
    LEFT JOIN ${adapterConfig.TableName.AppBanner}
      ON ${TableName}.id = ${adapterConfig.TableName.AppBanner}."bannerId"
      AND ${adapterConfig.TableName.AppBanner}."deletedAt" IS NULL
    WHERE ${TableName}."deletedAt" IS NULL
    GROUP BY ${TableName}.id
    ORDER BY ${TableName}.id ASC
  `
  const stmt = db.prepare(query)
  const { results: banners }: { results: Raw[] } = await stmt.all()
  return banners.map((banner) => format(banner))
}

export const getById = async (
  db: D1Database,
  id: number,
): Promise<Record | null> => {
  const query = `
    SELECT ${TableName}.id, ${TableName}.type, ${TableName}.text, ${TableName}.locales, ${TableName}."isActive",
    ${TableName}."createdAt", ${TableName}."updatedAt", ${TableName}."deletedAt",
    GROUP_CONCAT(${adapterConfig.TableName.AppBanner}."appId") as "appIds"
    FROM ${TableName}
    LEFT JOIN ${adapterConfig.TableName.AppBanner}
      ON ${adapterConfig.TableName.AppBanner}."bannerId" = ${TableName}.id
      AND ${adapterConfig.TableName.AppBanner}."deletedAt" IS NULL
    WHERE ${TableName}."deletedAt" IS NULL AND ${TableName}.id = $1
    GROUP BY ${TableName}.id
  `
  const stmt = db.prepare(query)
    .bind(id)
  const banner = await stmt.first() as Raw | null
  return banner ? format(banner) : null
}

export const create = async (
  db: D1Database, create: Create,
): Promise<Record> => {
  const query = `INSERT INTO "${TableName}" (type, text, locales) values ($1, $2, $3)`
  const stmt = db.prepare(query).bind(
    create.type,
    create.text ?? null,
    create.locales ?? null,
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

export const update = async (
  db: D1Database, id: number, update: Update,
): Promise<Record> => {
  const updateKeys: (keyof Update)[] = [
    'type', 'text', 'locales', 'isActive',
    'deletedAt', 'updatedAt',
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
  const record = await getById(
    db,
    id,
  )
  if (!record) throw new errorConfig.InternalServerError()
  return record
}

export const remove = async (
  db: D1Database, id: number,
): Promise<true> => {
  const stmt1 = dbUtil.d1SoftDeleteQuery(
    db,
    TableName,
    id,
  )

  await dbUtil.d1Run(stmt1)

  const stmt2 = dbUtil.d1SoftDeleteQuery(
    db,
    adapterConfig.TableName.AppBanner,
    id,
    'bannerId',
  )
  await dbUtil.d1Run(stmt2)

  return true
}
