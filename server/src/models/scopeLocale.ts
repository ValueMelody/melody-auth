import { adapterConfig } from 'configs'
import {
  formatUtil,
  validateUtil,
} from 'utils'

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

export const create = async (
  db: D1Database, create: Create,
): Promise<true> => {
  const query = `INSERT INTO ${TableName} (scopeId, locale, value) values ($1, $2, $3)`
  const stmt = db.prepare(query).bind(
    create.scopeId,
    create.locale,
    create.value.trim(),
  )
  const result = await validateUtil.d1Run(stmt)
  return result.success
}

export const getAllByScope = async (
  db: D1Database, scopeId: number,
): Promise<Record[]> => {
  const query = `SELECT * FROM ${TableName} WHERE scopeId = $1 AND deletedAt IS NULL`
  const stmt = db.prepare(query).bind(scopeId)
  const { results: scopeLocales }: { results: Record[] } = await stmt.all()
  return scopeLocales
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
