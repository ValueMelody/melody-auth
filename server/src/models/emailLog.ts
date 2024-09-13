import {
  adapterConfig, errorConfig,
} from 'configs'
import { dbUtil } from 'utils'

export interface Create {
  success: number;
  receiver: string;
  response: string;
  content: string;
}

const TableName = adapterConfig.TableName.EmailLog

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
