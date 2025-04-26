import {
  adapterConfig, errorConfig,
  typeConfig,
} from 'configs'
import { dbUtil } from 'utils'

export interface Record {
  id: number;
  userId: number;
  ip: string | null;
  detail: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PaginatedRecords {
  logs: Record[];
  count: number;
}

export interface Create {
  userId: number;
  ip: string | null;
  detail: string | null;
}

const TableName = adapterConfig.TableName.SignInLog

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
  const { results: logs }: { results: Record[] } = await stmt.all()
  return logs
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
  const log = await stmt.first() as Record | null
  return log
}

export const create = async (
  db: D1Database, create: Create,
): Promise<true> => {
  const query = `INSERT INTO ${TableName} ("userId", ip, detail) values ($1, $2, $3)`
  const stmt = db.prepare(query).bind(
    create.userId,
    create.ip,
    create.detail,
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
