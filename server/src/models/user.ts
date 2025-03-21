import {
  adapterConfig, errorConfig,
  typeConfig,
} from 'configs'
import { orgModel } from 'models'
import { dbUtil } from 'utils'

export enum MfaType {
  Otp = 'otp',
  Email = 'email',
  Sms = 'sms',
}

export enum SocialAccountType {
  Google = 'Google',
  Facebook = 'Facebook',
  GitHub = 'GitHub',
}

export interface Common {
  id: number;
  authId: string;
  orgSlug: string;
  email: string | null;
  socialAccountId: string | null;
  socialAccountType: SocialAccountType | null;
  locale: typeConfig.Locale;
  password: string | null;
  firstName: string | null;
  lastName: string | null;
  loginCount: number;
  otpSecret: string;
  smsPhoneNumber: string | null;
  linkedAuthId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Raw extends Common {
  emailVerified: number;
  otpVerified: number;
  skipPasskeyEnroll: number;
  smsPhoneNumberVerified: number;
  isActive: number;
  mfaTypes: string;
}

export interface Record extends Common {
  emailVerified: boolean;
  otpVerified: boolean;
  skipPasskeyEnroll: boolean;
  smsPhoneNumberVerified: boolean;
  isActive: boolean;
  mfaTypes: string[];
}

export interface ApiRecord {
  id: number;
  authId: string;
  linkedAuthId: string | null;
  socialAccountId: string | null;
  socialAccountType: SocialAccountType | null;
  email: string | null;
  locale: typeConfig.Locale;
  firstName?: string | null;
  lastName?: string | null;
  emailVerified: boolean;
  otpVerified: boolean;
  smsPhoneNumberVerified: boolean;
  loginCount: number;
  mfaTypes: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PaginatedApiRecords {
  users: ApiRecord[];
  count: number;
}

export interface ApiRecordFull extends ApiRecord {
  roles?: string[];
  org?: orgModel.ApiRecord | null;
}

export interface Create {
  authId: string;
  orgSlug: string;
  locale: typeConfig.Locale;
  email: string | null;
  socialAccountId: string | null;
  socialAccountType: SocialAccountType | null;
  password: string | null;
  otpSecret?: string;
  emailVerified?: number;
  firstName: string | null;
  lastName: string | null;
}

export interface Update {
  email?: string;
  orgSlug?: string;
  password?: string | null;
  otpSecret?: string;
  smsPhoneNumber?: string | null;
  smsPhoneNumberVerified?: number;
  mfaTypes?: string;
  firstName?: string | null;
  lastName?: string | null;
  locale?: string;
  loginCount?: number;
  deletedAt?: string | null;
  updatedAt?: string | null;
  isActive?: number;
  emailVerified?: number;
  otpVerified?: number;
  linkedAuthId?: string | null;
  skipPasskeyEnroll?: number;
}

const TableName = `"${adapterConfig.TableName.User}"`

export const convertToRecord = (raw: Raw): Record => ({
  ...raw,
  emailVerified: !!raw.emailVerified,
  skipPasskeyEnroll: !!raw.skipPasskeyEnroll,
  otpVerified: !!raw.otpVerified,
  smsPhoneNumberVerified: !!raw.smsPhoneNumberVerified,
  isActive: !!raw.isActive,
  mfaTypes: raw.mfaTypes ? raw.mfaTypes.split(',') : [],
})

export const convertToApiRecord = (
  record: Record,
  enableNames: boolean,
): ApiRecord => {
  const result: ApiRecord = {
    id: record.id,
    authId: record.authId,
    linkedAuthId: record.linkedAuthId,
    socialAccountId: record.socialAccountId,
    socialAccountType: record.socialAccountType,
    email: record.email,
    locale: record.locale,
    emailVerified: record.emailVerified,
    smsPhoneNumberVerified: record.smsPhoneNumberVerified,
    otpVerified: record.otpVerified,
    mfaTypes: record.mfaTypes,
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

export const convertToApiRecordFull = (
  record: Record,
  enableNames: boolean,
  enableOrg: boolean,
  roles: string[],
  org: orgModel.Record | null | undefined,
): ApiRecordFull => {
  const result: ApiRecordFull = convertToApiRecord(
    record,
    enableNames,
  )
  if (enableOrg) {
    result.org = org ? orgModel.convertToApiRecord(org) : null
  }
  return {
    ...result,
    roles,
  }
}

export const getAll = async (
  db: D1Database,
  option?: {
    search?: typeConfig.Search;
    match?: typeConfig.Match;
    pagination?: typeConfig.Pagination;
  },
): Promise<Record[]> => {
  const stmt = dbUtil.d1SelectAllQuery(
    db,
    TableName,
    option,
  )
  const { results: users }: { results: Raw[] } = await stmt.all()
  return users.map((user) => convertToRecord(user))
}

export const count = async (
  db: D1Database,
  option?: {
    search?: typeConfig.Search;
    match?: typeConfig.Match;
  },
): Promise<number> => {
  let num = 1
  const matchCondition = option?.match ? `AND "${option.match.column}" = $${num++}` : ''
  const searchCondition = option?.search ? `AND ${option.search.column} LIKE $${num++}` : ''

  const bind = []
  if (option?.match) {
    bind.push(option.match.value)
  }
  if (option?.search) {
    bind.push(option.search.value)
  }

  const query = `SELECT COUNT(*) as count FROM ${TableName} where "deletedAt" IS NULL ${matchCondition} ${searchCondition}`
  const stmt = bind.length ? db.prepare(query).bind(...bind) : db.prepare(query)
  const result = await stmt.first() as { count: number }
  return Number(result.count)
}

export const getById = async (
  db: D1Database,
  id: number,
): Promise<Record | null> => {
  const stmt = db.prepare(`SELECT * FROM ${TableName} WHERE id = $1 AND "deletedAt" IS NULL`)
    .bind(id)
  const user = await stmt.first() as Raw | null
  return user ? convertToRecord(user) : null
}

export const getByAuthId = async (
  db: D1Database,
  authId: string,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE "authId" = $1  AND "deletedAt" IS NULL`
  const stmt = db.prepare(query)
    .bind(authId)
  const user = await stmt.first() as Raw | null
  return user ? convertToRecord(user) : null
}

export const getNormalUserByEmail = async (
  db: D1Database, email: string,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE email = $1 AND "socialAccountId" IS NULL AND "deletedAt" IS NULL`
  const stmt = db.prepare(query)
    .bind(email)
  const user = await stmt.first() as Raw | null
  return user ? convertToRecord(user) : null
}

export const getGoogleUserByGoogleId = async (
  db: D1Database, googleId: string,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE "socialAccountId" = $1 AND "socialAccountType" = $2  AND "deletedAt" IS NULL`
  const stmt = db.prepare(query)
    .bind(
      googleId,
      SocialAccountType.Google,
    )
  const user = await stmt.first() as Raw | null
  return user ? convertToRecord(user) : null
}

export const getFacebookUserByFacebookId = async (
  db: D1Database, facebookId: string,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE "socialAccountId" = $1 AND "socialAccountType" = $2  AND "deletedAt" IS NULL`
  const stmt = db.prepare(query)
    .bind(
      facebookId,
      SocialAccountType.Facebook,
    )
  const user = await stmt.first() as Raw | null
  return user ? convertToRecord(user) : null
}

export const getGithubUserByGithubId = async (
  db: D1Database, githubId: string,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE "socialAccountId" = $1 AND "socialAccountType" = $2  AND "deletedAt" IS NULL`
  const stmt = db.prepare(query)
    .bind(
      githubId,
      SocialAccountType.GitHub,
    )
  const user = await stmt.first() as Raw | null
  return user ? convertToRecord(user) : null
}

export const create = async (
  db: D1Database, create: Create,
): Promise<Record> => {
  const createKeys: (keyof Create)[] = [
    'authId', 'email', 'password', 'firstName', 'lastName', 'orgSlug',
    'locale', 'otpSecret', 'socialAccountId', 'socialAccountType', 'emailVerified',
  ]
  const stmt = dbUtil.d1CreateQuery(
    db,
    TableName,
    createKeys,
    create,
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

export const updateCount = async (
  db: D1Database, id: number,
) => {
  const query = `UPDATE ${TableName} set "loginCount" = "loginCount" + 1 where id = $1`
  const stmt = db.prepare(query).bind(id)
  await dbUtil.d1Run(stmt)
}

export const update = async (
  db: D1Database, id: number, update: Update,
): Promise<Record> => {
  const updateKeys: (keyof Update)[] = [
    'password', 'firstName', 'lastName', 'deletedAt', 'updatedAt', 'isActive',
    'emailVerified', 'loginCount', 'locale', 'otpSecret', 'mfaTypes', 'otpVerified',
    'smsPhoneNumber', 'smsPhoneNumberVerified', 'email', 'linkedAuthId', 'orgSlug',
    'skipPasskeyEnroll',
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

export const updateOrgSlug = async (
  db: D1Database, oldSlug: string, newSlug: string,
): Promise<true> => {
  const query = `UPDATE ${TableName} set "orgSlug" = $1 where "orgSlug" = $2`
  const stmt = db.prepare(query).bind(
    newSlug,
    oldSlug,
  )
  await dbUtil.d1Run(stmt)
  return true
}
