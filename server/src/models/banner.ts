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
  isActive: number;
}

export interface Record extends Common {
  locales: {
    locale: string;
    value: string;
  }[];
  isActive: boolean;
}

export interface ApiRecord extends Record {
  appIds: number[];
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

  return {
    ...raw,
    locales,
    isActive: !!raw.isActive,
  }
}

export const getAll = async (db: D1Database): Promise<Record[]> => {
  const query = `SELECT * FROM ${TableName} WHERE "deletedAt" IS NULL ORDER BY id ASC`

  const stmt = db.prepare(query)
  const { results: banners }: { results: Raw[] } = await stmt.all()
  return banners.map((banner) => format(banner))
}

export const getById = async (
  db: D1Database,
  id: number,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE id = $1 AND "deletedAt" IS NULL`
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
  return true
}
