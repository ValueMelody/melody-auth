import {
  describe,
  it,
  expect,
  vi,
} from 'vitest'
import { render } from '@testing-library/react'
import { useAuth } from '@melody-auth/react'
import Page from 'app/[lang]/page'
import { routeTool } from 'tools'
import useLocaleRouter from 'hooks/useLocaleRoute'

// Mock the required hooks and modules
vi.mock(
  '@melody-auth/react',
  () => (
    { useAuth: vi.fn() }
  ),
)

vi.mock(
  'hooks/useLocaleRoute',
  () => (
    {
      default: vi.fn(() => (
        { push: vi.fn() }
      )),
    }
  ),
)

describe(
  'Home Page',
  () => {
    it(
      'redirects to dashboard when authenticated',
      () => {
        const mockPush = vi.fn()
        vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true } as any)
        vi.mocked(useLocaleRouter).mockReturnValue({ push: mockPush } as any)

        render(<Page />)

        expect(mockPush).toHaveBeenCalledWith(routeTool.Internal.Dashboard)
      },
    )

    it(
      'does not redirect when not authenticated',
      () => {
        const mockPush = vi.fn()
        vi.mocked(useAuth).mockReturnValue({ isAuthenticated: false } as any)
        vi.mocked(useLocaleRouter).mockReturnValue({ push: mockPush } as any)

        render(<Page />)

        expect(mockPush).not.toHaveBeenCalled()
      },
    )

    it(
      'renders empty section',
      () => {
        vi.mocked(useAuth).mockReturnValue({ isAuthenticated: false } as any)

        const { container } = render(<Page />)
        expect(container.querySelector('section')).toBeInTheDocument()
      },
    )
  },
)
