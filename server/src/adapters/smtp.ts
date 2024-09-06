import { createTransport } from 'nodemailer'

export const fit = () => (
  {
    init: () => {
      return createTransport(process.env.SMTP_CONNECTION_STRING)
    },
  }
)
