import {
  describe, expect, test,
} from 'vitest'
import { Context } from 'hono'
import { getRequestIP } from './request'
import { typeConfig } from 'configs'

describe(
  'getRequestIP',
  () => {
    test(
      'should only use cf-connecting-ip for Cloudflare Worker requests',
      () => {
        const expectedIP = '192.168.1.100'
        const mockContext = {
          req: {
            raw: { cf: {} },
            header: (headerName: string) => {
              if (headerName === 'cf-connecting-ip') {
                return expectedIP
              }
              if (headerName === 'x-forwarded-for') return '198.51.100.1'
              return undefined
            },
          },
        } as unknown as Context<typeConfig.Context>

        const result = getRequestIP(mockContext)

        expect(result).toBe(expectedIP)
      },
    )

    test(
      'should ignore untrusted forwarding headers for non-Cloudflare requests',
      () => {
        const mockContext = {
          req: {
            raw: {},
            header: (headerName: string) => {
              if (headerName === 'x-forwarded-for') return '192.168.1.100'
              return undefined
            },
          },
        } as unknown as Context<typeConfig.Context>

        const result = getRequestIP(mockContext)

        expect(result).toBeUndefined()
      },
    )
  },
)
