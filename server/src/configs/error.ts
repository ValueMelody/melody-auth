import { HTTPException } from 'hono/http-exception'

const getOption = (message?: string) => message ? { message } : undefined

export class Forbidden {
  constructor (message?: string) {
    return new HTTPException(
      400,
      getOption(message),
    )
  }
}

export class UnAuthorized {
  constructor (message: string) {
    return new HTTPException(
      401,
      getOption(message),
    )
  }
}
