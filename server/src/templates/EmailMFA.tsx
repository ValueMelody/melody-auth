import { localeConfig } from 'configs'
import Layout from 'templates/components/Layout'

const EmailMFA = ({
  logoUrl, mfaCode,
}: {
  logoUrl: string;
  mfaCode: string;
}) => {
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
                    {localeConfig.EmailMfaTemplate.Title}
                  </h1>
                </td>
              </tr>
              <tr>
                <td align='center'>
                  <p style='margin: 0; padding-bottom: 10px;'>
                    {localeConfig.EmailMfaTemplate.Desc}:&nbsp;
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

export default EmailMFA
