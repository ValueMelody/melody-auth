import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
import {
  screen, waitFor,
} from '@testing-library/react'
import { act } from 'react'
import { render } from '../../../vitest.setup'
import Page from 'app/[lang]/logs/page'
import {
  useGetApiV1LogsEmailQuery,
  useGetApiV1LogsSignInQuery,
  useGetApiV1LogsSmsQuery,
} from 'services/auth/api'
import {
  emailLogs, signInLogs, smsLogs,
} from 'tests/logMock'
import { configSignal } from 'signals'

vi.mock(
  'services/auth/api',
  () => ({
    useGetApiV1LogsEmailQuery: vi.fn(),
    useGetApiV1LogsSignInQuery: vi.fn(),
    useGetApiV1LogsSmsQuery: vi.fn(),
  }),
)

vi.mock(
  'signals',
  () => ({
    configSignal: {
      value: {
        ENABLE_EMAIL_LOG: true,
        ENABLE_SMS_LOG: true,
        ENABLE_SIGN_IN_LOG: true,
      },
      subscribe: () => () => {},
    },
  }),
)

describe(
  'Page Component',
  () => {
    beforeEach(() => {
      (useGetApiV1LogsEmailQuery as Mock).mockReturnValue({ data: { logs: emailLogs } });
      (useGetApiV1LogsSmsQuery as Mock).mockReturnValue({ data: { logs: smsLogs } });
      (useGetApiV1LogsSignInQuery as Mock).mockReturnValue({ data: { logs: signInLogs } })
    })

    it(
      'render logs',
      async () => {
        render(<Page />)

        const emailRows = screen.queryAllByTestId('emailLogRow')
        expect(emailRows.length).toBe(emailLogs.length)
        emailRows.forEach((
          row, index,
        ) => {
          expect(row.querySelectorAll('td')[0]?.innerHTML).toContain(emailLogs[index].receiver)
          const editLink = row.querySelectorAll('td')[3]?.getElementsByTagName('a')
          expect(editLink[0].getAttribute('href')).toBe(`/en/logs/email/${emailLogs[index].id}`)
        })

        const smsRows = screen.queryAllByTestId('smsLogRow')
        expect(smsRows.length).toBe(smsLogs.length)
        smsRows.forEach((
          row, index,
        ) => {
          expect(row.querySelectorAll('td')[0]?.innerHTML).toContain(smsLogs[index].receiver)
          const editLink = row.querySelectorAll('td')[3]?.getElementsByTagName('a')
          expect(editLink[0].getAttribute('href')).toBe(`/en/logs/sms/${smsLogs[index].id}`)
        })

        const signInRows = screen.queryAllByTestId('signInRow')
        expect(signInRows.length).toBe(signInLogs.length)
        signInRows.forEach((
          row, index,
        ) => {
          expect(row.querySelectorAll('td')[0]?.innerHTML).toContain(signInLogs[index].userId)
          const editLink = row.querySelectorAll('td')[2]?.getElementsByTagName('a')
          expect(editLink[0].getAttribute('href')).toBe(`/en/logs/sign-in/${signInLogs[index].userId}`)
        })
      },
    )

    it(
      'suppress email logs',
      async () => {
        vi.mocked(configSignal as unknown as { value: object }).value = {
          ENABLE_EMAIL_LOG: false,
          ENABLE_SMS_LOG: true,
          ENABLE_SIGN_IN_LOG: true,
        }

        render(<Page />)

        const emailRows = screen.queryAllByTestId('emailLogRow')
        expect(emailRows.length).toBe(0)

        const smsRows = screen.queryAllByTestId('smsLogRow')
        expect(smsRows.length).toBe(smsLogs.length)

        const signInRows = screen.queryAllByTestId('signInRow')
        expect(signInRows.length).toBe(signInLogs.length)

        vi.mocked(configSignal as unknown as { value: object }).value = {
          ENABLE_EMAIL_LOG: true,
          ENABLE_SMS_LOG: true,
          ENABLE_SIGN_IN_LOG: true,
        }
      },
    )

    it(
      'suppress sms logs',
      async () => {
        vi.mocked(configSignal as unknown as { value: object }).value = {
          ENABLE_EMAIL_LOG: true,
          ENABLE_SMS_LOG: false,
          ENABLE_SIGN_IN_LOG: true,
        }

        render(<Page />)

        const emailRows = screen.queryAllByTestId('emailLogRow')
        expect(emailRows.length).toBe(2)

        const smsRows = screen.queryAllByTestId('smsLogRow')
        expect(smsRows.length).toBe(0)

        const signInRows = screen.queryAllByTestId('signInRow')
        expect(signInRows.length).toBe(signInLogs.length)

        vi.mocked(configSignal as unknown as { value: object }).value = {
          ENABLE_EMAIL_LOG: true,
          ENABLE_SMS_LOG: true,
          ENABLE_SIGN_IN_LOG: true,
        }
      },
    )

    it(
      'suppress signIn logs',
      async () => {
        vi.mocked(configSignal as unknown as { value: object }).value = {
          ENABLE_EMAIL_LOG: true,
          ENABLE_SMS_LOG: true,
          ENABLE_SIGN_IN_LOG: false,
        }

        render(<Page />)

        const emailRows = screen.queryAllByTestId('emailLogRow')
        expect(emailRows.length).toBe(2)

        const smsRows = screen.queryAllByTestId('smsLogRow')
        expect(smsRows.length).toBe(2)

        const signInRows = screen.queryAllByTestId('signInRow')
        expect(signInRows.length).toBe(0)

        vi.mocked(configSignal as unknown as { value: object }).value = {
          ENABLE_EMAIL_LOG: true,
          ENABLE_SMS_LOG: true,
          ENABLE_SIGN_IN_LOG: true,
        }
      },
    )

    it(
      'shows pagination when there are multiple pages',
      () => {
        (useGetApiV1LogsEmailQuery as Mock).mockReturnValue({
          data: {
            logs: emailLogs,
            count: 25, // This will create 3 pages with PageSize of 10
          },
        });
        (useGetApiV1LogsSmsQuery as Mock).mockReturnValue({
          data: {
            logs: smsLogs,
            count: 15, // This will create 2 pages
          },
        })

        render(<Page />)

        // Should find 2 paginations (email and SMS) since they have multiple pages
        const paginations = screen.getAllByRole('navigation')
        expect(paginations).toHaveLength(2)
      },
    )

    it(
      'hides pagination when there is only one page',
      () => {
        (useGetApiV1LogsEmailQuery as Mock).mockReturnValue({
          data: {
            logs: emailLogs,
            count: 5, // Less than PageSize (10)
          },
        });
        (useGetApiV1LogsSmsQuery as Mock).mockReturnValue({
          data: {
            logs: smsLogs,
            count: 8,
          },
        })

        render(<Page />)

        // Should not find any pagination components
        const paginations = screen.queryAllByRole('navigation')
        expect(paginations).toHaveLength(0)
      },
    )

    it(
      'handles page changes correctly',
      async () => {
        const emailQuery = vi.fn().mockReturnValue({
          data: {
            logs: emailLogs,
            count: 25, // 3 pages
          },
        })
        const smsQuery = vi.fn().mockReturnValue({
          data: {
            logs: smsLogs,
            count: 25,
          },
        })
        const signInQuery = vi.fn().mockReturnValue({
          data: {
            logs: signInLogs,
            count: 25,
          },
        });

        (useGetApiV1LogsEmailQuery as Mock).mockImplementation(emailQuery);
        (useGetApiV1LogsSmsQuery as Mock).mockImplementation(smsQuery);
        (useGetApiV1LogsSignInQuery as Mock).mockImplementation(signInQuery)

        render(<Page />)

        const nextButtons = screen.getAllByTitle('common.next')

        await act(async () => {
          nextButtons.forEach((button) => button?.click())
        })

        await waitFor(() => {
        // Verify each query was called with correct page number
          expect(emailQuery).toHaveBeenCalledWith(expect.objectContaining({
            pageNumber: 2,
            pageSize: 10,
          }))
          expect(smsQuery).toHaveBeenCalledWith(expect.objectContaining({
            pageNumber: 2,
            pageSize: 10,
          }))
          expect(signInQuery).toHaveBeenCalledWith(expect.objectContaining({
            pageNumber: 2,
            pageSize: 10,
          }))
        })
      },
    )

    it(
      'handles undefined API responses',
      () => {
      // Mock APIs to return undefined data
        (useGetApiV1LogsEmailQuery as Mock).mockReturnValue({ data: undefined });
        (useGetApiV1LogsSmsQuery as Mock).mockReturnValue({ data: undefined });
        (useGetApiV1LogsSignInQuery as Mock).mockReturnValue({ data: undefined })

        render(<Page />)

        // Should render empty tables
        const emailRows = screen.queryAllByTestId('emailLogRow')
        expect(emailRows).toHaveLength(0)

        const smsRows = screen.queryAllByTestId('smsLogRow')
        expect(smsRows).toHaveLength(0)

        const signInRows = screen.queryAllByTestId('signInRow')
        expect(signInRows).toHaveLength(0)
      },
    )

    it(
      'shows loading state when config is undefined',
      () => {
      // Mock config signal to return undefined
        vi.mocked(configSignal as unknown as { value: object }).value = undefined as any

        render(<Page />)

        // Should show spinner
        const spinner = screen.getByTestId('spinner')
        expect(spinner).toBeInTheDocument()

        // Should not render any tables
        const emailRows = screen.queryAllByTestId('emailLogRow')
        expect(emailRows).toHaveLength(0)

        const smsRows = screen.queryAllByTestId('smsLogRow')
        expect(smsRows).toHaveLength(0)

        const signInRows = screen.queryAllByTestId('signInRow')
        expect(signInRows).toHaveLength(0)

        // Reset config for other tests
        vi.mocked(configSignal as unknown as { value: object }).value = {
          ENABLE_EMAIL_LOG: true,
          ENABLE_SMS_LOG: true,
          ENABLE_SIGN_IN_LOG: true,
        }
      },
    )

    it(
      'handles empty logs array from API',
      () => {
      // Mock APIs to return empty logs arrays
        (useGetApiV1LogsEmailQuery as Mock).mockReturnValue({
          data: {
            logs: [],
            count: 0,
          },
        });
        (useGetApiV1LogsSmsQuery as Mock).mockReturnValue({
          data: {
            logs: [],
            count: 0,
          },
        });
        (useGetApiV1LogsSignInQuery as Mock).mockReturnValue({
          data: {
            logs: [],
            count: 0,
          },
        })

        render(<Page />)

        // Should render empty tables
        const emailRows = screen.queryAllByTestId('emailLogRow')
        expect(emailRows).toHaveLength(0)

        const smsRows = screen.queryAllByTestId('smsLogRow')
        expect(smsRows).toHaveLength(0)

        const signInRows = screen.queryAllByTestId('signInRow')
        expect(signInRows).toHaveLength(0)

        // Should not show pagination
        const paginations = screen.queryAllByRole('navigation')
        expect(paginations).toHaveLength(0)
      },
    )
  },
)
