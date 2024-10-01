import { Context } from 'hono'
import { typeConfig } from 'configs'
import { logService } from 'services'
import { PaginationDto } from 'dtos/common'

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
