import {
  ServiceProvider, IdentityProvider,
} from 'samlify'
import * as samlify from 'samlify'
import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  typeConfig, errorConfig, messageConfig, routeConfig,
} from 'configs'
import { samlIdpModel } from 'models'

samlify.setSchemaValidator({
  validate: () => {
    return Promise.resolve('skipped')
  },
})

export const createSp = async (c: Context<typeConfig.Context>) => {
  const spCrt = await c.env.KV.get('spCrt')
  const spKey = await c.env.KV.get('spKey')

  if (!spCrt || !spKey) {
    throw new errorConfig.InternalServerError(messageConfig.ConfigError.NoSpSecret)
  }

  const { AUTH_SERVER_URL: serverUri } = env(c)

  return ServiceProvider({
    entityID: `${serverUri}${routeConfig.InternalRoute.SamlSp}/metadata`,
    assertionConsumerService: [
      {
        Binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
        Location: `${serverUri}${routeConfig.InternalRoute.SamlSp}/acs`,
      },
    ],
    singleLogoutService: [
      {
        Binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
        Location: `${serverUri}${routeConfig.InternalRoute.SamlSp}/slo`,
      },
    ],
    privateKey: spKey,
    signingCert: spCrt,
    wantAssertionsSigned: true,
    authnRequestsSigned: false,
  })
}

export const loadIdp = async (
  c: Context<typeConfig.Context>, name: string,
) => {
  const idpRecord = await samlIdpModel.getByName(
    c.env.DB,
    name,
  )

  if (!idpRecord) {
    throw new errorConfig.NotFound(messageConfig.RequestError.NoSamlIdp)
  }

  const provider = IdentityProvider({ metadata: idpRecord.metadata })

  return {
    provider,
    record: idpRecord,
  }
}
