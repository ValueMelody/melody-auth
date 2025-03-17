import { getByText } from '@testing-library/dom'
import {
  expect, describe, it,
} from 'vitest'
import { render } from 'hono/jsx/dom'
import AuthCodeExpired from './AuthCodeExpired'
import { authCodeExpired } from 'pages/tools/locale'
import { typeConfig } from 'configs'

describe(
  'AuthCodeExpired Component',
  () => {
    const defaultProps = {
      locale: 'en' as typeConfig.Locale,
      authCodeExpiredParams: { redirectUri: '/expired' },
    }

    it(
      'renders the message and redirect link when redirectUri is provided',
      () => {
        const container = document.createElement('div')
        render(
          <AuthCodeExpired {...defaultProps} />,
          container,
        )
        document.body.appendChild(container)

        const messageElement = getByText(
          container,
          authCodeExpired.msg.en,
        )
        expect(messageElement).toBeDefined()

        const linkElement = container.querySelector('a[href="/expired"]')
        expect(linkElement).toBeDefined()
        expect(linkElement?.textContent?.trim()).toBe(authCodeExpired.redirect.en)
      },
    )

    it(
      'renders only the message when redirectUri is falsy',
      () => {
        const props = {
          locale: 'en' as typeConfig.Locale,
          authCodeExpiredParams: { redirectUri: '' },
        }
        const container = document.createElement('div')
        render(
          <AuthCodeExpired {...props} />,
          container,
        )
        document.body.appendChild(container)

        const messageElement = getByText(
          container,
          authCodeExpired.msg.en,
        )
        expect(messageElement).toBeDefined()

        const linkElement = container.querySelector('a')
        expect(linkElement).toBeNull()
      },
    )
  },
)
