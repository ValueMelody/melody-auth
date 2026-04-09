import {
  localeConfig, typeConfig,
} from 'configs'
import Layout, { Branding } from 'templates/components/Layout'

const Invitation = ({
  branding, invitationUrl, locale, expiresIn,
}: {
  branding: Branding;
  invitationUrl: string;
  locale: typeConfig.Locale;
  expiresIn: number;
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
                    {localeConfig.invitationEmail.title[locale]}
                  </h1>
                </td>
              </tr>
              <tr>
                <td align='center'>
                  <p style='margin: 0; padding-bottom: 20px;'>
                    {localeConfig.invitationEmail.desc[locale].replace(
                      '{{expiresIn}}',
                      String(expiresIn),
                    )}
                  </p>
                </td>
              </tr>
              <tr>
                <td
                  align='center'
                  style='padding-bottom: 20px;'
                >
                  <a
                    href={invitationUrl}
                    style='
                      display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: #ffffff;
                      text-decoration: none; border-radius: 4px;
                    '
                  >
                    {localeConfig.invitationEmail.accept[locale]}
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </Layout>
  )
}

export default Invitation
