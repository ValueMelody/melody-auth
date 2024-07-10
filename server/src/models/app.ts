import { dbConfig } from 'configs'

export interface Common {
  id: number;
  clientId: string;
  secret: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Raw extends Common {
  redirectUris: string;
}

export interface Record extends Common {
  redirectUris: string[];
}

const TableName = dbConfig.TableName.App

const format = (raw: Raw): Record => {
  return {
    ...raw,
    redirectUris: raw.redirectUris.split(',').map((url) => url.trim().toLowerCase()),
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
