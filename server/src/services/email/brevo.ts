import { env } from 'hono/adapter'
import {
  IMailer, SendEmailOptions,
} from './interface'

export class BrevoMailer extends IMailer {
  async sendEmail ({
    email, subject, content, senderName,
  }: SendEmailOptions) {
    const {
      BREVO_API_KEY: apiKey, BREVO_SENDER_ADDRESS: sender,
    } = env(this.context)

    const res = await fetch(
      'https://api.brevo.com/v3/smtp/email',
      {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: senderName,
            email: sender,
          },
          subject,
          htmlContent: content,
          to: [
            { email },
          ],
        }),
      },
    )

    return {
      status: res.status,
      statusText: res.statusText,
      url: res.url,
      body: await res.text(),
    }
  }
}
