import { env } from 'hono/adapter'
import {
  IMailer, SendEmailOptions,
} from './interface'

export class MailgunMailer extends IMailer {
  async sendEmail ({
    email, subject, content, senderName,
  }: SendEmailOptions) {
    const {
      MAILGUN_API_KEY: apiKey, MAILGUN_SENDER_ADDRESS: sender,
    } = env(this.context)

    const form = new FormData()
    form.append(
      'from',
      `${senderName} <${sender}>`,
    )
    form.append(
      'to',
      email,
    )
    form.append(
      'subject',
      subject,
    )
    form.append(
      'html',
      content,
    )

    const [, domain] = sender.split('@')

    const auth = Buffer.from(`api:${apiKey}`).toString('base64')

    const res = await fetch(
      `https://api.mailgun.net/v3/${domain}/messages`,
      {
        method: 'POST',
        headers: { Authorization: `Basic ${auth}` },
        body: form,
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
