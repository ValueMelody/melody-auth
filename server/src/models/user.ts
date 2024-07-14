import { dbConfig } from 'configs'
import { getDbCurrentTime } from 'utils/time'

export interface Record {
  id: number;
  oauthId: string;
  email: string | null;
  password: string | null;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Create {
  oauthId: string;
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
}

const TableName = dbConfig.TableName.User

export const getById = async (
  db: D1Database,
  id: number,
) => {
  const stmt = db.prepare(`SELECT * FROM ${TableName} WHERE id = $1 AND deletedAt IS NULL`)
    .bind(id)
  const user = await stmt.first() as Record | null
  return user
}

export const getByOauthId = async (
  db: D1Database,
  oauthId: string,
) => {
  const stmt = db.prepare(`SELECT * FROM ${TableName} WHERE oauthId = $1 AND deletedAt IS NULL`)
    .bind(oauthId)
  const user = await stmt.first() as Record | null
  return user
}

export const getByEmailAndPassword = async (
  db: D1Database, email: string, password: string,
) => {
  const stmt = db.prepare(`SELECT * FROM ${TableName} WHERE email = $1 AND password = $2 AND deletedAt IS NULL`)
    .bind(
      email,
      password,
    )
  const user = await stmt.first() as Record | null
  return user
}

export const getByEmail = async (
  db: D1Database, email: string, includeDeleted = false,
) => {
  let query = `SELECT * FROM ${TableName} WHERE email = $1`
  if (!includeDeleted) query = `${query} AND deletedAt IS NULL`
  const stmt = db.prepare(query)
    .bind(email)
  const user = await stmt.first() as Record | null
  return user
}

export const create = async (
  db: D1Database, create: Create,
) => {
  const createKeys: (keyof Create)[] = ['oauthId', 'email', 'password', 'firstName', 'lastName']
  const createValues: string[] = []
  const createBinds: (string | null)[] = []
  createKeys.forEach((
    key, index,
  ) => {
    createValues.push(`$${index + 1}`)
    createBinds.push(create[key])
  })
  const query = `INSERT INTO ${TableName} (${createKeys.join(',')}) values (${createValues.join(',')})`

  const stmt = db.prepare(query).bind(...createBinds)
  const result = await stmt.run()
  if (!result.success) return null
  const id = result.meta.last_row_id
  return getById(
    db,
    id,
  )
}

export const update = async (
  db: D1Database, id: number, update: Update,
) => {
  const setQueries: string[] = []
  const binds = []

  const parsedUpdate = {
    ...update,
    updatedAt: getDbCurrentTime(),
  }
  const updateKeys: (keyof Update)[] = ['password', 'firstName', 'lastName', 'deletedAt', 'updatedAt']
  updateKeys.forEach((
    key, index,
  ) => {
    const value = parsedUpdate[key]
    if (value === undefined) return
    setQueries.push(`${key} = $${index + 1}`)
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
