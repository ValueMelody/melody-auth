import { Context } from 'hono'
import { typeConfig } from '../../configs'

type BuilderOpts = {
  context: Context<typeConfig.Context>;
}

export type SendEmailOptions = {
  email: string;
  subject: string;
  content: string;
  senderName: string;
}

export abstract class IMailer {
  protected context: Context<typeConfig.Context>

  constructor (opts: BuilderOpts) {
    this.context = opts.context
  }

  abstract sendEmail(options: SendEmailOptions): Promise<any>
}
