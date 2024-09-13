import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  errorConfig,
  localeConfig, typeConfig,
} from 'configs'
import {
  emailLogModel, userModel,
} from 'models'
import {
  EmailVerificationTemplate, PasswordResetTemplate, EmailMfaTemplate,
} from 'templates'
import { cryptoUtil } from 'utils'

const checkEmailSetup = (c: Context<typeConfig.Context>) => {
  const {
    BREVO_API_KEY: brevoApiKey,
    BREVO_SENDER_ADDRESS: brevoSender,
    SENDGRID_API_KEY: sendgridApiKey,
    SENDGRID_SENDER_ADDRESS: sendgridSender,
  } = env(c)
  if (!c.env.SMTP && (!brevoApiKey || !brevoSender) && (!sendgridApiKey || !sendgridSender)) {
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

  let success = false
  let response = null

  const { ENABLE_EMAIL_LOG: enableEmailLog } = env(c)

  if (c.env.SMTP) {
    const transporter = c.env.SMTP.init()
    const res = await transporter.sendMail({
      from: process.env.SMTP_SENDER_NAME,
      to: receiver,
      subject,
      html: emailBody,
    })

    success = res?.accepted[0] === receiver
    response = res
  } else if (sendgridApiKey && sendgridSender) {
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
    success = res.ok

    if (enableEmailLog) {
      response = {
        status: res.status,
        statusText: res.statusText,
        url: res.url,
        body: await res.text(),
      }
    }
  } else if (brevoApiKey && brevoSender) {
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
    success = res.ok
    if (enableEmailLog) {
      response = {
        status: res.status,
        statusText: res.statusText,
        url: res.url,
        body: await res.text(),
      }
    }
  }

  if (enableEmailLog) {
    await emailLogModel.create(
      c.env.DB,
      {
        success: success ? 1 : 0,
        receiver,
        response: JSON.stringify(response),
        content: emailBody,
      },
    )
  }

  return success
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

  const verificationCode = cryptoUtil.genRandom8DigitString()
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

  const resetCode = cryptoUtil.genRandom8DigitString()
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

  const mfaCode = cryptoUtil.genRandom8DigitString()
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
