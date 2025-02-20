import { env } from 'hono/adapter'
import {
  IMailer, SendEmailOptions,
} from './interface'

export class SendgridMailer extends IMailer {
  async sendEmail ({
    email, subject, content, senderName,
  }: SendEmailOptions) {
    const {
      SENDGRID_API_KEY: apiKey, SENDGRID_SENDER_ADDRESS: sender,
    } = env(this.context)

    const res = await fetch(
      'https://api.sendgrid.com/v3/mail/send',
      {
        method: 'POST',
        headers: {
          Authorization: `bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          content: [{
            type: 'text/html',
            value: content,
          }],
          personalizations: [
            {
              to: [
                { email },
              ],
            },
          ],
          from: {
            email: sender, name: senderName,
          },
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
