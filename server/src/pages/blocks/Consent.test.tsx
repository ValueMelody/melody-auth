import {
  getByText, fireEvent,
} from '@testing-library/dom'
import {
  expect, describe, it, beforeEach, vi,
  Mock,
} from 'vitest'
import { render } from 'hono/jsx/dom'
import { Scope } from 'shared'
import Consent, { ConsentProps } from './Consent'
import { consent } from 'pages/tools/locale'
import { GetAppConsentRes } from 'handlers/identity/main'

describe(
  'Consent Component',
  () => {
    const defaultConsentInfo = {
      appName: 'Test App',
      scopes: [
        {
          id: '1',
          name: 'profile',
          locales: [{
            locale: 'en', value: 'Profile',
          }],
          note: 'Profile note',
          type: 'profile',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: '2',
          name: Scope.OpenId,
          locales: [{
            locale: 'en', value: 'OpenID',
          }],
          note: 'OpenID note',
          type: 'openid',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: '3',
          name: 'email',
          locales: [{
            locale: 'en', value: 'Email',
          }],
          note: 'Email note',
          type: 'email',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: '4',
          name: Scope.OfflineAccess,
          locales: [{
            locale: 'en', value: 'Offline Access',
          }],
          note: 'Offline Access note',
          type: 'offline_access',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ],
    }

    const defaultProps: ConsentProps = {
      locale: 'en' as any,
      consentInfo: defaultConsentInfo as unknown as GetAppConsentRes,
      handleDecline: vi.fn(),
      handleAccept: vi.fn(),
      submitError: null,
    }

    const setup = (props: ConsentProps = defaultProps) => {
      const container = document.createElement('div')
      render(
        <Consent {...props} />,
        container,
      )
      document.body.appendChild(container)
      return container
    }

    beforeEach(() => {
      (defaultProps.handleDecline as Mock).mockReset();
      (defaultProps.handleAccept as Mock).mockReset()
    })

    it(
      'renders the title and consent info when provided',
      () => {
        const container = setup()
        const titleElement = getByText(
          container,
          consent.title.en,
        )
        expect(titleElement).toBeDefined()

        const consentText = `${defaultConsentInfo.appName} ${consent.requestAccess.en}`
        const consentInfoElement = getByText(
          container,
          consentText,
        )
        expect(consentInfoElement).toBeDefined()
      },
    )

    it(
      'renders only the title when consentInfo is null',
      () => {
        const props: ConsentProps = {
          ...defaultProps, consentInfo: null,
        }
        const container = setup(props)
        const titleElement = getByText(
          container,
          consent.title.en,
        )
        expect(titleElement).toBeDefined()
        expect(container.textContent).not.toContain('Test App')
      },
    )

    it(
      'renders the scopes list filtering out OpenId and OfflineAccess',
      () => {
        const container = setup()
        const profileElement = getByText(
          container,
          'Profile',
        )
        expect(profileElement).toBeDefined()
        const emailElement = getByText(
          container,
          'Email',
        )
        expect(emailElement).toBeDefined()

        // Ensure that scopes for OpenId and OfflineAccess are not rendered
        expect(container.textContent).not.toContain('OpenID')
        expect(container.textContent).not.toContain('Offline Access')
      },
    )

    it(
      'renders submit error if provided',
      () => {
        const errorMessage = 'An error occurred'
        const props: ConsentProps = {
          ...defaultProps, submitError: errorMessage,
        }
        const container = setup(props)
        expect(container.textContent).toContain(errorMessage)
      },
    )

    it(
      'calls handleDecline when the decline button is clicked',
      () => {
        const container = setup()
        const declineButton = getByText(
          container,
          consent.decline.en,
        )
        expect(declineButton).toBeDefined()
        fireEvent.click(declineButton)
        expect(defaultProps.handleDecline).toHaveBeenCalledTimes(1)
      },
    )

    it(
      'calls handleAccept when the accept button is clicked',
      () => {
        const container = setup()
        const acceptButton = getByText(
          container,
          consent.accept.en,
        )
        expect(acceptButton).toBeDefined()
        fireEvent.click(acceptButton)
        expect(defaultProps.handleAccept).toHaveBeenCalledTimes(1)
      },
    )
  },
)
