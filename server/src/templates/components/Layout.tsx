import { html } from 'hono/html'
import {
  localeConfig, typeConfig,
} from 'configs'

export interface Branding {
  logoUrl: string;
}

const Layout = ({
  branding,
  children,
  locale,
}: {
  branding: Branding;
  children: any;
  locale: typeConfig.Locale;
}) => html`
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body
    style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333333; margin: 0; padding: 0;"
  >
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7f7f7;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td align="center">
                <table
                  width="600"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="background-color: #ffffff; border-radius: 8px;"
                >
                    <tr>
                        <td align="center" style="padding: 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center">
                                        <img
                                          src="${branding.logoUrl}"
                                          alt="Melody Auth Logo" style="width: 40px; height: auto; margin-bottom: 20px;"
                                        >
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        ${children}
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 30px; font-size: 14px; color: #666666;">
                                        <p>
                                            ${localeConfig.common.poweredBy[locale]}
                                            <a
                                              href="https://github.com/ValueMelody/melody-auth"
                                              target="_blank"
                                              style="color: #666666;"
                                            >
                                              Melody Auth
                                            </a>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
  </body>
  </html>
`

export default Layout
