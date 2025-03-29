import {
  describe, it, expect, vi, beforeEach,
} from 'vitest'
import {
  render, screen,
} from '@testing-library/react'
import Page from 'app/[lang]/logs/sign-in/[id]/page'
import { useGetApiV1LogsSignInByIdQuery } from 'services/auth/api'

// Mock the required hooks and modules
vi.mock(
  'next-intl',
  () => ({ useTranslations: vi.fn(() => (key: string) => key) }),
)

vi.mock(
  'next/navigation',
  () => ({
    useParams: vi.fn(() => ({ id: '1' })),
    useRouter: vi.fn(() => ({ push: vi.fn() })),
  }),
)

vi.mock(
  'services/auth/api',
  () => ({ useGetApiV1LogsSignInByIdQuery: vi.fn() }),
)

describe(
  'Sign In Log Detail Page',
  () => {
    const mockLog = {
      id: 1,
      userId: 123,
      ip: '192.168.1.1',
      detail: 'Login successful',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    }

    beforeEach(() => {
      vi.mocked(useGetApiV1LogsSignInByIdQuery).mockReturnValue({
        data: { log: mockLog },
        isLoading: false,
        error: null,
      } as any)
    })

    it(
      'renders the page title',
      () => {
        render(<Page />)
        expect(screen.getByText('logs.signInLog')).toBeInTheDocument()
      },
    )

    it(
      'renders log details',
      () => {
        render(<Page />)

        expect(screen.getByText('logs.userId')).toBeInTheDocument()
        expect(screen.getByText(mockLog.userId)).toBeInTheDocument()
        expect(screen.getByText('logs.ip')).toBeInTheDocument()
        expect(screen.getByText(mockLog.ip)).toBeInTheDocument()
        expect(screen.getByText('logs.detail')).toBeInTheDocument()
        expect(screen.getByText(mockLog.detail)).toBeInTheDocument()
      },
    )

    it(
      'renders timestamps',
      () => {
        render(<Page />)

        expect(screen.getByText(`${mockLog.createdAt} UTC`)).toBeInTheDocument()
        expect(screen.getByText(`${mockLog.updatedAt} UTC`)).toBeInTheDocument()
      },
    )

    it(
      'handles loading state',
      () => {
        vi.mocked(useGetApiV1LogsSignInByIdQuery).mockReturnValue({
          data: null,
          isLoading: true,
          error: null,
        } as any)

        render(<Page />)
        expect(screen.queryByText('logs.userId')).not.toBeInTheDocument()
      },
    )

    it(
      'handles empty log data',
      () => {
        vi.mocked(useGetApiV1LogsSignInByIdQuery).mockReturnValue({
          data: { log: null },
          isLoading: false,
          error: null,
        } as any)

        render(<Page />)
        expect(screen.queryByText('logs.userId')).not.toBeInTheDocument()
      },
    )
  },
)
