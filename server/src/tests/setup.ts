import {
  Context, Next,
} from 'hono'
import { vi } from 'vitest'

const mockMiddleware = async (
  c: Context, next: Next,
) => {
  await next()
}

vi.mock(
  'middlewares',
  async (importOriginal: Function) => ({
    ...(await importOriginal() as object),
    authMiddleware: {
      s2sReadRole: mockMiddleware,
      s2sWriteRole: mockMiddleware,
      s2sReadScope: mockMiddleware,
      s2sWriteScope: mockMiddleware,
    },
  }),
)
