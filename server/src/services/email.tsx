import { Context } from 'hono'
import { env } from 'hono/adapter'
import { genRandomString } from 'shared'
import {
  errorConfig,
  localeConfig, typeConfig,
} from 'configs'
import { userModel } from 'models'
import {
  EmailVerificationTemplate, PasswordResetTemplate, EmailMfaTemplate,
} from 'templates'

const checkEmailSetup = (c: Context<typeConfig.Context>) => {
  const {
    BREVO_API_KEY: brevoApiKey,
    BREVO_SENDER_ADDRESS: brevoSender,
    SENDGRID_API_KEY: sendgridApiKey,
    SENDGRID_SENDER_ADDRESS: sendgridSender,
  } = env(c)
  if ((!brevoApiKey || !brevoSender) && (!sendgridApiKey || !sendgridSender)) {
    throw new errorConfig.Forbidden(localeConfig.Error.NoEmailSender)
  }
}

export const sendEmail = async (
  c: Context<typeConfig.Context>,
  receiverEmail: string,
  subject: string,
  emailBody: string,
) => {
  const {
    SENDGRID_API_KEY: sendgridApiKey,
    SENDGRID_SENDER_ADDRESS: sendgridSender,
    BREVO_API_KEY: brevoApiKey,
    BREVO_SENDER_ADDRESS: brevoSender,
    ENVIRONMENT: environment,
    DEV_EMAIL_RECEIVER: devEmailReceiver,
  } = env(c)

  const receiver = environment === 'prod' ? receiverEmail : devEmailReceiver

  if (c.env.SMTP) {
    const transporter = c.env.SMTP.init()
    const res = await transporter.sendMail({
      from: process.env.SMTP_SENDER_NAME || 'Melody Auth',
      to: receiver,
      subject,
      html: emailBody,
    })
    return res?.accepted[0] === receiver
  }

  if (sendgridApiKey && sendgridSender) {
    const res = await fetch(
      'https://api.sendgrid.com/v3/mail/send',
      {
        method: 'POST',
        headers: {
          Authorization: `bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          content: [{
            type: 'text/html',
            value: emailBody,
          }],
          personalizations: [
            {
              to: [
                { email: receiver },
              ],
            },
          ],
          from: { email: sendgridSender },
        }),
      },
    )
    return res.ok
  }

  if (brevoApiKey && brevoSender) {
    const res = await fetch(
      'https://api.brevo.com/v3/smtp/email',
      {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: 'Melody Auth',
            email: brevoSender,
          },
          subject,
          htmlContent: emailBody,
          to: [
            { email: receiver },
          ],
        }),
      },
    )
    return res.ok
  }

  return false
}

export const sendEmailVerification = async (
  c: Context<typeConfig.Context>,
  user: userModel.Record | userModel.ApiRecord,
  locale: typeConfig.Locale,
) => {
  const {
    COMPANY_LOGO_URL: logoUrl,
    AUTH_SERVER_URL: serverUrl,
  } = env(c)

  if (!user.email) return null
  checkEmailSetup(c)

  const verificationCode = genRandomString(8)
  const content = (<EmailVerificationTemplate
    serverUrl={serverUrl}
    authId={user.authId}
    verificationCode={verificationCode}
    logoUrl={logoUrl}
    locale={locale} />).toString()

  const res = await sendEmail(
    c,
    user.email,
    localeConfig.emailVerificationEmail.subject[locale],
    content,
  )

  return res ? verificationCode : null
}

export const sendPasswordReset = async (
  c: Context<typeConfig.Context>,
  user: userModel.Record,
  locale: typeConfig.Locale,
) => {
  const { COMPANY_LOGO_URL: logoUrl } = env(c)

  if (!user.email) return null
  checkEmailSetup(c)

  const resetCode = genRandomString(8)
  const content = (<PasswordResetTemplate
    resetCode={resetCode}
    logoUrl={logoUrl}
    locale={locale}
  />).toString()

  const res = await sendEmail(
    c,
    user.email,
    localeConfig.passwordResetEmail.subject[locale],
    content,
  )

  return res ? resetCode : null
}

export const sendEmailMfa = async (
  c: Context<typeConfig.Context>,
  user: userModel.Record,
  locale: typeConfig.Locale,
) => {
  const { COMPANY_LOGO_URL: logoUrl } = env(c)
  if (!user.email) return null
  checkEmailSetup(c)

  const mfaCode = genRandomString(8)
  const content = (<EmailMfaTemplate
    mfaCode={mfaCode}
    logoUrl={logoUrl}
    locale={locale} />).toString()

  const res = await sendEmail(
    c,
    user.email,
    localeConfig.emailMfaEmail.subject[locale],
    content,
  )

  return res ? mfaCode : null
}
