import {
  describe, it, expect,
} from 'vitest'
import { JSDOM } from 'jsdom'
import EmailVerification from './EmailVerification'
import {
  localeConfig, routeConfig, typeConfig,
} from 'configs'
import { requestUtil } from 'utils'

const mockProps = {
  serverUrl: 'http://localhost/api',
  org: 'test-org',
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
  verificationCode: 'VERIFY1234',
  authId: 'AUTH5678',
  locale: 'en' as typeConfig.Locale,
}

function renderAndParse (props = mockProps) {
  // Render the EmailVerification template to an HTML string.
  const html = EmailVerification(props).toString()
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
  'EmailVerification',
  () => {
    it(
      'renders the component with correct title',
      () => {
        const { document } = renderAndParse()
        const header = document.querySelector('h1')
        expect(header?.textContent).toBe(localeConfig.emailVerificationEmail.title[mockProps.locale])
      },
    )

    it(
      'renders description and verification code',
      () => {
        const { document } = renderAndParse()
        // Find the paragraph that contains a <span> (verification code)
        const paragraph = Array.from(document.querySelectorAll('p')).find((p) => p.querySelector('span'))
        expect(paragraph).toBeTruthy()

        // Verify the paragraph contains the localized description text.
        expect(paragraph?.textContent).toContain(localeConfig.emailVerificationEmail.desc[mockProps.locale])

        // Check that the verification code is rendered correctly in the <span>.
        const span = paragraph?.querySelector('span')
        expect(span?.textContent).toBe(mockProps.verificationCode)
      },
    )

    it(
      'renders verification link correctly',
      () => {
        const { document } = renderAndParse()
        const link = document.querySelector('a')
        expect(link).toBeTruthy()

        // The EmailVerification component computes the route as:
        //   route = requestUtil.stripEndingSlash(serverUrl) + routeConfig.IdentityRoute.VerifyEmail
        // And constructs the href as: `${route}?id=${authId}&locale=${locale}&org=${org}`
        const expectedRoute = `${requestUtil.stripEndingSlash(mockProps.serverUrl)}${routeConfig.IdentityRoute.VerifyEmailView}`
        const expectedHref = `${expectedRoute}?id=${mockProps.authId}&locale=${mockProps.locale}&org=${mockProps.org}`

        // The href may contain extra whitespaces/newlines, so normalize.
        const actualHref = link!.getAttribute('href')?.replace(
          /\s+/g,
          '',
        )
        expect(actualHref).toBe(expectedHref)

        // Also verify that the text on the link matches the localized verify text.
        expect(link?.textContent?.trim()).toBe(localeConfig.emailVerificationEmail.verify[mockProps.locale])
      },
    )

    it(
      'renders expiry text',
      () => {
        const { document } = renderAndParse()
        // The expiry text should be rendered in a <p> element.
        const expiryParagraph = Array.from(document.querySelectorAll('p')).find((p) => {
          return p.textContent?.trim() === localeConfig.emailVerificationEmail.expiry[mockProps.locale]
        })
        expect(expiryParagraph).toBeTruthy()
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

        // Verify title for 'fr'
        const header = document.querySelector('h1')
        expect(header?.textContent).toBe(localeConfig.emailVerificationEmail.title[propsFr.locale])

        // Verify description and verification code.
        const paragraph = Array.from(document.querySelectorAll('p')).find((p) => p.querySelector('span'))
        expect(paragraph).toBeTruthy()
        expect(paragraph?.textContent).toContain(localeConfig.emailVerificationEmail.desc[propsFr.locale])
        const span = paragraph?.querySelector('span')
        expect(span?.textContent).toBe(propsFr.verificationCode)

        // Verify the verification link.
        const link = document.querySelector('a')
        expect(link).toBeTruthy()
        const expectedRoute = `${requestUtil.stripEndingSlash(propsFr.serverUrl)}${routeConfig.IdentityRoute.VerifyEmailView}`
        const expectedHref = `${expectedRoute}?id=${propsFr.authId}&locale=${propsFr.locale}&org=${propsFr.org}`
        const actualHref = link!.getAttribute('href')?.replace(
          /\s+/g,
          '',
        )
        expect(actualHref).toBe(expectedHref)
        expect(link?.textContent?.trim()).toBe(localeConfig.emailVerificationEmail.verify[propsFr.locale])

        // Verify expiry text.
        const expiryParagraph = Array.from(document.querySelectorAll('p')).find((p) => {
          return p.textContent?.trim() === localeConfig.emailVerificationEmail.expiry[propsFr.locale]
        })
        expect(expiryParagraph).toBeTruthy()
      },
    )
  },
)
