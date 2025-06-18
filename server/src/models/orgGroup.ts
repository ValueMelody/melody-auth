import {
  adapterConfig,
  errorConfig,
} from 'configs'
import { dbUtil } from 'utils'

export interface Record {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Create {
  name: string;
  orgId: number;
}

export interface Update {
  name?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

const TableName = adapterConfig.TableName.OrgGroup

export const getAll = async (
  db: D1Database,
  orgId: number,
): Promise<Record[]> => {
  const query = `SELECT * FROM ${TableName} WHERE "orgId" = $1 AND "deletedAt" IS NULL ORDER BY id ASC`
  const stmt = db.prepare(query)
    .bind(orgId)
  const { results: orgGroups }: { results: Record[] } = await stmt.all()
  return orgGroups
}

export const getById = async (
  db: D1Database,
  id: number,
): Promise<Record | null> => {
  const query = `SELECT * FROM ${TableName} WHERE id = $1 AND "deletedAt" IS NULL`

  const stmt = db.prepare(query)
    .bind(id)
  const orgGroup = await stmt.first() as Record | null
  return orgGroup
}

export const create = async (
  db: D1Database,
  create: Create,
): Promise<Record> => {
  const query = `INSERT INTO ${TableName} (name, "orgId") values ($1, $2)`
  const stmt = db.prepare(query).bind(
    create.name,
    create.orgId,
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
  db: D1Database,
  id: number,
  update: Update,
): Promise<Record> => {
  const updateKeys: (keyof Update)[] = [
    'name', 'updatedAt',
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
