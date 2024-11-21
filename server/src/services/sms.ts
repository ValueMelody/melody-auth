import { Buffer } from 'buffer'
import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  errorConfig,
  localeConfig, typeConfig,
} from 'configs'
import { cryptoUtil } from 'utils'
import { smsLogModel } from 'models'

const checkSmsSetup = (c: Context<typeConfig.Context>) => {
  const {
    TWILIO_ACCOUNT_ID: twilioAccountId,
    TWILIO_AUTH_TOKEN: twilioAuthToken,
    TWILIO_SENDER_NUMBER: twilioSenderNumber,
  } = env(c)
  if (
    !twilioAccountId || !twilioAuthToken || !twilioSenderNumber
  ) {
    throw new errorConfig.Forbidden(localeConfig.Error.NoSmsSender)
  }
}

export const sendSms = async (
  c: Context<typeConfig.Context>,
  receiverPhoneNumber: string,
  smsBody: string,
) => {
  const {
    TWILIO_ACCOUNT_ID: twilioAccountId,
    TWILIO_AUTH_TOKEN: twilioAuthToken,
    TWILIO_SENDER_NUMBER: twilioSenderNumber,
    ENVIRONMENT: environment,
    DEV_SMS_RECEIVER: devSmsReceiver,
    ENABLE_SMS_LOG: enableSmsLog,
  } = env(c)

  const receiver = environment === 'prod' ? receiverPhoneNumber : devSmsReceiver

  let success = false
  let response = null

  if (twilioAccountId && twilioAuthToken && twilioSenderNumber) {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountId}/Messages.json`
    const params = new URLSearchParams()
    params.append(
      'To',
      receiver,
    )
    params.append(
      'From',
      twilioSenderNumber,
    )
    params.append(
      'Body',
      smsBody,
    )

    const auth = `Basic ${Buffer.from(`${twilioAccountId}:${twilioAuthToken}`).toString('base64')}`

    const res = await fetch(
      url,
      {
        method: 'POST',
        body: params,
        headers: {
          Authorization: auth,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    )
    success = res.ok
    response = await res.text()
  }

  if (enableSmsLog) {
    await smsLogModel.create(
      c.env.DB,
      {
        success: success ? 1 : 0,
        receiver,
        response: response ?? '',
        content: smsBody,
      },
    )
  }

  return success
}

export const sendSmsMfa = async (
  c: Context<typeConfig.Context>,
  phoneNumber: string,
  locale: typeConfig.Locale,
) => {
  checkSmsSetup(c)

  const mfaCode = cryptoUtil.genRandom6DigitString()
  const content = `${localeConfig.smsMfaMsg.body[locale]}: ${mfaCode}`

  const res = await sendSms(
    c,
    phoneNumber,
    content,
  )

  return res ? mfaCode : null
}
