import { HTTPException } from 'hono/http-exception'

const getOption = (message?: string) => message ? { message } : undefined

export class InternalServerError {
  constructor (message?: string) {
    return new HTTPException(
      500,
      getOption(message),
    )
  }
}

export class Forbidden {
  constructor (message?: string) {
    return new HTTPException(
      400,
      getOption(message),
    )
  }
}

export class NotFound {
  constructor (message?: string) {
    return new HTTPException(
      400,
      getOption(message),
    )
  }
}

export class UnAuthorized {
  constructor (message?: string) {
    return new HTTPException(
      401,
      getOption(message),
    )
  }
}
