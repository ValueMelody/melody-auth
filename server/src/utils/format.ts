import { Context } from 'hono'
import { env } from 'hono/adapter'
import { typeConfig } from 'configs'
import { timeUtil } from 'utils'
import { Pagination } from 'configs/type'

export const stripEndingSlash = (val: string): string => {
  return val.replace(
    /\/$/,
    '',
  )
}

export const getLocaleFromQuery = (
  c: Context<typeConfig.Context>, requestedLocale?: string,
): typeConfig.Locale => {
  const { SUPPORTED_LOCALES: locales } = env(c)
  const locale = requestedLocale?.toLowerCase() ?? ''
  return locales.find((supportedLocale) => supportedLocale === locale) ?? locales[0]
}

export const getQueryString = (c: Context<typeConfig.Context>): string => c.req.url.split('?')[1]

export const d1SelectAllQuery = (
  db: D1Database,
  tableName: string,
  pagination?: Pagination,
): D1PreparedStatement => {
  const paginatedCondition = pagination ? 'Limit $1 OFFSET $2' : ''
  const query = `SELECT * FROM ${tableName} WHERE deletedAt IS NULL ORDER BY id ASC ${paginatedCondition}`
  const stmt = pagination
    ? db.prepare(query).bind(
      pagination.pageSize,
      (pagination.pageNumber - 1) * pagination.pageSize,
    )
    : db.prepare(query)
  return stmt
}

export const d1CreateQuery = (
  db: D1Database,
  tableName: string,
  createKeys: string[],
  createObj: any,
): D1PreparedStatement => {
  const createValues: string[] = []
  const createBinds: (string | null)[] = []
  createKeys.forEach((
    key, index,
  ) => {
    const value = createObj[key]
    if (value !== undefined) {
      createValues.push(`$${index + 1}`)
      createBinds.push(createObj[key])
    }
  })
  const query = `INSERT INTO ${tableName} (${createKeys.join(',')}) values (${createValues.join(',')})`

  const stmt = db.prepare(query).bind(...createBinds)
  return stmt
}

export const d1UpdateQuery = (
  db: D1Database,
  tableName: string,
  id: number,
  updateKeys: string[],
  updateObj: any,
): D1PreparedStatement => {
  const setQueries: string[] = []
  const binds = []

  const parsedUpdate = {
    ...updateObj,
    updatedAt: timeUtil.getDbCurrentTime(),
  }

  updateKeys.forEach((key) => {
    const value = parsedUpdate[key]
    if (value === undefined) return
    setQueries.push(`${key} = $${setQueries.length + 1}`)
    binds.push(value)
  })

  binds.push(id)
  const query = `UPDATE ${tableName} set ${setQueries.join(',')} where id = $${setQueries.length + 1}`
  const stmt = db.prepare(query).bind(...binds)
  return stmt
}

export const d1SoftDeleteQuery = (
  db: D1Database,
  tableName: string,
  id: number,
  key?: string,
): D1PreparedStatement => {
  const query = `UPDATE ${tableName} set deletedAt = $1 where ${key || 'id'} = $2`
  const stmt = db.prepare(query).bind(
    timeUtil.getDbCurrentTime(),
    id,
  )
  return stmt
}
