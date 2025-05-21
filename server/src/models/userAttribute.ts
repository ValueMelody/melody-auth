import { adapterConfig, errorConfig } from 'configs'
import { dbUtil } from 'utils'

export interface Common {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Raw extends Common {
  includeInSignUpForm: number;
  requiredInSignUpForm: number;
  includeInIdTokenBody: number;
  includeInUserInfo: number;
}

export interface Record extends Common {
  includeInSignUpForm: boolean;
  requiredInSignUpForm: boolean;
  includeInIdTokenBody: boolean;
  includeInUserInfo: boolean;
}

export interface Create {
  name: string;
  includeInSignUpForm: number;
  requiredInSignUpForm: number;
  includeInIdTokenBody: number;
  includeInUserInfo: number;
}

export interface Update {
  name?: string;
  includeInSignUpForm?: number;
  requiredInSignUpForm?: number;
  includeInIdTokenBody?: number;
  includeInUserInfo?: number;
}

const TableName = adapterConfig.TableName.UserAttribute

export const format = (raw: Raw): Record => {
  return {
    ...raw,
    includeInSignUpForm: !!raw.includeInSignUpForm,
    requiredInSignUpForm: !!raw.requiredInSignUpForm,
    includeInIdTokenBody: !!raw.includeInIdTokenBody,
    includeInUserInfo: !!raw.includeInUserInfo,
  }
}

export const getById = async (
  db: D1Database,
  id: number,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE id = $1 AND "deletedAt" IS NULL`

  const stmt = db.prepare(query)
    .bind(id)
  const userAttribute = await stmt.first() as Raw | null
  return userAttribute ? format(userAttribute) : null
}

export const getAll = async (db: D1Database): Promise<Record[]> => {
  const query = `SELECT * FROM ${TableName} WHERE "deletedAt" IS NULL ORDER BY id ASC`
  const stmt = db.prepare(query)
  const { results: userAttributes }: { results: Raw[] } = await stmt.all()
  return userAttributes.map((userAttribute) => format(userAttribute))
}

export const create = async (
  db: D1Database, create: Create,
): Promise<Record> => {
  const query = `INSERT INTO ${TableName} (name, "includeInSignUpForm", "requiredInSignUpForm", "includeInIdTokenBody", "includeInUserInfo") values ($1, $2, $3, $4, $5)`
  const stmt = db.prepare(query).bind(
    create.name,
    create.includeInSignUpForm,
    create.requiredInSignUpForm,
    create.includeInIdTokenBody,
    create.includeInUserInfo,
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
    'name', 'includeInSignUpForm', 'requiredInSignUpForm', 'includeInIdTokenBody', 'includeInUserInfo',
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
