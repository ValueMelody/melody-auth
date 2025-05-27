import {
  adapterConfig, errorConfig,
} from 'configs'
import { dbUtil } from 'utils'

export interface Record {
  id: number;
  userId: number;
  userAttributeId: number;
  value: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Create {
  userId: number;
  userAttributeId: number;
  value: string;
}

const TableName = adapterConfig.TableName.UserAttributeValue

export const create = async (
  db: D1Database, create: Create,
): Promise<true> => {
  const query = `INSERT INTO ${TableName} ("userId", "userAttributeId", "value") values ($1, $2, $3)`
  const stmt = db.prepare(query).bind(
    create.userId,
    create.userAttributeId,
    create.value,
  )
  const result = await dbUtil.d1Run(stmt)
  if (!result.success) throw new errorConfig.InternalServerError()
  return true
}
