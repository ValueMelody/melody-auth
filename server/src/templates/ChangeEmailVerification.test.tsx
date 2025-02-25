import {
  describe, it, expect,
} from 'vitest'
import { JSDOM } from 'jsdom'
import ChangeEmailVerification from './ChangeEmailVerification'
import {
  localeConfig, typeConfig,
} from 'configs'

const mockProps = {
  branding: {
    name: 'Test Brand',
    logo: 'test-logo.png',
    logoUrl: 'https://test.com/logo.png',
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
  verificationCode: 'CHANGE1234',
  locale: 'en' as typeConfig.Locale,
}

function renderAndParse (props = mockProps) {
  // Render the ChangeEmailVerification template to an HTML string.
  const html = ChangeEmailVerification(props).toString()
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
  'ChangeEmailVerification',
  () => {
    it(
      'renders the component with correct title',
      () => {
        const { document } = renderAndParse()
        const header = document.querySelector('h1')
        expect(header?.textContent).toBe(localeConfig.changeEmailVerificationEmail.title[mockProps.locale])
      },
    )

    it(
      'renders description and verification code',
      () => {
        const { document } = renderAndParse()
        // Find the paragraph that contains the verification code in a <span>
        const paragraph = Array.from(document.querySelectorAll('p')).find((p) => p.querySelector('span'))
        expect(paragraph).toBeTruthy()

        // Verify that the paragraph contains the localized description
        expect(paragraph?.textContent).toContain(localeConfig.changeEmailVerificationEmail.desc[mockProps.locale])

        // Check that the verification code is rendered in the <span>
        const span = paragraph?.querySelector('span')
        expect(span?.textContent).toBe(mockProps.verificationCode)
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
        expect(header?.textContent).toBe(localeConfig.changeEmailVerificationEmail.title[propsFr.locale])

        // Verify description and verification code.
        const paragraph = Array.from(document.querySelectorAll('p')).find((p) => p.querySelector('span'))
        expect(paragraph).toBeTruthy()
        expect(paragraph?.textContent).toContain(localeConfig.changeEmailVerificationEmail.desc[propsFr.locale])
        const span = paragraph?.querySelector('span')
        expect(span?.textContent).toBe(propsFr.verificationCode)
      },
    )
  },
)
