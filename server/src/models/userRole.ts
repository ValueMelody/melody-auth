import { adapterConfig } from 'configs'

export interface Record {
  id: number;
  userId: number;
  roleId: number;
  roleName: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

const TableName = adapterConfig.TableName.UserRole

export const getAllByUserId = async (
  db: D1Database,
  userId: number,
) => {
  const query = `
    SELECT ${TableName}.id, ${TableName}.userId,
    ${TableName}.roleId, ${adapterConfig.TableName.Role}.name as roleName,
    ${TableName}.createdAt, ${TableName}.updatedAt,
    ${TableName}.deletedAt
    FROM ${TableName} LEFT JOIN ${adapterConfig.TableName.Role}
      ON ${adapterConfig.TableName.Role}.id = ${TableName}.roleId
    WHERE userId = $1 AND ${TableName}.deletedAt IS NULL
  `
  const stmt = db.prepare(query)
    .bind(userId)
  const { results: userRoles }: { results: Record[] } = await stmt.all()
  return userRoles
}
