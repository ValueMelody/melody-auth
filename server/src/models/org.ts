import {
  adapterConfig, errorConfig,
} from 'configs'
import { dbUtil } from 'utils'

export interface Record {
  id: number;
  name: string;
  slug: string;
  companyLogoUrl: string;
  companyEmailLogoUrl: string;
  fontFamily: string;
  fontUrl: string;
  layoutColor: string;
  labelColor: string;
  primaryButtonColor: string;
  primaryButtonLabelColor: string;
  primaryButtonBorderColor: string;
  secondaryButtonColor: string;
  secondaryButtonLabelColor: string;
  secondaryButtonBorderColor: string;
  criticalIndicatorColor: string;
  emailSenderName: string;
  termsLink: string;
  privacyPolicyLink: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ApiRecord {
  id: number;
  name: string;
  slug: string;
}

export interface Create {
  name: string;
  slug: string;
}

export interface Update {
  name?: string;
  slug?: string;
  companyLogoUrl?: string;
  companyEmailLogoUrl?: string;
  fontFamily?: string;
  fontUrl?: string;
  layoutColor?: string;
  labelColor?: string;
  primaryButtonColor?: string;
  primaryButtonLabelColor?: string;
  primaryButtonBorderColor?: string;
  secondaryButtonColor?: string;
  secondaryButtonLabelColor?: string;
  secondaryButtonBorderColor?: string;
  criticalIndicatorColor?: string;
  emailSenderName?: string;
  termsLink?: string;
  privacyPolicyLink?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

const TableName = adapterConfig.TableName.Org

export const convertToApiRecord = (record: Record): ApiRecord => {
  const result: ApiRecord = {
    id: record.id,
    name: record.name,
    slug: record.slug,
  }
  return result
}

export const getAll = async (db: D1Database): Promise<Record[]> => {
  const query = `SELECT * FROM ${TableName} WHERE "deletedAt" IS NULL ORDER BY id ASC`
  const stmt = db.prepare(query)
  const { results: orgs }: { results: Record[] } = await stmt.all()
  return orgs
}

export const getById = async (
  db: D1Database,
  id: number,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE id = $1 AND "deletedAt" IS NULL`

  const stmt = db.prepare(query)
    .bind(id)
  const org = await stmt.first() as Record | null
  return org
}

export const getBySlug = async (
  db: D1Database,
  slug: string,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE slug = $1 AND "deletedAt" IS NULL`

  const stmt = db.prepare(query)
    .bind(slug)
  const org = await stmt.first() as Record | null
  return org
}

export const create = async (
  db: D1Database, create: Create,
): Promise<Record> => {
  const query = `INSERT INTO ${TableName} (name, slug) values ($1, $2)`
  const stmt = db.prepare(query).bind(
    create.name,
    create.slug,
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
    'name', 'slug', 'companyLogoUrl', 'companyEmailLogoUrl', 'fontFamily', 'fontUrl', 'layoutColor', 'labelColor',
    'primaryButtonColor', 'primaryButtonLabelColor', 'primaryButtonBorderColor',
    'secondaryButtonColor', 'secondaryButtonLabelColor', 'secondaryButtonBorderColor',
    'criticalIndicatorColor', 'emailSenderName', 'termsLink', 'privacyPolicyLink',
    'updatedAt',
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
