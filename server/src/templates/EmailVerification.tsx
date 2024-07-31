import {
  localeConfig, routeConfig,
} from 'configs'
import Layout from 'templates/components/Layout'
import { formatUtil } from 'utils'

const EmailVerification = ({
  serverUrl, logoUrl, verificationCode, authId,
}: {
  serverUrl: string;
  logoUrl: string;
  verificationCode: string;
  authId: string;
}) => {
  const route = `${formatUtil.stripEndingSlash(serverUrl)}${routeConfig.InternalRoute.Identity}`

  return (
    <Layout logoUrl={logoUrl}>
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
                    {localeConfig.EmailVerificationTemplate.Title}
                  </h1>
                </td>
              </tr>
              <tr>
                <td align='center'>
                  <p style='margin: 0; padding-bottom: 10px;'>
                    {localeConfig.EmailVerificationTemplate.Desc}:&nbsp;
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
                      ${route}/verify-email?id=${authId}
                    `}
                    style='
                      display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: #ffffff;
                      text-decoration: none; border-radius: 4px;
                    '
                  >
                    {localeConfig.EmailVerificationTemplate.VerifyBtn}
                  </a>
                </td>
              </tr>
              <tr>
                <td align='center'>
                  <p style='margin: 0;'>{localeConfig.EmailVerificationTemplate.ExpiryText}</p>
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
