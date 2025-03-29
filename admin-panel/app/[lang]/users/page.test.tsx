import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
import {
  screen, waitFor,
} from '@testing-library/react'
import { render } from '../../../vitest.setup'
import Page from 'app/[lang]/users/page'
import {
  useGetApiV1OrgsByIdUsersQuery, useGetApiV1UsersQuery,
} from 'services/auth/api'
import { users } from 'tests/userMock'

vi.mock(
  'services/auth/api',
  () => ({
    useGetApiV1UsersQuery: vi.fn(),
    useGetApiV1OrgsByIdUsersQuery: vi.fn(),
  }),
)

// Mock useAuth hook
vi.mock(
  '@melody-auth/react',
  () => ({
    useAuth: () => ({
      userInfo: { authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865' },
      accessTokenStorage: { accessToken: 'test-token' },
      refreshTokenStorage: { refreshToken: 'test-refresh-token' },
      isAuthenticated: true,
      isAuthenticating: false,
    }),
  }),
)

vi.mock(
  'signals',
  () => ({
    configSignal: {
      value: { ENABLE_NAMES: true },
      subscribe: () => () => {},
    },
  }),
)

describe(
  'Page Component',
  () => {
    beforeEach(() => {
      (useGetApiV1UsersQuery as Mock).mockReturnValue({
        data: {
          users,
          count: 30,
        },
      });
      (useGetApiV1OrgsByIdUsersQuery as Mock).mockReturnValue({ data: undefined })
    })

    it(
      'renders users',
      async () => {
        render(<Page />)

        const rows = screen.queryAllByTestId('userRow')
        expect(rows.length).toBe(6)

        rows.slice(
          3,
          6,
        ).forEach((
          row, index,
        ) => {
          expect(row.querySelectorAll('td')[0]?.innerHTML).toContain(users[index].authId)
          if (index === 0) {
            expect(row.querySelectorAll('td')[0]?.innerHTML).toContain('users.you')
          }

          expect(row.querySelectorAll('td')[1]?.innerHTML).toContain(users[index].email)
          expect(row.querySelectorAll('td')[2]?.innerHTML).toContain(users[index].isActive ? 'common.active' : 'common.disabled')
          expect(row.querySelectorAll('td')[3]?.innerHTML).toContain(`${users[index].firstName} ${users[index].lastName}`)
          const editLink = row.querySelectorAll('td')[4]?.getElementsByTagName('a')
          expect(editLink[0].getAttribute('href')).toBe(`/en/users/${users[index].authId}`)
        })
      },
    )

    it(
      'handles page changes correctly',
      async () => {
        render(<Page />)

        ;(useGetApiV1UsersQuery as Mock).mockClear()

        await waitFor(() => {
          const nextButton = screen.getByTitle('common.next')
          expect(nextButton).toBeInTheDocument()
          nextButton.click()
        })

        await waitFor(() => {
        // Verify the API was called with page 2
          expect(useGetApiV1UsersQuery).toHaveBeenCalledWith(
            expect.objectContaining({
              pageNumber: 2,
              pageSize: 20,
            }),
            expect.objectContaining({ skip: false }),
          )
        })
      },
    )

    it(
      'handles undefined API data gracefully',
      async () => {
      // Mock API to return undefined data
        (useGetApiV1UsersQuery as Mock).mockReturnValue({ data: undefined })

        render(<Page />)

        // Should render empty table without crashing
        const rows = screen.queryAllByTestId('userRow')
        expect(rows.length).toBe(0)

        // Pagination should not be visible
        const nextButton = screen.queryByText('common.next')
        expect(nextButton).not.toBeInTheDocument()
      },
    )

    it(
      'handles undefined user names correctly',
      () => {
        (useGetApiV1UsersQuery as Mock).mockReturnValue({
          data: {
            users: [{
              ...users[0],
              firstName: undefined,
              lastName: undefined,
            }],
            count: 1,
          },
        })

        render(<Page />)

        const rows = screen.queryAllByTestId('userRow')
        expect(rows.length).toBe(2)

        // Verify that the name cell contains empty strings
        const nameCell = rows[1].querySelectorAll('td')[3]
        expect(nameCell?.innerHTML).toContain(' ') // Should contain a space between empty strings
      },
    )
  },
)
