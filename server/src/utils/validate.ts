import { HTTPException } from 'hono/http-exception'
import { validateOrReject } from 'class-validator'

export const dto = async (dto: object) => {
  try {
    await validateOrReject(dto)
  } catch (e) {
    throw new HTTPException(
      400,
      { message: JSON.stringify(e) },
    )
  }
}
