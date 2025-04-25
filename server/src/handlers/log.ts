import { Context } from 'hono'
import { errorConfig, messageConfig, typeConfig } from 'configs'
import { logService } from 'services'
import { PaginationDto } from 'dtos/common'
import { loggerUtil } from 'utils'

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
  const { deleteBeforeDays } = await c.req.json()

  if (!deleteBeforeDays || deleteBeforeDays <= 0) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.deleteBeforeDaysMustBeGreaterThanZero,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.deleteBeforeDaysMustBeGreaterThanZero)
  }

  await logService.deleteEmailLogs(c, deleteBeforeDays)
  return c.json({ message: 'Email logs deleted successfully' })
}

export const getEmailLog = async (c: Context<typeConfig.Context>) => {
  const id = Number(c.req.param('id'))
  const log = await logService.getEmailLogById(
    c,
    id,
  )
  return c.json({ log })
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

export const getSignInLog = async (c: Context<typeConfig.Context>) => {
  const id = Number(c.req.param('id'))
  const log = await logService.getSignInLogById(
    c,
    id,
  )
  return c.json({ log })
}
