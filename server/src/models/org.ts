import {
  adapterConfig, errorConfig,
} from 'configs'
import { dbUtil } from 'utils'

export interface AuthInfo {
  id: number;
  name: string;
  slug: string;
  companyLogoUrl: string;
}

export interface Common {
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
  customDomain: string | null;
  customDomainVerificationToken: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Raw extends Common {
  allowPublicRegistration: number;
  onlyUseForBrandingOverride: number;
  customDomainVerified: number;
}

export interface Record extends Common {
  allowPublicRegistration: boolean;
  onlyUseForBrandingOverride: boolean;
  customDomainVerified: boolean;
}

export interface ApiRecord {
  id: number;
  name: string;
  slug: string;
}

export interface Create {
  name: string;
  slug: string;
  allowPublicRegistration: number;
  onlyUseForBrandingOverride: number;
}

export interface Update {
  name?: string;
  slug?: string;
  allowPublicRegistration?: number;
  onlyUseForBrandingOverride?: number;
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
  customDomain?: string | null;
  customDomainVerified?: number;
  customDomainVerificationToken?: string | null;
  updatedAt?: string;
  deletedAt?: string | null;
}

const TableName = adapterConfig.TableName.Org

export const format = (raw: Raw): Record => {
  return {
    ...raw,
    allowPublicRegistration: !!raw.allowPublicRegistration,
    onlyUseForBrandingOverride: !!raw.onlyUseForBrandingOverride,
    customDomainVerified: !!raw.customDomainVerified,
  }
}

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
  const { results: orgs }: { results: Raw[] } = await stmt.all()
  return orgs.map((org) => format(org))
}

export const getById = async (
  db: D1Database,
  id: number,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE id = $1 AND "deletedAt" IS NULL`

  const stmt = db.prepare(query)
    .bind(id)
  const org = await stmt.first() as Raw | null
  return org ? format(org) : null
}

export const getBySlug = async (
  db: D1Database,
  slug: string,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE slug = $1 AND "deletedAt" IS NULL`

  const stmt = db.prepare(query)
    .bind(slug)
  const org = await stmt.first() as Raw | null
  return org ? format(org) : null
}

export const getByCustomDomain = async (
  db: D1Database,
  customDomain: string,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE "customDomain" = $1 AND "customDomainVerified" = 1 AND "deletedAt" IS NULL`

  const stmt = db.prepare(query)
    .bind(customDomain)
  const org = await stmt.first() as Raw | null
  return org ? format(org) : null
}

export const create = async (
  db: D1Database, create: Create,
): Promise<Record> => {
  const query = `INSERT INTO ${TableName} (name, slug, "allowPublicRegistration", "onlyUseForBrandingOverride") values ($1, $2, $3, $4)`
  const stmt = db.prepare(query).bind(
    create.name,
    create.slug,
    create.allowPublicRegistration,
    create.onlyUseForBrandingOverride,
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
    'customDomain', 'customDomainVerified', 'customDomainVerificationToken',
    'updatedAt', 'allowPublicRegistration', 'onlyUseForBrandingOverride',
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
