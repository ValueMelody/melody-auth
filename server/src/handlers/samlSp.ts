import { Context } from 'hono'
import {
  errorConfig, messageConfig,
} from 'configs'
import {
  samlService, userService,
} from 'services'

export const getSamlSpLogin = async (c: Context) => {
  const { name } = c.req.param()

  const sp = await samlService.createSp(c)

  const { provider: idp } = await samlService.loadIdp(
    c,
    name,
  )

  const { context } = await sp.createLoginRequest(
    idp,
    'redirect',
  )

  const url = new URL(context)
  url.searchParams.set(
    'RelayState',
    name,
  )

  return c.redirect(
    url.toString(),
    302,
  )
}

export const getSamlSpMetadata = async (c: Context) => {
  const sp = await samlService.createSp(c)
  return c.text(
    sp.getMetadata(),
    200,
    { 'Content-Type': 'application/xml' },
  )
}

export const postSamlSpAcs = async (c: Context) => {
  const sp = await samlService.createSp(c)
  const body = await c.req.parseBody()
  const name = body.RelayState as string

  const {
    provider: idp, record,
  } = await samlService.loadIdp(
    c,
    name,
  )

  try {
    const { extract } = await sp.parseLoginResponse(
      idp,
      'post',
      { body },
    )

    const userId = extract.attributes[record.userIdAttribute]
    const email = record.emailAttribute ? extract.attributes[record.emailAttribute] : null
    const firstName = record.firstNameAttribute ? extract.attributes[record.firstNameAttribute] : null
    const lastName = record.lastNameAttribute ? extract.attributes[record.lastNameAttribute] : null

    const samlUser: userService.SamlUser = {
      userId,
      email: email ?? null,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
    }

    const user = await userService.processSamlAccount(
      c,
      samlUser,
      name,
      'en',
    )

    return c.json(
      {
        user,
        extract,
        record,
      },
      200,
    )
  } catch (error) {
    throw new errorConfig.Forbidden(messageConfig.RequestError.InvalidSamlResponse)
  }
}
