import { Context } from 'hono'
import {
  errorConfig, messageConfig, typeConfig,
} from 'configs'
import { logService } from 'services'
import { PaginationDto } from 'dtos/common'
import {
  loggerUtil, timeUtil,
} from 'utils'

export const getEmailLogs = async (c: Context<typeConfig.Context>) => {
  const {
    page_size: pageSize,
    page_number: pageNumber,
  } = c.req.query()
  const pagination = pageSize && pageNumber
    ? new PaginationDto({
      pageSize: Number(pageSize),
      pageNumber: Number(pageNumber),
    })
    : undefined

  const res = await logService.getEmailLogs(
    c,
    pagination,
  )

  return c.json(res)
}

export const deleteEmailLogs = async (c: Context<typeConfig.Context>) => {
  const before = c.req.query('before')

  if (!before || !timeUtil.isUtcString(before)) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.deleteBeforeMustBePresent,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.deleteBeforeMustBePresent)
  }

  await logService.deleteEmailLogs(
    c,
    before,
  )
  c.status(204)
  return c.body(null)
}

export const getSmsLogs = async (c: Context<typeConfig.Context>) => {
  const {
    page_size: pageSize,
    page_number: pageNumber,
  } = c.req.query()
  const pagination = pageSize && pageNumber
    ? new PaginationDto({
      pageSize: Number(pageSize),
      pageNumber: Number(pageNumber),
    })
    : undefined

  const res = await logService.getSmsLogs(
    c,
    pagination,
  )

  return c.json(res)
}

export const deleteSmsLogs = async (c: Context<typeConfig.Context>) => {
  const before = c.req.query('before')

  if (!before || !timeUtil.isUtcString(before)) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.deleteBeforeMustBePresent,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.deleteBeforeMustBePresent)
  }

  await logService.deleteSmsLogs(
    c,
    before,
  )
  c.status(204)
  return c.body(null)
}

export const getSmsLog = async (c: Context<typeConfig.Context>) => {
  const id = Number(c.req.param('id'))
  const log = await logService.getSmsLogById(
    c,
    id,
  )
  return c.json({ log })
}

export const getSignInLogs = async (c: Context<typeConfig.Context>) => {
  const {
    page_size: pageSize,
    page_number: pageNumber,
  } = c.req.query()
  const pagination = pageSize && pageNumber
    ? new PaginationDto({
      pageSize: Number(pageSize),
      pageNumber: Number(pageNumber),
    })
    : undefined

  const res = await logService.getSignInLogs(
    c,
    pagination,
  )

  return c.json(res)
}

export const deleteSignInLogs = async (c: Context<typeConfig.Context>) => {
  const before = c.req.query('before')

  if (!before || !timeUtil.isUtcString(before)) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.deleteBeforeMustBePresent,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.deleteBeforeMustBePresent)
  }

  await logService.deleteSignInLogs(
    c,
    before,
  )
  c.status(204)
  return c.body(null)
}

export const getEmailLog = async (c: Context<typeConfig.Context>) => {
  const id = Number(c.req.param('id'))
  const log = await logService.getEmailLogById(
    c,
    id,
  )
  return c.json({ log })
}

export const getSignInLog = async (c: Context<typeConfig.Context>) => {
  const id = Number(c.req.param('id'))
  const log = await logService.getSignInLogById(
    c,
    id,
  )
  return c.json({ log })
}
