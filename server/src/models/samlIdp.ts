import {
  adapterConfig, errorConfig,
} from 'configs'
import { dbUtil } from 'utils'

export interface Record {
  id: number;
  name: string;
  userIdAttribute: string;
  emailAttribute: string | null;
  firstNameAttribute: string | null;
  lastNameAttribute: string | null;
  metadata: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Create {
  name: string;
  userIdAttribute: string;
  emailAttribute: string | null;
  firstNameAttribute: string | null;
  lastNameAttribute: string | null;
  metadata: string;
}

const TableName = adapterConfig.TableName.SamlIdp

export const getById = async (
  db: D1Database,
  id: number,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE id = $1 AND "deletedAt" IS NULL`

  const stmt = db.prepare(query)
    .bind(id)
  const sp = await stmt.first() as Record | null
  return sp
}

export const getByName = async (
  db: D1Database,
  name: string,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE name = $1 AND "deletedAt" IS NULL`

  const stmt = db.prepare(query)
    .bind(name)
  const sp = await stmt.first() as Record | null
  return sp
}

export const create = async (
  db: D1Database, create: Create,
): Promise<Record> => {
  const query = `INSERT INTO ${TableName} (name, userIdAttribute, emailAttribute, firstNameAttribute, lastNameAttribute, metadata) values ($1, $2, $3, $4, $5, $6)`
  const stmt = db.prepare(query).bind(
    create.name,
    create.userIdAttribute,
    create.emailAttribute,
    create.firstNameAttribute,
    create.lastNameAttribute,
    create.metadata,
  )
  const result = await dbUtil.d1Run(stmt)
  if (!result.success) throw new errorConfig.InternalServerError()
  const id = result.meta.last_row_id

  const record = await getById(
    db,
    id,
  )
  if (!record) throw new errorConfig.InternalServerError()
  return record
}
