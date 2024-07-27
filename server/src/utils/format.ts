import { Context } from 'hono'
import { typeConfig } from 'configs'
import { timeUtil } from 'utils'

export const stripEndingSlash = (val: string): string => {
  return val.replace(
    /\/$/,
    '',
  )
}

export const getQueryString = (c: Context<typeConfig.Context>): string => c.req.url.split('?')[1]

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
    createValues.push(`$${index + 1}`)
    createBinds.push(createObj[key])
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
