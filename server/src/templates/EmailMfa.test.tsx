import {
  describe, it, expect,
} from 'vitest'
import { JSDOM } from 'jsdom'
import EmailMfa from './EmailMfa'
import {
  localeConfig, typeConfig,
  variableConfig,
} from 'configs'

const mockProps = {
  branding: {
    name: 'Test Brand',
    logo: 'test-logo.png',
    logoUrl: '',
    emailLogoUrl: 'https://test.com/logo.png',
    fontFamily: 'Arial',
    fontUrl: null,
    layoutColor: '#ffffff',
    buttonColor: '#000000',
    buttonTextColor: '#ffffff',
    textColor: '#000000',
    linkColor: '#0000ff',
    labelColor: '#000000',
    primaryButtonColor: '#000000',
    primaryButtonLabelColor: '#ffffff',
    primaryButtonBorderColor: '#000000',
    secondaryButtonColor: '#ffffff',
    secondaryButtonLabelColor: '#000000',
    secondaryButtonBorderColor: '#000000',
  },
  mfaCode: 'MFA12345',
  locale: 'en' as typeConfig.Locale,
}

function renderAndParse (props = mockProps) {
  // Render the EmailMfa template to an HTML string.
  const html = EmailMfa(props).toString()
  const dom = new JSDOM(
    html,
    {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost',
    },
  )
  return {
    document: dom.window.document, window: dom.window,
  }
}

describe(
  'EmailMfa',
  () => {
    it(
      'renders the component with correct title',
      () => {
        const { document } = renderAndParse()
        const header = document.querySelector('h1')
        expect(header?.textContent).toBe(localeConfig.emailMfaEmail.title[mockProps.locale])
      },
    )

    it(
      'renders description and MFA code',
      () => {
        const { document } = renderAndParse()
        // Find the paragraph that contains the MFA code in a <span>
        const paragraph = Array.from(document.querySelectorAll('p')).find((p) => p.querySelector('span'))
        expect(paragraph).toBeTruthy()

        // Verify the paragraph contains the localized description text.
        expect(paragraph?.textContent).toContain(localeConfig.emailMfaEmail.desc[mockProps.locale].replace(
          '{{expiresIn}}',
          String(variableConfig.systemConfig.emailMfaCodeExpiresIn / 60),
        ))

        // Check that the MFA code is rendered in the <span>.
        const span = paragraph?.querySelector('span')
        expect(span?.textContent).toBe(mockProps.mfaCode)
      },
    )

    it(
      'renders correctly with a different locale',
      () => {
        const propsFr = {
          ...mockProps,
          locale: 'fr' as typeConfig.Locale,
        }
        const { document } = renderAndParse(propsFr)

        // Verify title for French locale.
        const header = document.querySelector('h1')
        expect(header?.textContent).toBe(localeConfig.emailMfaEmail.title[propsFr.locale])

        // Verify description and MFA code.
        const paragraph = Array.from(document.querySelectorAll('p')).find((p) => p.querySelector('span'))
        expect(paragraph).toBeTruthy()
        expect(paragraph?.textContent).toContain(localeConfig.emailMfaEmail.desc[propsFr.locale].replace(
          '{{expiresIn}}',
          String(variableConfig.systemConfig.emailMfaCodeExpiresIn / 60),
        ))
        const span = paragraph?.querySelector('span')
        expect(span?.textContent).toBe(propsFr.mfaCode)
      },
    )
  },
)
