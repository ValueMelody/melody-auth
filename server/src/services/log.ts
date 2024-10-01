import { Context } from 'hono'
import {
  errorConfig, typeConfig,
} from 'configs'
import {
  emailLogModel, signInLogModel, smsLogModel,
} from 'models'

export const getEmailLogs = async (
  c: Context<typeConfig.Context>,
  pagination: typeConfig.Pagination | undefined,
): Promise<emailLogModel.PaginatedRecords> => {
  const logs = await emailLogModel.getAll(
    c.env.DB,
    { pagination },
  )
  const count = pagination
    ? await emailLogModel.count(c.env.DB)
    : logs.length

  return {
    logs, count,
  }
}

export const getEmailLogById = async (
  c: Context<typeConfig.Context>,
  id: number,
): Promise<emailLogModel.Record> => {
  const log = await emailLogModel.getById(
    c.env.DB,
    id,
  )

  if (!log) throw new errorConfig.NotFound()

  return log
}

export const getSmsLogs = async (
  c: Context<typeConfig.Context>,
  pagination: typeConfig.Pagination | undefined,
): Promise<emailLogModel.PaginatedRecords> => {
  const logs = await smsLogModel.getAll(
    c.env.DB,
    { pagination },
  )
  const count = pagination
    ? await smsLogModel.count(c.env.DB)
    : logs.length

  return {
    logs, count,
  }
}

export const getSmsLogById = async (
  c: Context<typeConfig.Context>,
  id: number,
): Promise<smsLogModel.Record> => {
  const log = await smsLogModel.getById(
    c.env.DB,
    id,
  )

  if (!log) throw new errorConfig.NotFound()

  return log
}

export const getSignInLogs = async (
  c: Context<typeConfig.Context>,
  pagination: typeConfig.Pagination | undefined,
): Promise<signInLogModel.PaginatedRecords> => {
  const logs = await signInLogModel.getAll(
    c.env.DB,
    { pagination },
  )
  const count = pagination
    ? await signInLogModel.count(c.env.DB)
    : logs.length

  return {
    logs, count,
  }
}

export const getSignInLogById = async (
  c: Context<typeConfig.Context>,
  id: number,
): Promise<signInLogModel.Record> => {
  const log = await signInLogModel.getById(
    c.env.DB,
    id,
  )

  if (!log) throw new errorConfig.NotFound()

  return log
}
