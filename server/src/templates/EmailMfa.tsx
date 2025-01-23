import {
  localeConfig, typeConfig,
} from 'configs'
import Layout, { Branding } from 'templates/components/Layout'

const EmailMfa = ({
  branding, mfaCode, locale,
}: {
  branding: Branding;
  mfaCode: string;
  locale: typeConfig.Locale;
}) => {
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
                    {localeConfig.emailMfaEmail.title[locale]}
                  </h1>
                </td>
              </tr>
              <tr>
                <td align='center'>
                  <p style='margin: 0; padding-bottom: 10px;'>
                    {localeConfig.emailMfaEmail.desc[locale]}:&nbsp;
                    <span style='font-size: 20px; font-weight: bold;'>{mfaCode}</span>
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

export default EmailMfa
