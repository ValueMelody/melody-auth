import { Context } from 'hono'
import { env } from 'hono/adapter'
import { html } from 'hono/html'
import {
  css, Style,
} from 'hono/css'
import {
  typeConfig,
  localeConfig,
} from 'configs'
import { brandingService } from 'services'
import { oauthHandler } from 'handlers'

const viewRender = async (
  c: Context<typeConfig.Context>, locale: typeConfig.Locale, org?: string,
) => {
  const branding = await brandingService.getBranding(
    c,
    org,
  )

  const {
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

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
        href='/src/pages/index.css' />
      <Style>
        {css`
            :root {
              --layout-color: ${branding.layoutColor};
              --label-color: ${branding.labelColor};
              --font-default: ${branding.fontFamily};
            }
          `}
      </Style>
    </head>
    <body>
      <div id='root' />
      <script
        type='module'
        src='/src/pages/client.tsx' />
      {html`
          <script>
            window.__initialProps = {
              "locales": "${locales.join(',')}",
              "logoUrl": "${branding.logoUrl}",
              "enableLocaleSelector": ${enableLocaleSelector.toString()}
            }
          </script>
        `}
    </body>
  </html>)
}

export const getAuthorizeView = async (c: Context<typeConfig.Context>) => {
  const queryDto = await oauthHandler.parseGetAuthorizeDto(c)

  // const {
  //   ENABLE_SIGN_UP: allowSignUp,
  //   ENABLE_PASSWORD_RESET: allowPasswordReset,
  //   ENABLE_PASSWORD_SIGN_IN: allowPasswordSignIn,
  //   GOOGLE_AUTH_CLIENT_ID: googleAuthId,
  //   FACEBOOK_AUTH_CLIENT_ID: facebookAuthId,
  //   FACEBOOK_AUTH_CLIENT_SECRET: facebookClientSecret,
  //   GITHUB_AUTH_CLIENT_ID: githubAuthId,
  //   GITHUB_AUTH_CLIENT_SECRET: githubClientSecret,
  //   GITHUB_AUTH_APP_NAME: githubAppName,
  //   ALLOW_PASSKEY_ENROLLMENT: allowPasskey,
  // } = env(c)

  // const isBasePolicy = !queryDto.policy || queryDto.policy === Policy.SignInOrSignUp
  // const enablePasswordReset = isBasePolicy ? allowPasswordReset : false
  // const enableSignUp = isBasePolicy ? allowSignUp : false
  // const enablePasswordSignIn = isBasePolicy ? allowPasswordSignIn : true
  // const googleClientId = isBasePolicy ? googleAuthId : ''
  // const facebookClientId = isBasePolicy ? facebookAuthId : ''
  // const githubClientId = isBasePolicy ? githubAuthId : ''

  return viewRender(
    c,
    queryDto.locale,
    queryDto.org,
  )
}
