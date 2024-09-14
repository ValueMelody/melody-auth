import {
  adapterConfig, errorConfig,
} from 'configs'
import { dbUtil } from 'utils'

export interface Create {
  ip: string | null;
  detail: string | null;
}

const TableName = adapterConfig.TableName.SignInLog

export const create = async (
  db: D1Database, create: Create,
): Promise<true> => {
  const query = `INSERT INTO ${TableName} (ip, detail) values ($1, $2)`
  const stmt = db.prepare(query).bind(
    create.ip,
    create.detail,
  )
  const result = await dbUtil.d1Run(stmt)
  if (!result.success) throw new errorConfig.InternalServerError()
  return true
}
