import { adapterConfig } from 'configs'

export interface Record {
  id: number;
  appId: number;
  scopeId: number;
  scopeName: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

const TableName = adapterConfig.TableName.AppScope

export const getAllByAppId = async (
  db: D1Database,
  appId: number,
) => {
  const query = `
    SELECT ${TableName}.id, ${TableName}.appId,
    ${TableName}.scopeId, ${adapterConfig.TableName.Scope}.name as scopeName,
    ${TableName}.createdAt, ${TableName}.updatedAt,
    ${TableName}.deletedAt
    FROM ${TableName} LEFT JOIN ${adapterConfig.TableName.Scope}
      ON ${adapterConfig.TableName.Scope}.id = ${TableName}.scopeId
    WHERE appId = $1 AND ${TableName}.deletedAt IS NULL
  `
  const stmt = db.prepare(query)
    .bind(appId)
  const { results: appScopes }: { results: Record[] } = await stmt.all()
  return appScopes
}
