import { Context } from "hono";
import { typeConfig } from "configs";
import { userModel, userRoleModel } from "models";

export const preSignUp = async () => {}

export const postSignUp = async (
  c: Context<typeConfig.Context>,
  user: userModel.Record,
) => {
  await userRoleModel.create(c.env.DB, {
    userId: user.id,
    roleId: 2,
  })
}
