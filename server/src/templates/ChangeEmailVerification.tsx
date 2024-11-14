import {
  localeConfig, typeConfig,
} from 'configs'
import Layout from 'templates/components/Layout'

const ChangeEmailVerification = ({
  logoUrl, verificationCode, locale,
}: {
  logoUrl: string;
  verificationCode: string;
  locale: typeConfig.Locale;
}) => {
  return (
    <Layout
      logoUrl={logoUrl}
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
                    {localeConfig.changeEmailVerificationEmail.title[locale]}
                  </h1>
                </td>
              </tr>
              <tr>
                <td align='center'>
                  <p style='margin: 0; padding-bottom: 10px;'>
                    {localeConfig.changeEmailVerificationEmail.desc[locale]}:&nbsp;
                    <span style='font-size: 20px; font-weight: bold;'>{verificationCode}</span>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </Layout>
  )
}

export default ChangeEmailVerification
