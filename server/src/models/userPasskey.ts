import { adapterConfig } from 'configs'
import { dbUtil } from 'utils'

export interface Record {
  id: number;
  userId: number;
  credentialId: string;
  publicKey: string;
  counter: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Update {
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface Create {
  userId: number;
  credentialId: string;
  publicKey: string;
  counter: number;
}

const TableName = adapterConfig.TableName.UserPasskey

export const create = async (
    db: D1Database, create: Create,
): Promise<true> => {
  const query = `INSERT INTO ${TableName} ("userId", "credentialId", "publicKey", "counter") values ($1, $2, $3, $4)`
  const stmt = db.prepare(query).bind(
    create.userId,
    create.credentialId,
    create.publicKey,
    create.counter,
  )
  const result = await dbUtil.d1Run(stmt)
  return result.success
}

