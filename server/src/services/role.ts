import { Context } from 'hono'
import { env } from 'hono/adapter'
import { typeConfig } from 'configs'
import { userRoleModel } from 'models'

export const getUserRoles = async (
  c: Context<typeConfig.Context>, userId: number,
) => {
  const { ENABLE_USER_ROLE } = env(c)
  if (!ENABLE_USER_ROLE) return null

  const roles = await userRoleModel.getAllByUserId(
    c.env.DB,
    userId,
  )
  return roles.map((role) => role.roleName ?? '')
}
