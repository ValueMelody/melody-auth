import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
import { screen } from '@testing-library/react'
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
  },
)
