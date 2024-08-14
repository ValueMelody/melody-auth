import { validateOrReject } from 'class-validator'
import {
  errorConfig, localeConfig,
} from 'configs'

export const dto = async (dto: object) => {
  try {
    await validateOrReject(dto)
  } catch (e) {
    throw new errorConfig.Forbidden(JSON.stringify(e))
  }
}

export const d1Run = async (stmt: D1PreparedStatement) => {
  try {
    const res = await stmt.run()
    return res
  } catch (e) {
    console.error(e)
    const msg = String(e).includes('UNIQUE constraint failed') ? localeConfig.Error.UniqueKey : undefined
    throw new errorConfig.InternalServerError(msg)
  }
}
