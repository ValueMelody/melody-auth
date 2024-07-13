import { validateOrReject } from 'class-validator'
import { errorConfig } from 'configs'

export const dto = async (dto: object) => {
  try {
    await validateOrReject(dto)
  } catch (e) {
    throw new errorConfig.Forbidden(JSON.stringify(e))
  }
}
