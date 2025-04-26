import {
  adapterConfig, errorConfig,
  typeConfig,
} from 'configs'
import { dbUtil } from 'utils'

export interface Common {
  id: number;
  receiver: string;
  response: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Raw extends Common {
  success: number;
}

export interface Record extends Common {
  success: boolean;
}

export interface PaginatedRecords {
  logs: Record[];
  count: number;
}

export interface Create {
  success: number;
  receiver: string;
  response: string;
  content: string;
}

const TableName = adapterConfig.TableName.SmsLog

export const convertToRecord = (raw: Raw): Record => ({
  ...raw,
  success: !!raw.success,
})

export const getAll = async (
  db: D1Database,
  option?: {
    search?: typeConfig.Search;
    pagination?: typeConfig.Pagination;
  },
): Promise<Record[]> => {
  const stmt = dbUtil.d1SelectAllQuery(
    db,
    TableName,
    {
      ...option,
      sort: {
        column: 'id',
        order: 'DESC',
      },
    },
  )
  const { results: logs }: { results: Raw[] } = await stmt.all()
  return logs.map((raw) => convertToRecord(raw))
}

export const count = async (db: D1Database): Promise<number> => {
  const query = `SELECT COUNT(*) as count FROM ${TableName} where "deletedAt" IS NULL`
  const stmt = db.prepare(query)
  const result = await stmt.first() as { count: number }
  return Number(result.count)
}

export const getById = async (
  db: D1Database,
  id: number,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE id = $1 AND "deletedAt" IS NULL`

  const stmt = db.prepare(query)
    .bind(id)
  const log = await stmt.first() as Raw | null
  return log ? convertToRecord(log) : null
}

export const create = async (
  db: D1Database, create: Create,
): Promise<true> => {
  const query = `INSERT INTO ${TableName} (success, receiver, response, content) values ($1, $2, $3, $4)`
  const stmt = db.prepare(query).bind(
    create.success,
    create.receiver,
    create.response,
    create.content,
  )
  const result = await dbUtil.d1Run(stmt)
  if (!result.success) throw new errorConfig.InternalServerError()
  return true
}

export const destroy = async (
  db: D1Database,
  date: string,
) => {
  const query = `DELETE FROM ${TableName} WHERE "createdAt" < $1`
  const stmt = db.prepare(query).bind(date)
  const result = await dbUtil.d1Run(stmt)
  if (!result.success) throw new errorConfig.InternalServerError()
  return true
}
