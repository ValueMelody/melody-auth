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
} from 'configs'
import { brandingService } from 'services'
import { oauthHandler } from 'handlers'
import { Policy } from 'dtos/oauth'

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
      <link
        rel='stylesheet'
        href='/src/pages/index.css'
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
      <script
        type='module'
        src='/src/pages/client.tsx'
      />
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
    GOOGLE_AUTH_CLIENT_ID: googleAuthId,
    FACEBOOK_AUTH_CLIENT_ID: facebookAuthId,
    FACEBOOK_AUTH_CLIENT_SECRET: facebookClientSecret,
    GITHUB_AUTH_CLIENT_ID: githubAuthId,
    GITHUB_AUTH_CLIENT_SECRET: githubClientSecret,
    GITHUB_AUTH_APP_NAME: githubAppName,
    // ALLOW_PASSKEY_ENROLLMENT: allowPasskey,
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  const isBasePolicy = !queryDto.policy || queryDto.policy === Policy.SignInOrSignUp
  const enablePasswordReset = isBasePolicy ? allowPasswordReset : false
  const enableSignUp = isBasePolicy ? allowSignUp : false
  const enablePasswordSignIn = isBasePolicy ? allowPasswordSignIn : true
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
        googleClientId: "${googleClientId}",
        facebookClientId: "${facebookClientId}",
        githubClientId: "${githubClientId}"
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
