import {
  adapterConfig, errorConfig,
} from 'configs'
import {
  formatUtil,
  validateUtil,
} from 'utils'

export interface Common {
  id: number;
  authId: string;
  email: string | null;
  password: string | null;
  firstName: string | null;
  lastName: string | null;
  emailVerificationCode: string | null;
  emailVerificationCodeExpiresOn: number | null;
  passwordResetCode: string | null;
  passwordResetCodeExpiresOn: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Raw extends Common {
  emailVerified: number;
  isActive: number;
}

export interface Record extends Common {
  emailVerified: boolean;
  isActive: boolean;
}

export interface ApiRecord {
  id: number;
  authId: string;
  email: string | null;
  firstName?: string | null;
  lastName?: string | null;
  emailVerified: boolean;
  isActive: boolean;
  roles?: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Create {
  authId: string;
  email: string | null;
  password: string | null;
  firstName: string | null;
  lastName: string | null;
}

export interface Update {
  password?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  deletedAt?: string | null;
  updatedAt?: string | null;
  isActive?: number;
  emailVerified?: number;
  emailVerificationCode?: string | null;
  emailVerificationCodeExpiresOn?: number | null;
  passwordResetCode?: string | null;
  passwordResetCodeExpiresOn?: number | null;
}

const TableName = adapterConfig.TableName.User

export const convertToRecord = (raw: Raw): Record => ({
  ...raw,
  emailVerified: !!raw.emailVerified,
  isActive: !!raw.isActive,
})

export const convertToApiRecord = (
  record: Record,
  enableNames: boolean,
  roles: string[] | null,
): ApiRecord => {
  const result: ApiRecord = {
    id: record.id,
    authId: record.authId,
    email: record.email,
    emailVerified: record.emailVerified,
    isActive: record.isActive,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    deletedAt: record.deletedAt,
  }
  if (roles) result.roles = roles
  if (enableNames) {
    result.firstName = record.firstName
    result.lastName = record.lastName
  }
  return result
}

export const getAll = async (db: D1Database): Promise<Record[]> => {
  const query = `SELECT * FROM ${TableName} WHERE deletedAt IS NULL ORDER BY id ASC`
  const stmt = db.prepare(query)
  const { results: users }: { results: Raw[] } = await stmt.all()
  return users.map((user) => convertToRecord(user))
}

export const getById = async (
  db: D1Database,
  id: number,
): Promise<Record | null> => {
  const stmt = db.prepare(`SELECT * FROM ${TableName} WHERE id = $1 AND deletedAt IS NULL`)
    .bind(id)
  const user = await stmt.first() as Raw | null
  return user ? convertToRecord(user) : null
}

export const getByAuthId = async (
  db: D1Database,
  authId: string,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE authId = $1  AND deletedAt IS NULL`
  const stmt = db.prepare(query)
    .bind(authId)
  const user = await stmt.first() as Raw | null
  return user ? convertToRecord(user) : null
}

export const getByEmailAndPassword = async (
  db: D1Database, email: string, password: string,
): Promise<Record | null> => {
  const stmt = db.prepare(`SELECT * FROM ${TableName} WHERE email = $1 AND password = $2 AND deletedAt IS NULL`)
    .bind(
      email,
      password,
    )
  const user = await stmt.first() as Raw | null
  return user ? convertToRecord(user) : null
}

export const getByEmail = async (
  db: D1Database, email: string,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE email = $1 AND deletedAt IS NULL`
  const stmt = db.prepare(query)
    .bind(email)
  const user = await stmt.first() as Raw | null
  return user ? convertToRecord(user) : null
}

export const create = async (
  db: D1Database, create: Create,
): Promise<Record> => {
  const createKeys: (keyof Create)[] = ['authId', 'email', 'password', 'firstName', 'lastName']
  const stmt = formatUtil.d1CreateQuery(
    db,
    TableName,
    createKeys,
    create,
  )
  const result = await validateUtil.d1Run(stmt)
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
    'password', 'firstName', 'lastName', 'deletedAt', 'updatedAt', 'isActive',
    'emailVerified', 'emailVerificationCode', 'emailVerificationCodeExpiresOn',
    'passwordResetCode', 'passwordResetCodeExpiresOn',
  ]
  const stmt = formatUtil.d1UpdateQuery(
    db,
    TableName,
    id,
    updateKeys,
    update,
  )

  const result = await validateUtil.d1Run(stmt)
  if (!result.success) throw new errorConfig.InternalServerError()
  const record = await getById(
    db,
    id,
  )
  if (!record) throw new errorConfig.InternalServerError()
  return record
}
