import { Context } from 'hono'
import { typeConfig } from 'configs'
import { timeUtil } from 'utils'

export const stripEndingSlash = (val: string) => {
  return val.replace(
    /\/$/,
    '',
  )
}

export const getQueryString = (c: Context<typeConfig.Context>) => c.req.url.split('?')[1]

export const d1UpdateQuery = (
  db: D1Database,
  tableName: string,
  id: number,
  updateKeys: string[],
  updateObj: any,
) => {
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
