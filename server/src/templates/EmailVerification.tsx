import {
  localeConfig, routeConfig,
  typeConfig,
} from 'configs'
import Layout, { Branding } from 'templates/components/Layout'
import { requestUtil } from 'utils'

const EmailVerification = ({
  serverUrl, org, branding, verificationCode, authId, locale,
}: {
  serverUrl: string;
  org: string;
  branding: Branding;
  verificationCode: string;
  authId: string;
  locale: typeConfig.Locale;
}) => {
  const route = `${requestUtil.stripEndingSlash(serverUrl)}${routeConfig.IdentityRoute.VerifyEmail}`

  return (
    <Layout
      branding={branding}
      locale={locale}>
      <table
        cellpadding='0'
        cellspacing='0'
        border={0}
        width='100%'>
        <tr>
          <td align='center'>
            <table
              cellpadding='0'
              cellspacing='0'
              border={0}
            >
              <tr>
                <td align='center'>
                  <h1 style='color: #333333; font-size: 24px; margin: 0; padding-bottom: 20px;'>
                    {localeConfig.emailVerificationEmail.title[locale]}
                  </h1>
                </td>
              </tr>
              <tr>
                <td align='center'>
                  <p style='margin: 0; padding-bottom: 10px;'>
                    {localeConfig.emailVerificationEmail.desc[locale]}:&nbsp;
                    <span style='font-size: 20px; font-weight: bold;'>{verificationCode}</span>
                  </p>
                </td>
              </tr>
              <tr>
                <td
                  align='center'
                  style='padding-top: 20px; padding-bottom: 20px;'
                >
                  <a
                    href={`
                      ${route}?id=${authId}&locale=${locale}&org=${org}
                    `}
                    style='
                      display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: #ffffff;
                      text-decoration: none; border-radius: 4px;
                    '
                  >
                    {localeConfig.emailVerificationEmail.verify[locale]}
                  </a>
                </td>
              </tr>
              <tr>
                <td align='center'>
                  <p style='margin: 0;'>{localeConfig.emailVerificationEmail.expiry[locale]}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </Layout>
  )
}

export default EmailVerification
