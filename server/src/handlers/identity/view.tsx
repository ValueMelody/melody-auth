import { Context } from 'hono'
import { env } from 'hono/adapter'
import { html } from 'hono/html'
import {
  css, Style,
} from 'hono/css'
import { HtmlEscapedString } from 'hono/utils/html'
import {
  typeConfig,
  localeConfig,
  routeConfig,
} from 'configs'
import {
  brandingService, kvService,
} from 'services'
import { oauthHandler } from 'handlers'
import { Policy } from 'dtos/oauth'
import { identityDto } from 'dtos'
import {
  requestUtil, validateUtil,
} from 'utils'

const viewRender = async (
  c: Context<typeConfig.Context>,
  propsScript: HtmlEscapedString | Promise<HtmlEscapedString>,
  locale: typeConfig.Locale,
  org?: string,
) => {
  const branding = await brandingService.getBranding(
    c,
    org,
  )

  const { ENVIRONMENT } = env(c)

  return c.html(<html lang={locale}>
    <head>
      <meta charset='utf-8' />
      <title>{localeConfig.common.documentTitle[locale]}</title>
      <link
        rel='icon'
        type='image/x-icon'
        href={branding.logoUrl}
      />
      <meta
        name='viewport'
        content='width=device-width, initial-scale=1'
      />
      {ENVIRONMENT === 'dev'
        ? (
          <link
            rel='stylesheet'
            href='/src/pages/client.css'
          />
        )
        : (
          <link
            rel='stylesheet'
            href='/client.css'
          />
        )}
      <link
        rel='preconnect'
        href='https://fonts.googleapis.com'
      />
      <link
        rel='preconnect'
        href='https://fonts.gstatic.com'
      />
      <link
        href={branding.fontUrl}
        rel='stylesheet'
      />
      <Style>
        {css`
          :root {
            --layout-color: ${branding.layoutColor};
            --label-color: ${branding.labelColor};
            --font-default: ${branding.fontFamily};
            --primary-button-color: ${branding.primaryButtonColor};
            --primary-button-label-color: ${branding.primaryButtonLabelColor};
            --primary-button-border-color: ${branding.primaryButtonBorderColor};
            --secondary-button-color: ${branding.secondaryButtonColor};
            --secondary-button-label-color: ${branding.secondaryButtonLabelColor};
            --secondary-button-border-color: ${branding.secondaryButtonBorderColor};
            --critical-indicator-color: ${branding.criticalIndicatorColor};
          }
        `}
      </Style>
    </head>
    <body>
      <div id='root' />
      {ENVIRONMENT === 'dev'
        ? (
          <script
            type='module'
            src='/src/pages/client.tsx'
          />
        )
        : (
          <script
            type='module'
            src='/client.js'
          />
        )}
      {propsScript}
    </body>
  </html>)
}

export const getAuthorizeView = async (c: Context<typeConfig.Context>) => {
  const queryDto = await oauthHandler.parseGetAuthorizeDto(c)

  const {
    ENABLE_SIGN_UP: allowSignUp,
    ENABLE_PASSWORD_RESET: allowPasswordReset,
    ENABLE_PASSWORD_SIGN_IN: allowPasswordSignIn,
    ENABLE_NAMES: enableNames,
    NAMES_IS_REQUIRED: namesIsRequired,
    GOOGLE_AUTH_CLIENT_ID: googleAuthId,
    FACEBOOK_AUTH_CLIENT_ID: facebookAuthId,
    FACEBOOK_AUTH_CLIENT_SECRET: facebookClientSecret,
    GITHUB_AUTH_CLIENT_ID: githubAuthId,
    GITHUB_AUTH_CLIENT_SECRET: githubClientSecret,
    GITHUB_AUTH_APP_NAME: githubAppName,
    ALLOW_PASSKEY_ENROLLMENT: allowPasskey,
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
    ENABLE_PASSWORDLESS_SIGN_IN: enablePasswordlessSignIn,
  } = env(c)

  const isBasePolicy = !queryDto.policy || queryDto.policy === Policy.SignInOrSignUp
  const enablePasswordReset = isBasePolicy ? allowPasswordReset && !enablePasswordlessSignIn : false
  const enableSignUp = isBasePolicy ? allowSignUp && !enablePasswordlessSignIn : false
  const enablePasswordSignIn = isBasePolicy
    ? allowPasswordSignIn && !enablePasswordlessSignIn
    : !enablePasswordlessSignIn
  const googleClientId = isBasePolicy ? googleAuthId : ''
  const facebookClientId = isBasePolicy && facebookClientSecret ? facebookAuthId : ''
  const githubClientId = isBasePolicy && githubClientSecret && githubAppName ? githubAuthId : ''

  const branding = await brandingService.getBranding(
    c,
    queryDto.org,
  )

  const propsScript = html`
    <script>
      window.__initialProps = {
        locales: "${locales.join(',')}",
        logoUrl: "${branding.logoUrl}",
        enableLocaleSelector: ${enableLocaleSelector.toString()},
        enablePasswordReset: ${enablePasswordReset.toString()},
        enableSignUp: ${enableSignUp.toString()},
        enablePasswordSignIn: ${enablePasswordSignIn.toString()},
        enablePasswordlessSignIn: ${enablePasswordlessSignIn.toString()},
        googleClientId: "${googleClientId}",
        facebookClientId: "${facebookClientId}",
        githubClientId: "${githubClientId}",
        enableNames: ${enableNames.toString()},
        namesIsRequired: ${namesIsRequired.toString()},
        termsLink: "${branding.termsLink}",
        privacyPolicyLink: "${branding.privacyPolicyLink}",
        allowPasskey: ${allowPasskey.toString()},
      }
    </script>
  `

  return viewRender(
    c,
    propsScript,
    queryDto.locale,
    queryDto.org,
  )
}

export const getProcessView = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetProcess(c)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )
  if (!authInfo) return c.redirect(`${routeConfig.IdentityRoute.AuthCodeExpiredView}?locale=${queryDto.locale}`)

  const {
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  const branding = await brandingService.getBranding(
    c,
    queryDto.org,
  )

  const propsScript = html`
  <script>
    window.__initialProps = {
      locales: "${locales.join(',')}",
      logoUrl: "${branding.logoUrl}",
      enableLocaleSelector: ${enableLocaleSelector.toString()},
    }
  </script>
`

  return viewRender(
    c,
    propsScript,
    queryDto.locale,
    queryDto.org,
  )
}

export const getVerifyEmailView = async (c: Context<typeConfig.Context>) => {
  const queryDto = new identityDto.GetVerifyEmailViewDto({
    locale: requestUtil.getLocaleFromQuery(
      c,
      c.req.query('locale'),
    ),
    id: c.req.query('id') ?? '',
    org: c.req.query('org'),
  })

  await validateUtil.dto(queryDto)

  const {
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  const branding = await brandingService.getBranding(
    c,
    queryDto.org,
  )

  const propsScript = html`
  <script>
    window.__initialProps = {
      locales: "${locales.join(',')}",
      logoUrl: "${branding.logoUrl}",
      enableLocaleSelector: ${enableLocaleSelector.toString()},
    }
  </script>
`

  return viewRender(
    c,
    propsScript,
    queryDto.locale,
    queryDto.org,
  )
}

export const getAuthCodeExpiredView = async (c: Context<typeConfig.Context>) => {
  const queryDto = new identityDto.GetAuthCodeExpiredViewDto({
    locale: requestUtil.getLocaleFromQuery(
      c,
      c.req.query('locale'),
    ),
    redirect_uri: c.req.query('redirect_uri'),
    org: c.req.query('org'),
  })

  const {
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  const branding = await brandingService.getBranding(
    c,
    queryDto.org,
  )

  const propsScript = html`
  <script>
    window.__initialProps = {
      locales: "${locales.join(',')}",
      logoUrl: "${branding.logoUrl}",
      enableLocaleSelector: ${enableLocaleSelector.toString()},
    }
  </script>
`

  return viewRender(
    c,
    propsScript,
    queryDto.locale,
    queryDto.org,
  )
}
