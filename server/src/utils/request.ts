import { Context } from 'hono'
import { env } from 'hono/adapter'
import { typeConfig } from 'configs'

export const stripEndingSlash = (val: string): string => {
  return val.replace(
    /\/$/,
    '',
  )
}

export const getLocaleFromQuery = (
  c: Context<typeConfig.Context>, requestedLocale?: string,
): typeConfig.Locale => {
  const { SUPPORTED_LOCALES: locales } = env(c)
  const locale = requestedLocale?.toLowerCase() ?? ''
  return locales.find((supportedLocale) => supportedLocale === locale) ?? locales[0]
}

export const getQueryString = (c: Context<typeConfig.Context>): string => c.req.url.split('?')[1]

export const getRequestIP = (c: Context<typeConfig.Context>): string | undefined => {
  const targets = [
    'cf-connecting-ip',
    'x-client-ip',
    'x-forwarded-for',
    'do-connecting-ip',
    'fastly-client-ip',
    'true-client-ip',
    'x-real-ip',
    'x-cluster-client-ip',
    'x-forwarded',
    'forwarded-for',
    'x-appengine-user-ip',
  ]
  const matchedTarget = targets.find((target) => c.req.header(target))

  const ip = matchedTarget ? c.req.header(matchedTarget) : undefined
  return ip
}
