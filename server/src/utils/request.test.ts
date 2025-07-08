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
      'should return IP address when matching target header is found',
      () => {
        const expectedIP = '192.168.1.100'
        const mockContext = {
          req: {
            header: (headerName: string) => {
              if (headerName === 'cf-connecting-ip') {
                return expectedIP
              }
              return undefined
            },
          },
        } as Context<typeConfig.Context>

        const result = getRequestIP(mockContext)

        expect(result).toBe(expectedIP)
      },
    )
  },
)
