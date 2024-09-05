import {
  adapterConfig, errorConfig,
} from 'configs'
import { dbUtil } from 'utils'

export interface Record {
  id: number;
  scopeId: number;
  locale: string;
  value: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Create {
  scopeId: number;
  locale: string;
  value: string;
}

const TableName = adapterConfig.TableName.ScopeLocale

export const getById = async (
  db: D1Database,
  id: number,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE id = $1 AND "deletedAt" IS NULL`

  const stmt = db.prepare(query)
    .bind(id)
  const scope = await stmt.first() as Record | null
  return scope
}

export const create = async (
  db: D1Database, create: Create,
): Promise<Record> => {
  const query = `INSERT INTO ${TableName} ("scopeId", locale, value) values ($1, $2, $3)`
  const stmt = db.prepare(query).bind(
    create.scopeId,
    create.locale,
    create.value.trim(),
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

export const getAllByScope = async (
  db: D1Database, scopeId: number,
): Promise<Record[]> => {
  const query = `SELECT * FROM ${TableName} WHERE "scopeId" = $1 AND "deletedAt" IS NULL`
  const stmt = db.prepare(query).bind(scopeId)
  const { results: scopeLocales }: { results: Record[] } = await stmt.all()
  return scopeLocales
}

export const remove = async (
  db: D1Database, scopeId: number,
): Promise<true> => {
  const stmt = dbUtil.d1SoftDeleteQuery(
    db,
    TableName,
    scopeId,
    'scopeId',
  )

  await dbUtil.d1Run(stmt)
  return true
}
