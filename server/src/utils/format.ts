import { Context } from 'hono'
import { typeConfig } from 'configs'

export const stripEndingSlash = (val: string) => {
  return val.replace(
    /\/$/,
    '',
  )
}

export const getQueryString = (c: Context<typeConfig.Context>) => c.req.url.split('?')[1]
