import { dbConfig } from 'configs'

export interface Record {
  id: number;
  authId: string;
  email: string | null;
  password: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

const TableName = dbConfig.TableName.User

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
