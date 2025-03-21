import {
  errorConfig, messageConfig, typeConfig,
} from 'configs'
import { timeUtil } from 'utils'

export const d1Run = async (stmt: D1PreparedStatement) => {
  try {
    const res = await stmt.run()
    return res
  } catch (e) {
    console.error(e)
    const msg = String(e).includes('UNIQUE constraint failed') ? messageConfig.RequestError.UniqueKey : undefined
    throw new errorConfig.InternalServerError(msg)
  }
}

export const d1SelectAllQuery = (
  db: D1Database,
  tableName: string,
  option?: {
    pagination?: typeConfig.Pagination;
    search?: typeConfig.Search;
    match?: typeConfig.Match;
  },
): D1PreparedStatement => {
  const pagination = option?.pagination
  const search = option?.search
  const match = option?.match
  let num = 1
  const bind = []
  let matchCondition = ''
  let searchCondition = ''
  let paginatedCondition = ''

  if (match) {
    matchCondition = `AND ${match.column} = $${num++}`
    bind.push(match.value)
  }

  if (search) {
    searchCondition = `AND ${search.column} LIKE $${num++}`
    bind.push(search.value)
  }

  if (pagination) {
    paginatedCondition = `Limit $${num++} OFFSET $${num++}`
    bind.push(pagination.pageSize)
    bind.push((pagination.pageNumber - 1) * pagination.pageSize)
  }

  const query = `SELECT * FROM ${tableName} WHERE "deletedAt" IS NULL ${matchCondition} ${searchCondition} ORDER BY id ASC ${paginatedCondition}`

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
  const keys = validKeys.map((key) => `"${key}"`)
  const query = `INSERT INTO ${tableName} (${keys.join(',')}) values (${createValues.join(',')})`

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
    setQueries.push(`"${key}" = $${setQueries.length + 1}`)
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
  const query = `UPDATE ${tableName} set "deletedAt" = $1 where "${key || 'id'}" = $2`
  const stmt = db.prepare(query).bind(
    timeUtil.getDbCurrentTime(),
    id,
  )
  return stmt
}
