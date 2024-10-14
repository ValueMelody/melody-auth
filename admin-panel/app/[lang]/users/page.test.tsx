import {
  describe, it, expect, vi, beforeEach, Mock,
} from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '../../../vitest.setup'
import Page from 'app/[lang]/users/page'
import { useGetApiV1UsersQuery } from 'services/auth/api'
import { users } from 'tests/userMock'

vi.mock(
  'services/auth/api',
  () => ({ useGetApiV1UsersQuery: vi.fn() }),
)

vi.mock(
  'signals',
  () => ({
    configSignal: {
      value: { ENABLE_NAMES: true },
      subscribe: () => () => {},
    },
    userInfoSignal: {
      value: { authId: '3ed71b1e-fd0c-444b-b653-7e78731d4865' },
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
          users, count: 3,
        },
      })
    })

    it(
      'renders users',
      async () => {
        render(<Page />)

        const rows = screen.queryAllByTestId('userRow')
        expect(rows.length).toBe(3)

        rows.forEach((
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
  },
)
