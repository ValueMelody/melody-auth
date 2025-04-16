import { env } from 'hono/adapter'
import {
  IMailer, SendEmailOptions,
} from './interface'

/**
* @docs https://postmarkapp.com/developer/user-guide/send-email-with-api#send-a-single-email
*/
export class PostmarkMailer extends IMailer {
  async sendEmail ({
    email, subject, content, senderName,
  }: SendEmailOptions) {
    const {
      POSTMARK_API_KEY: apiKey, POSTMARK_SENDER_ADDRESS: senderEmail,
    } = env(this.context)

    const res = await fetch(
      'https://api.postmarkapp.com/email',
      {
        method: 'POST',
        headers: {
          'X-Postmark-Server-Token': `${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          From: `${senderName} <${senderEmail}>`,
          To: email,
          Subject: subject,
          HtmlBody: content,
          MessageStream: 'outbound',
        }),
      },
    )

    return res
  }
}
