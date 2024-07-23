import { dbConfig } from 'configs'
import { ClientType } from 'configs/type'
import {
  formatUtil, timeUtil,
} from 'utils'

export interface Common {
  id: number;
  clientId: string;
  name: string;
  type: ClientType;
  secret: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Raw extends Common {
  redirectUris: string;
  scopes: string;
}

export interface Record extends Common {
  redirectUris: string[];
  scopes: string[];
}

export interface Update {
  deletedAt?: string | null;
}

const TableName = dbConfig.TableName.App

const format = (raw: Raw): Record => {
  return {
    ...raw,
    redirectUris: raw.redirectUris ? raw.redirectUris.split(',').map((url) => formatUtil.stripEndingSlash(url.trim().toLowerCase())) : [],
    scopes: raw.scopes ? raw.scopes.split(',').map((scope) => scope.trim().toLowerCase()) : [],
  }
}

export const getByClientId = async (
  db: D1Database, clientId: string,
) => {
  const stmt = db.prepare(`SELECT * FROM ${TableName} WHERE clientId = $1 AND deletedAt IS NULL`).bind(clientId)
  const app = await stmt.first() as Raw | null
  if (!app) return app

  return format(app)
}

export const getAll = async (
  db: D1Database, includeDeleted: boolean = false,
) => {
  let query = `SELECT * FROM ${TableName}`
  if (!includeDeleted) query = `${query} WHERE deletedAt IS NULL`
  const stmt = db.prepare(query)
  const { results: apps }: { results: Raw[] } = await stmt.all()
  return apps.map((app) => format(app))
}

export const getById = async (
  db: D1Database, id: number, includeDeleted: boolean = false,
) => {
  let query = `SELECT * FROM ${TableName} WHERE id = $1`
  if (!includeDeleted) query = `${query} AND deletedAt IS NULL`
  const stmt = db.prepare(query).bind(id)
  const app = await stmt.first() as Raw | null
  if (!app) return app

  return format(app)
}

export const update = async (
  db: D1Database, id: number, update: Update,
) => {
  const setQueries: string[] = []
  const binds = []

  const parsedUpdate = {
    ...update,
    updatedAt: timeUtil.getDbCurrentTime(),
  }
  const updateKeys: (keyof Update)[] = [
    'deletedAt',
  ]
  updateKeys.forEach((key) => {
    const value = parsedUpdate[key]
    if (value === undefined) return
    setQueries.push(`${key} = $${setQueries.length + 1}`)
    binds.push(value)
  })

  binds.push(id)
  const query = `UPDATE ${TableName} set ${setQueries.join(',')} where id = $${setQueries.length + 1}`
  const stmt = db.prepare(query).bind(...binds)

  const result = await stmt.run()
  if (!result.success) return null
  return getById(
    db,
    id,
  )
}
