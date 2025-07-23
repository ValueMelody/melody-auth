import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest'
import {
  screen,
} from '@testing-library/react'
import Page from 'app/[lang]/logs/sms/[id]/page'
import { useGetApiV1LogsSmsByIdQuery } from 'services/auth/api'
import { render } from 'vitest.setup'

// Mock the required hooks and modules
vi.mock(
  'next-intl',
  () => (
    { useTranslations: vi.fn(() => (key: string) => key) }
  ),
)

vi.mock(
  'next/navigation',
  () => (
    {
      useParams: vi.fn(() => (
        { id: '1' }
      )),
    }
  ),
)

vi.mock(
  'i18n/navigation',
  () => ({ useRouter: vi.fn(() => ({ push: () => {} })) }),
)

vi.mock(
  'services/auth/api',
  () => (
    { useGetApiV1LogsSmsByIdQuery: vi.fn() }
  ),
)

describe(
  'SMS Log Detail Page',
  () => {
    const mockLog = {
      id: 1,
      receiver: '+1234567890',
      response: 'Success',
      content: 'Test SMS content',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    }

    beforeEach(() => {
      vi.mocked(useGetApiV1LogsSmsByIdQuery).mockReturnValue({
        data: { log: mockLog },
        isLoading: false,
        error: null,
      } as any)
    })

    it(
      'renders the page title',
      () => {
        render(<Page />)
        expect(screen.getByText('logs.smsLog')).toBeInTheDocument()
      },
    )

    it(
      'renders log details',
      () => {
        render(<Page />)

        expect(screen.getByText('logs.receiver')).toBeInTheDocument()
        expect(screen.getByText(mockLog.receiver)).toBeInTheDocument()
        expect(screen.getByText('logs.response')).toBeInTheDocument()
        expect(screen.getByText(mockLog.response)).toBeInTheDocument()
        expect(screen.getByText('logs.content')).toBeInTheDocument()
        expect(screen.getByText(mockLog.content)).toBeInTheDocument()
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
        vi.mocked(useGetApiV1LogsSmsByIdQuery).mockReturnValue({
          data: null,
          isLoading: true,
          error: null,
        } as any)

        render(<Page />)
        expect(screen.queryByText('logs.receiver')).not.toBeInTheDocument()
      },
    )

    it(
      'handles empty log data',
      () => {
        vi.mocked(useGetApiV1LogsSmsByIdQuery).mockReturnValue({
          data: { log: null },
          isLoading: false,
          error: null,
        } as any)

        render(<Page />)
        expect(screen.queryByText('logs.receiver')).not.toBeInTheDocument()
      },
    )
  },
)
