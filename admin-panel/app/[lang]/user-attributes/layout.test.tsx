import {
  describe,
  it,
  expect,
  afterEach,
  vi,
} from 'vitest'
import * as React from 'react'
import {
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { useAuth } from '@melody-auth/react'
import Layout from './layout'
import { accessTool } from 'tools'

const pushMock = vi.fn()

vi.mock(
  '@melody-auth/react',
  () => ({ useAuth: vi.fn() }),
)
vi.mock(
  'tools',
  () => ({
    accessTool: {
      Access: { ReadUserAttribute: 'read_user_attribute' }, isAllowedAccess: vi.fn(),
    },
  }),
)
vi.mock(
  'i18n/navigation',
  () => ({ useRouter: () => ({ push: pushMock }) }),
)

describe(
  'Layout component for user attributes',
  () => {
    afterEach(() => vi.clearAllMocks())

    it(
      'renders children when user has access',
      () => {
        ;(useAuth as any).mockReturnValue({ userInfo: { roles: ['super_admin'] } })
        ;(accessTool.isAllowedAccess as any).mockReturnValue(true)
        render(<Layout><div data-testid='child'>Child Content</div></Layout>)
        expect(screen.getByTestId('child')).toBeInTheDocument()
        expect(pushMock).not.toHaveBeenCalled()
        expect(accessTool.isAllowedAccess).toHaveBeenCalledWith(
          accessTool.Access.ReadUserAttribute,
          ['super_admin'],
        )
      },
    )

    it(
      'redirects when user does not have access',
      async () => {
        ;(useAuth as any).mockReturnValue({ userInfo: { roles: [] } })
        ;(accessTool.isAllowedAccess as any).mockReturnValue(false)
        render(<Layout><div data-testid='child'>Child Content</div></Layout>)
        await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/'))
        expect(accessTool.isAllowedAccess).toHaveBeenCalledWith(
          accessTool.Access.ReadUserAttribute,
          [],
        )
      },
    )
  },
)
