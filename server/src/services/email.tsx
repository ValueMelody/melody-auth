import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  localeConfig, typeConfig,
} from 'configs'
import { userModel } from 'models'
import { EmailVerificationEmail } from 'templates'
import { cryptoUtil } from 'utils'

export const sendEmailVerificationEmail = async (
  c: Context<typeConfig.Context>, user: userModel.Record,
) => {
  const {
    ENABLE_EMAIL_VERIFICATION: enableEmailVerification,
    SENDGRID_API_KEY: sendgridApiKey,
    SENDGRID_SENDER_ADDRESS: sendgridSender,
    COMPANY_LOGO_URL: logoUrl,
  } = env(c)
  if (!enableEmailVerification || !sendgridApiKey || !sendgridSender) return null
  const verificationCode = cryptoUtil.genRandomString(8)
  const content = (<EmailVerificationEmail
    oauthId={user.oauthId}
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
        subject: localeConfig.EmailVerificationEmail.Subject,
        content: [{
          type: 'text/html',
          value: content,
        }],
        personalizations: [
          {
            to: [
              { email: 'byn9826@gmail.com' },
            ],
          },
        ],
        from: { email: sendgridSender },
      }),
    },
  )
  console.log(1111)
  console.log(res)
}
