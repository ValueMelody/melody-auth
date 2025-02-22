import { env } from 'hono/adapter'
import {
  IMailer, SendEmailOptions,
} from './interface'

/**
* @docs https://resend.com/docs/api-reference/emails/send-email
*/
export class ResendMailer extends IMailer {
  async sendEmail ({
    email, subject, content, senderName,
  }: SendEmailOptions) {
    const {
      RESEND_API_KEY: apiKey, RESEND_SENDER_ADDRESS: senderEmail,
    } = env(this.context)

    const res = await fetch(
      'https://api.resend.com/emails',
      {
        method: 'POST',
        headers: {
          Authorization: `bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          html: content,
          to: [email],
          from: `${senderName} <${senderEmail}>`
        }),
      },
    )

    return res
  }
}
