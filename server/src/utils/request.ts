import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  typeConfig, variableConfig,
} from 'configs'

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
  if ('cf' in c.req.raw) return c.req.header('cf-connecting-ip')

  const targets = variableConfig.RequestIPConfig.trustedHeaders
  const matchedTarget = targets.find((target) => c.req.header(target))
  return matchedTarget ? c.req.header(matchedTarget) : undefined
}
