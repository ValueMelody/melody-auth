import { dbConfig } from 'configs'

export interface Record {
  id: number;
  userId: number;
  roleId: number;
  roleName?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

const TableName = dbConfig.TableName.UserRole

export const getAllByUserId = async (
  db: D1Database,
  userId: number,
) => {
  const query = `
    SELECT ${dbConfig.TableName.UserRole}.id, ${dbConfig.TableName.UserRole}.userId,
    ${dbConfig.TableName.UserRole}.roleId, ${dbConfig.TableName.Role}.name as roleName,
    ${dbConfig.TableName.UserRole}.createdAt, ${dbConfig.TableName.UserRole}.updatedAt,
    ${dbConfig.TableName.UserRole}.deletedAt
    FROM ${TableName} LEFT JOIN role ON role.id = user_role.roleId
    WHERE userId = $1 AND ${dbConfig.TableName.UserRole}.deletedAt IS NULL
  `
  const stmt = db.prepare(query)
    .bind(userId)
  const { results: userRoles }: { results: Record[] } = await stmt.all()
  return userRoles
}
