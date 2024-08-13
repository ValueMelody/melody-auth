import {
  adapterConfig, errorConfig,
  typeConfig,
} from 'configs'
import { Pagination } from 'configs/type'
import {
  formatUtil,
  validateUtil,
} from 'utils'

export interface Common {
  id: number;
  authId: string;
  email: string | null;
  locale: typeConfig.Locale;
  password: string | null;
  firstName: string | null;
  lastName: string | null;
  loginCount: number;
  otpSecret: string;
  mfaType: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Raw extends Common {
  emailVerified: number;
  otpVerified: number;
  isActive: number;
}

export interface Record extends Common {
  emailVerified: boolean;
  otpVerified: boolean;
  isActive: boolean;
}

export interface ApiRecord {
  id: number;
  authId: string;
  email: string | null;
  locale: typeConfig.Locale;
  firstName?: string | null;
  lastName?: string | null;
  emailVerified: boolean;
  loginCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PaginatedApiRecords {
  users: ApiRecord[];
  count: number;
}

export interface ApiRecordWithRoles extends ApiRecord {
  roles?: string[];
}

export interface Create {
  authId: string;
  locale: typeConfig.Locale;
  email: string | null;
  password: string | null;
  otpSecret?: string;
  firstName: string | null;
  lastName: string | null;
}

export interface Update {
  password?: string | null;
  otpSecret?: string;
  mfaType?: string;
  firstName?: string | null;
  lastName?: string | null;
  locale?: string;
  loginCount?: number;
  deletedAt?: string | null;
  updatedAt?: string | null;
  isActive?: number;
  emailVerified?: number;
  otpVerified?: number;
}

const TableName = adapterConfig.TableName.User

export const convertToRecord = (raw: Raw): Record => ({
  ...raw,
  emailVerified: !!raw.emailVerified,
  otpVerified: !!raw.otpVerified,
  isActive: !!raw.isActive,
})

export const convertToApiRecord = (
  record: Record,
  enableNames: boolean,
): ApiRecord => {
  const result: ApiRecord = {
    id: record.id,
    authId: record.authId,
    email: record.email,
    locale: record.locale,
    emailVerified: record.emailVerified,
    isActive: record.isActive,
    loginCount: record.loginCount,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    deletedAt: record.deletedAt,
  }
  if (enableNames) {
    result.firstName = record.firstName
    result.lastName = record.lastName
  }
  return result
}

export const convertToApiRecordWithRoles = (
  record: Record,
  enableNames: boolean,
  roles: string[],
): ApiRecordWithRoles => {
  const result: ApiRecordWithRoles = convertToApiRecord(
    record,
    enableNames,
  )
  return {
    ...result,
    roles,
  }
}

export const getAll = async (
  db: D1Database,
  pagination?: Pagination,
): Promise<Record[]> => {
  const stmt = formatUtil.d1SelectAllQuery(
    db,
    TableName,
    pagination,
  )
  const { results: users }: { results: Raw[] } = await stmt.all()
  return users.map((user) => convertToRecord(user))
}

export const count = async (db: D1Database): Promise<number> => {
  const stmt = db.prepare(`SELECT COUNT(*) as count FROM ${TableName} where deletedAt IS NULL`)
  const result = await stmt.first() as { count: number }
  return result.count
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
  const createKeys: (keyof Create)[] = [
    'authId', 'email', 'password', 'firstName', 'lastName', 'locale', 'otpSecret',
  ]
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

export const updateCount = async (
  db: D1Database, id: number,
) => {
  const query = `UPDATE ${TableName} set loginCount = loginCount + 1 where id = $1`
  const stmt = db.prepare(query).bind(id)
  await validateUtil.d1Run(stmt)
}

export const update = async (
  db: D1Database, id: number, update: Update,
): Promise<Record> => {
  const updateKeys: (keyof Update)[] = [
    'password', 'firstName', 'lastName', 'deletedAt', 'updatedAt', 'isActive',
    'emailVerified', 'loginCount', 'locale', 'otpSecret', 'mfaType', 'otpVerified',
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

export const remove = async (
  db: D1Database, id: number,
): Promise<true> => {
  const stmt = formatUtil.d1SoftDeleteQuery(
    db,
    TableName,
    id,
  )

  await validateUtil.d1Run(stmt)
  return true
}
