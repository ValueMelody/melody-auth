import { env } from 'hono/adapter'
import { Transporter } from 'nodemailer'
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport'
import {
  IMailer, SendEmailOptions,
} from './interface'

export class SmtpMailer extends IMailer {
  async sendEmail ({
    email, subject, content, senderName,
  }: SendEmailOptions) {
    const { SMTP_SENDER_ADDRESS: sender } = env(this.context)

    const transporter: Transporter<SentMessageInfo> = this.context.env.SMTP.init()
    const res = await transporter.sendMail({
      from: `"${senderName}" ${sender}`,
      to: email,
      subject,
      html: content,
    })

    return res
  }
}
