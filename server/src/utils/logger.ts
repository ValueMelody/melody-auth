import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  typeConfig, variableConfig,
} from 'configs'

export enum LoggerLevel {
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
  Silent = 'silent',
}

const red = '\x1b[31m'
const reset = '\x1b[0m'

const printRed = (message: string) => {
  return `${red}${message}${reset}`
}

export const customLogger = (
  message: string, level?: string,
) => {
  switch (level) {
  case LoggerLevel.Warn:
    warnLogger(message)
    break
  case LoggerLevel.Error:
    errorLogger(message)
    break
  case LoggerLevel.Info:
  default:
    infoLogger(message)
    break
  }
}

export const triggerLogger = (
  c: Context<typeConfig.Context>,
  level: LoggerLevel,
  message: string,
) => {
  const {
    LOG_LEVEL: logLevel,
    ENVIRONMENT: environment,
  } = env(c)

  switch (level) {
  case LoggerLevel.Error:
    if (logLevel !== LoggerLevel.Silent || environment === variableConfig.DefaultEnvironment.Development) {
      errorLogger(message)
    }
    break
  case LoggerLevel.Warn:
    if (
      logLevel === LoggerLevel.Info ||
      logLevel === LoggerLevel.Warn ||
      environment === variableConfig.DefaultEnvironment.Development
    ) {
      warnLogger(message)
    }
    break
  case LoggerLevel.Info:
    if (logLevel === LoggerLevel.Info || environment === variableConfig.DefaultEnvironment.Development) {
      infoLogger(message)
    }
    break
  }
}

export const infoLogger = (message: string) => {
  console.info(
    `[${LoggerLevel.Info}]`,
    message,
    new Date().toISOString(),
  )
}

export const warnLogger = (message: string) => {
  console.warn(
    `[${LoggerLevel.Warn}]`,
    message,
    new Date().toISOString(),
  )
}

export const errorLogger = (message: string) => {
  console.error(
    printRed(`[${LoggerLevel.Error}]`),
    printRed(message),
    new Date().toISOString(),
  )
}
