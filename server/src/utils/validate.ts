import {
  ValidationError, validateOrReject,
} from 'class-validator'
import { errorConfig } from 'configs'

interface SanitizedValidationError {
  property: string;
  constraints?: Record<string, string>;
  children?: SanitizedValidationError[];
}

const sanitize = (errors: ValidationError[]): SanitizedValidationError[] => errors.map((error) => {
  const children = error.children?.length ? sanitize(error.children) : undefined
  return {
    property: error.property,
    ...(error.constraints ? { constraints: error.constraints } : {}),
    ...(children ? { children } : {}),
  }
})

export const dto = async (dto: object) => {
  try {
    await validateOrReject(dto)
  } catch (e) {
    if (!Array.isArray(e)) throw e
    throw new errorConfig.Forbidden(JSON.stringify(sanitize(e)))
  }
}
