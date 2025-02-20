import { Context } from 'hono'
import { env } from 'hono/adapter'
import { BrevoMailer } from './email/brevo'
import { IMailer } from './email/interface'
import { MailgunMailer } from './email/mailgun'
import { SendgridMailer } from './email/sendgrid'
import { SmtpMailer } from './email/smtp'
import { cryptoUtil } from 'utils'
import {
  ChangeEmailVerificationTemplate,
  EmailMfaTemplate,
  EmailVerificationTemplate, PasswordResetTemplate,
} from 'templates'
import { brandingService } from 'services'
import {
  emailLogModel, userModel,
} from 'models'
import {
  errorConfig,
  localeConfig, typeConfig,
} from 'configs'

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

const buildMailer = (context: Context<typeConfig.Context>): IMailer => {
  if (context.env.SMTP) {
    return new SmtpMailer({ context })
  }

  if (context.env.SENDGRID_API_KEY && context.env.SENDGRID_SENDER_ADDRESS) {
    return new SendgridMailer({ context })
  }

  if (context.env.MAILGUN_API_KEY && context.env.MAILGUN_SENDER_ADDRESS) {
    return new MailgunMailer({ context })
  }

  if (context.env.BREVO_API_KEY && context.env.BREVO_SENDER_ADDRESS) {
    return new BrevoMailer({ context })
  }

  throw new errorConfig.Forbidden(localeConfig.Error.NoEmailProvider)
}

export const sendEmail = async (
  c: Context<typeConfig.Context>,
  receiverEmail: string,
  subject: string,
  emailBody: string,
) => {
  const {
    ENVIRONMENT: environment,
    DEV_EMAIL_RECEIVER: devEmailReceiver,
    EMAIL_SENDER_NAME: senderName,
  } = env(c)

  const receiver = environment === 'prod' ? receiverEmail : devEmailReceiver
  const { ENABLE_EMAIL_LOG: enableEmailLog } = env(c)

  const mailer = buildMailer(c)
  const mailerResponse = await mailer.sendEmail({
    senderName, content: emailBody, email: receiver, subject,
  })
  const success = mailerResponse.status < 400 ? 1 : 0

  if (enableEmailLog) {
    await emailLogModel.create(
      c.env.DB,
      {
        success,
        receiver,
        response: JSON.stringify(mailerResponse),
        content: emailBody,
      },
    )
  }

  return success
}

export const sendEmailVerification = async (
  c: Context<typeConfig.Context>,
  user: userModel.Record,
  locale: typeConfig.Locale,
) => {
  const { AUTH_SERVER_URL: serverUrl } = env(c)

  if (!user.email) return null
  checkEmailSetup(c)

  const verificationCode = cryptoUtil.genRandom6DigitString()
  const content = (<EmailVerificationTemplate
    serverUrl={serverUrl}
    authId={user.authId}
    verificationCode={verificationCode}
    org={user.orgSlug ?? ''}
    branding={await brandingService.getBranding(
      c,
      user.orgSlug,
    )}
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
  if (!user.email) return null
  checkEmailSetup(c)

  const resetCode = cryptoUtil.genRandom6DigitString()
  const content = (<PasswordResetTemplate
    resetCode={resetCode}
    branding={await brandingService.getBranding(
      c,
      user.orgSlug,
    )}
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
  org?: string,
) => {
  if (!email) return null
  checkEmailSetup(c)

  const verificationCode = cryptoUtil.genRandom6DigitString()
  const content = (<ChangeEmailVerificationTemplate
    verificationCode={verificationCode}
    branding={await brandingService.getBranding(
      c,
      org,
    )}
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
  if (!user.email) return null
  checkEmailSetup(c)

  const mfaCode = cryptoUtil.genRandom6DigitString()
  const content = (<EmailMfaTemplate
    mfaCode={mfaCode}
    branding={await brandingService.getBranding(
      c,
      user.orgSlug,
    )}
    locale={locale} />).toString()

  const res = await sendEmail(
    c,
    user.email,
    localeConfig.emailMfaEmail.subject[locale],
    content,
  )

  return res ? mfaCode : null
}
