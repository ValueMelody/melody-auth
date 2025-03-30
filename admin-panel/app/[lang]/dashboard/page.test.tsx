import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest'
import {
  render,
  screen,
} from '@testing-library/react'
import Page from './page'
import { configSignal } from 'signals'

// Mock the required modules
vi.mock(
  'next-intl',
  () => ({ useTranslations: vi.fn(() => (key: string) => key) }),
)

vi.mock(
  'i18n/navigation',
  () => ({ useRouter: vi.fn(() => ({ push: vi.fn() })) }),
)

describe(
  'Dashboard Page',
  () => {
    const mockConfigs = {
      AUTH_SERVER_URL: 'https://auth.example.com',
      COMPANY_LOGO_URL: 'https://example.com/logo.png',
      ENABLE_SIGN_IN_LOG: true,
      ENABLE_SMS_LOG: false,
      SUPPORTED_LOCALES: ['en', 'fr'],
      AUTHORIZATION_CODE_EXPIRES_IN: 300,
    }

    beforeEach(() => {
      configSignal.value = mockConfigs as any
    })

    it(
      'shows loading spinner when configs is null',
      () => {
        configSignal.value = null
        render(<Page />)
        expect(screen.getByTestId('spinner')).toBeInTheDocument()
      },
    )

    it(
      'renders system links section',
      () => {
        render(<Page />)

        const expectedLinks = [
          `${mockConfigs.AUTH_SERVER_URL}/.well-known/openid-configuration`,
          `${mockConfigs.AUTH_SERVER_URL}/.well-known/jwks.json`,
          `${mockConfigs.AUTH_SERVER_URL}/api/v1/swagger`,
          `${mockConfigs.AUTH_SERVER_URL}/info`,
        ]

        expectedLinks.forEach((link) => {
          const linkElement = screen.getByRole(
            'link',
            { name: link },
          )
          expect(linkElement).toHaveAttribute(
            'href',
            link,
          )
          expect(linkElement).toHaveAttribute(
            'target',
            '_blank',
          )
          expect(linkElement).toHaveAttribute(
            'rel',
            'noreferrer',
          )
        })
      },
    )

    it(
      'renders config sections with correct titles',
      () => {
        render(<Page />)

        const expectedSections = [
          'dashboard.informationConfigs',
          'dashboard.localeConfigs',
          'dashboard.suppressionConfigs',
          'dashboard.authConfigs',
          'dashboard.mfaConfigs',
          'dashboard.bruteForceConfigs',
          'dashboard.ssoConfigs',
          'dashboard.logConfigs',
        ]

        expectedSections.forEach((section) => {
          expect(screen.getByText(section)).toBeInTheDocument()
        })
      },
    )

    it(
      'renders array config values as comma-separated strings',
      () => {
        render(<Page />)

        const localesCell = screen.getByText('SUPPORTED_LOCALES')
          .nextElementSibling
        expect(localesCell).toHaveTextContent('en, fr')
      },
    )

    it(
      'renders string and number config values as is',
      () => {
        render(<Page />)

        const expiresInCell = screen.getByText('AUTHORIZATION_CODE_EXPIRES_IN')
          .nextElementSibling
        expect(expiresInCell).toHaveTextContent('300')
      },
    )
  },
)
