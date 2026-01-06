import {
  adapterConfig, errorConfig,
} from 'configs'
import { dbUtil } from 'utils'

export interface Common {
  id: number;
  name: string;
  validationRegex: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Raw extends Common {
  locales: string;
  includeInSignUpForm: number;
  requiredInSignUpForm: number;
  includeInIdTokenBody: number;
  includeInUserInfo: number;
  unique: number;
  validationLocales: string;
}

export interface Record extends Common {
  locales: {
    locale: string;
    value: string;
  }[];
  includeInSignUpForm: boolean;
  requiredInSignUpForm: boolean;
  includeInIdTokenBody: boolean;
  includeInUserInfo: boolean;
  unique: boolean;
  validationLocales: {
    locale: string;
    value: string;
  }[];
}

export interface Create {
  name: string;
  locales: string;
  includeInSignUpForm: number;
  requiredInSignUpForm: number;
  includeInIdTokenBody: number;
  includeInUserInfo: number;
  unique: number;
  validationRegex: string;
  validationLocales: string;
}

export interface Update {
  name?: string;
  locales?: string;
  includeInSignUpForm?: number;
  requiredInSignUpForm?: number;
  includeInIdTokenBody?: number;
  includeInUserInfo?: number;
  unique?: number;
  validationRegex?: string;
  validationLocales?: string;
}

const TableName = adapterConfig.TableName.UserAttribute

export const format = (raw: Raw): Record => {
  const localeJson = raw.locales ? JSON.parse(raw.locales) : {}
  const locales = Object.keys(localeJson).map((locale) => ({
    locale,
    value: localeJson[locale],
  }))
  const validationLocaleJson = raw.validationLocales ? JSON.parse(raw.validationLocales) : {}
  const validationLocales = Object.keys(validationLocaleJson).map((locale) => ({
    locale,
    value: validationLocaleJson[locale],
  }))
  return {
    ...raw,
    locales,
    includeInSignUpForm: !!raw.includeInSignUpForm,
    requiredInSignUpForm: !!raw.requiredInSignUpForm,
    includeInIdTokenBody: !!raw.includeInIdTokenBody,
    includeInUserInfo: !!raw.includeInUserInfo,
    unique: !!raw.unique,
    validationRegex: raw.validationRegex,
    validationLocales,
  }
}

export const getById = async (
  db: D1Database,
  id: number,
): Promise<Record | null> => {
  const query = `SELECT * FROM "${TableName}" WHERE id = $1 AND "deletedAt" IS NULL`

  const stmt = db.prepare(query)
    .bind(id)
  const userAttribute = await stmt.first() as Raw | null
  return userAttribute ? format(userAttribute) : null
}

export const getAll = async (db: D1Database): Promise<Record[]> => {
  const query = `SELECT * FROM "${TableName}" WHERE "deletedAt" IS NULL ORDER BY id ASC`
  const stmt = db.prepare(query)
  const { results: userAttributes }: { results: Raw[] } = await stmt.all()
  return userAttributes.map((userAttribute) => format(userAttribute))
}

export const create = async (
  db: D1Database, create: Create,
): Promise<Record> => {
  const query = `INSERT INTO "${TableName}" (name, locales, "includeInSignUpForm", "requiredInSignUpForm", "includeInIdTokenBody", "includeInUserInfo", "unique", "validationRegex", "validationLocales") values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
  const stmt = db.prepare(query).bind(
    create.name,
    create.locales,
    create.includeInSignUpForm,
    create.requiredInSignUpForm,
    create.includeInIdTokenBody,
    create.includeInUserInfo,
    create.unique,
    create.validationRegex,
    create.validationLocales,
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
    'name', 'locales', 'includeInSignUpForm', 'requiredInSignUpForm', 'includeInIdTokenBody', 'includeInUserInfo',
    'unique', 'validationRegex', 'validationLocales',
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
