import { Buffer } from 'buffer'
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
  ChangeEmailVerificationTemplate,
} from 'templates'
import { cryptoUtil } from 'utils'

const checkEmailSetup = (c: Context<typeConfig.Context>) => {
  const {
    BREVO_API_KEY: brevoApiKey,
    BREVO_SENDER_ADDRESS: brevoSender,
    SENDGRID_API_KEY: sendgridApiKey,
    SENDGRID_SENDER_ADDRESS: sendgridSender,
    MAILGUN_API_KEY: mailgunApiKey,
    MAILGUN_SENDER_ADDRESS: mailgunSender,
  } = env(c)
  if (
    !c.env.SMTP &&
    (!mailgunApiKey || !mailgunSender) &&
    (!brevoApiKey || !brevoSender) &&
    (!sendgridApiKey || !sendgridSender)
  ) {
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
    MAILGUN_API_KEY: mailgunApiKey,
    MAILGUN_SENDER_ADDRESS: mailgunSender,
    ENVIRONMENT: environment,
    DEV_EMAIL_RECEIVER: devEmailReceiver,
    EMAIL_SENDER_NAME: senderName,
    SMTP_SENDER_ADDRESS: smtpSenderEmail,
  } = env(c)

  const receiver = environment === 'prod' ? receiverEmail : devEmailReceiver

  let success = false
  let response = null

  const { ENABLE_EMAIL_LOG: enableEmailLog } = env(c)

  if (c.env.SMTP) {
    const transporter = c.env.SMTP.init()
    const res = await transporter.sendMail({
      from: `"${senderName}" ${smtpSenderEmail}`,
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
          from: {
            email: sendgridSender, name: senderName,
          },
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
  } else if (mailgunApiKey && mailgunSender) {
    const form = new FormData()
    form.append(
      'from',
      `${senderName} <${mailgunSender}>`,
    )
    form.append(
      'to',
      receiver,
    )
    form.append(
      'subject',
      subject,
    )
    form.append(
      'html',
      emailBody,
    )

    const [, domain] = mailgunSender.split('@')

    const auth = Buffer.from(`api:${mailgunApiKey}`).toString('base64')

    const res = await fetch(
      `https://api.mailgun.net/v3/${domain}/messages`,
      {
        method: 'POST',
        headers: { Authorization: `Basic ${auth}` },
        body: form,
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
            name: senderName,
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

  const verificationCode = cryptoUtil.genRandom6DigitString()
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

  const resetCode = cryptoUtil.genRandom6DigitString()
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

export const sendChangeEmailVerificationCode = async (
  c: Context<typeConfig.Context>,
  email: string,
  locale: typeConfig.Locale,
) => {
  const { COMPANY_LOGO_URL: logoUrl } = env(c)

  if (!email) return null
  checkEmailSetup(c)

  const verificationCode = cryptoUtil.genRandom6DigitString()
  const content = (<ChangeEmailVerificationTemplate
    verificationCode={verificationCode}
    logoUrl={logoUrl}
    locale={locale}
  />).toString()

  const res = await sendEmail(
    c,
    email,
    localeConfig.changeEmailVerificationEmail.subject[locale],
    content,
  )

  return res ? verificationCode : null
}

export const sendEmailMfa = async (
  c: Context<typeConfig.Context>,
  user: userModel.Record,
  locale: typeConfig.Locale,
) => {
  const { COMPANY_LOGO_URL: logoUrl } = env(c)
  if (!user.email) return null
  checkEmailSetup(c)

  const mfaCode = cryptoUtil.genRandom6DigitString()
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
