import { Context } from 'hono'
import { env } from 'hono/adapter'
import { typeConfig } from 'configs'
import { timeUtil } from 'utils'

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
  option?: {
    pagination?: typeConfig.Pagination;
    search?: typeConfig.Search;
  },
): D1PreparedStatement => {
  const pagination = option?.pagination
  const search = option?.search

  let num = 1
  const bind = []
  let searchCondition = ''
  let paginatedCondition = ''

  if (search) {
    searchCondition = `AND ${search.column} LIKE $${num++}`
    bind.push(search.value)
  }

  if (pagination) {
    paginatedCondition = `Limit $${num++} OFFSET $${num++}`
    bind.push(pagination.pageSize)
    bind.push((pagination.pageNumber - 1) * pagination.pageSize)
  }

  const query = `SELECT * FROM ${tableName} WHERE deletedAt IS NULL ${searchCondition} ORDER BY id ASC ${paginatedCondition}`

  const stmt = bind.length
    ? db.prepare(query).bind(...bind)
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
  const validKeys: string[] = []
  createKeys.forEach((key) => {
    const value = createObj[key]
    if (value !== undefined) {
      validKeys.push(key)
      createValues.push(`$${validKeys.length}`)
      createBinds.push(createObj[key])
    }
  })
  const query = `INSERT INTO ${tableName} (${validKeys.join(',')}) values (${createValues.join(',')})`

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
