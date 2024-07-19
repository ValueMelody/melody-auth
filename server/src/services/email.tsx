import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  localeConfig, typeConfig,
} from 'configs'
import { userModel } from 'models'
import { EmailVerificationTemplate } from 'templates'
import { cryptoUtil } from 'utils'

export const sendEmailVerificationEmail = async (
  c: Context<typeConfig.Context>, user: userModel.Record,
) => {
  const {
    ENABLE_EMAIL_VERIFICATION: enableEmailVerification,
    SENDGRID_API_KEY: sendgridApiKey,
    SENDGRID_SENDER_ADDRESS: sendgridSender,
    COMPANY_LOGO_URL: logoUrl,
    AUTH_SERVER_URL: serverUrl,
  } = env(c)
  if (!enableEmailVerification || !sendgridApiKey || !sendgridSender || !user.email) return null
  const verificationCode = cryptoUtil.genRandomString(8)
  const content = (<EmailVerificationTemplate
    serverUrl={serverUrl}
    authId={user.authId}
    verificationCode={verificationCode}
    logoUrl={logoUrl} />).toString()

  const res = await fetch(
    'https://api.sendgrid.com/v3/mail/send',
    {
      method: 'POST',
      headers: {
        Authorization: `bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: localeConfig.EmailVerificationTemplate.Subject,
        content: [{
          type: 'text/html',
          value: content,
        }],
        personalizations: [
          {
            to: [
              { email: user.email },
            ],
          },
        ],
        from: { email: sendgridSender },
      }),
    },
  )

  return res.ok ? verificationCode : null
}
