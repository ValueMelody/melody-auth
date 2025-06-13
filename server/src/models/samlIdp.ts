import {
  adapterConfig, errorConfig,
} from 'configs'
import { dbUtil } from 'utils'

export interface Common {
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

export interface Record extends Common {
  isActive: boolean;
}

export interface Raw extends Common {
  isActive: number;
}

export interface Create {
  name: string;
  userIdAttribute: string;
  emailAttribute: string | null;
  firstNameAttribute: string | null;
  lastNameAttribute: string | null;
  metadata: string;
}

export interface Update {
  name?: string;
  isActive?: number;
  userIdAttribute?: string;
  emailAttribute?: string | null;
  firstNameAttribute?: string | null;
  lastNameAttribute?: string | null;
  metadata?: string;
}

const TableName = adapterConfig.TableName.SamlIdp

const toRecord = (raw: Raw): Record => {
  return {
    ...raw,
    isActive: !!raw.isActive,
  }
}

export const getAll = async (db: D1Database): Promise<Record[]> => {
  const query = `SELECT * FROM ${TableName} WHERE "deletedAt" IS NULL ORDER BY id ASC`
  const stmt = db.prepare(query)
  const { results: idps }: { results: Raw[] } = await stmt.all()
  return idps.map(toRecord)
}

export const getById = async (
  db: D1Database,
  id: number,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE id = $1 AND "deletedAt" IS NULL`

  const stmt = db.prepare(query)
    .bind(id)
  const sp = await stmt.first() as Raw | null
  return sp ? toRecord(sp) : null
}

export const getByName = async (
  db: D1Database,
  name: string,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE name = $1 AND "deletedAt" IS NULL`

  const stmt = db.prepare(query)
    .bind(name)
  const sp = await stmt.first() as Raw | null
  return sp ? toRecord(sp) : null
}

export const create = async (
  db: D1Database, create: Create,
): Promise<Record> => {
  const query = `INSERT INTO ${TableName} (name, "isActive", "userIdAttribute", "emailAttribute", "firstNameAttribute", "lastNameAttribute", metadata) values ($1, $2, $3, $4, $5, $6, $7)`
  const stmt = db.prepare(query).bind(
    create.name,
    1,
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

export const update = async (
  db: D1Database, id: number, update: Update,
): Promise<Record> => {
  const updateKeys: (keyof Update)[] = [
    'userIdAttribute', 'emailAttribute', 'firstNameAttribute', 'lastNameAttribute', 'metadata',
    'isActive',
  ]
  const stmt = dbUtil.d1UpdateQuery(
    db,
    TableName,
    id,
    updateKeys,
    update,
  )

  const result = await dbUtil.d1Run(stmt)
  if (!result.success) throw new errorConfig.InternalServerError()
  const record = await getById(
    db,
    id,
  )
  if (!record) throw new errorConfig.InternalServerError()
  return record
}

export const remove = async (
  db: D1Database, id: number,
): Promise<true> => {
  const stmt = dbUtil.d1SoftDeleteQuery(
    db,
    TableName,
    id,
  )

  await dbUtil.d1Run(stmt)
  return true
}
