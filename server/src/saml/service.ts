import * as samlify from 'samlify'
import {
  ServiceProvider, IdentityProvider, IdentityProviderInstance, Extractor, setSchemaValidator,
} from 'samlify'
import { Context } from 'hono'
import { env } from 'hono/adapter'
import * as validator from '@authenio/samlify-node-xmllint'
import {
  typeConfig, errorConfig, messageConfig, routeConfig,
  adapterConfig,
} from 'configs'
import { samlIdpModel } from 'models'
import { loggerUtil } from 'utils'

setSchemaValidator(validator)

// Node's ESM loader can't detect samlify's SamlLib named export, so read it from the CommonJS default when present
const { SamlLib } = (samlify as typeof samlify & { default?: typeof samlify }).default ?? samlify

export const getSpEntityId = (c: Context<typeConfig.Context>) => {
  const { AUTH_SERVER_URL: serverUri } = env(c)
  return `${serverUri}${routeConfig.InternalRoute.SamlSp}/metadata`
}

export const getSpAcsUrl = (c: Context<typeConfig.Context>) => {
  const { AUTH_SERVER_URL: serverUri } = env(c)
  return `${serverUri}${routeConfig.InternalRoute.SamlSp}/acs`
}

export const createSp = async (c: Context<typeConfig.Context>) => {
  const spCrt = await c.env.KV.get(adapterConfig.BaseKVKey.SamlSpCert)
  const spKey = await c.env.KV.get(adapterConfig.BaseKVKey.SamlSpKey)

  if (!spCrt || !spKey) {
    throw new errorConfig.InternalServerError(messageConfig.ConfigError.NoSpSecret)
  }

  const { AUTH_SERVER_URL: serverUri } = env(c)

  return ServiceProvider({
    entityID: getSpEntityId(c),
    assertionConsumerService: [
      {
        Binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
        Location: getSpAcsUrl(c),
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
    clockDrifts: [-3000, 0],
  })
}

export const loadIdp = async (
  c: Context<typeConfig.Context>, name: string,
) => {
  const idpRecord = await samlIdpModel.getByName(
    c.env.DB,
    name,
  )

  if (!idpRecord || !idpRecord.isActive) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NoSamlIdp,
    )
    throw new errorConfig.NotFound(messageConfig.RequestError.NoSamlIdp)
  }

  const provider = IdentityProvider({ metadata: idpRecord.metadata })

  return {
    provider,
    record: idpRecord,
  }
}

export const getSignedAssertion = (
  idp: IdentityProviderInstance, samlContent: string,
) => {
  const [verified, assertion] = SamlLib.verifySignature(
    samlContent,
    {
      metadata: idp.entityMeta,
      signatureAlgorithm: idp.entitySetting.requestSignatureAlgorithm,
    },
  )
  if (!verified || !assertion) {
    throw new errorConfig.Forbidden(messageConfig.RequestError.InvalidSamlResponse)
  }

  const extract = Extractor.extract(
    assertion,
    [
      {
        key: 'id',
        localPath: ['Assertion'],
        attributes: ['ID'],
      },
      {
        key: 'inResponseTo',
        localPath: ['Assertion', 'Subject', 'SubjectConfirmation', 'SubjectConfirmationData'],
        attributes: ['InResponseTo'],
      },
    ],
  )

  return {
    id: typeof extract.id === 'string' ? extract.id : '',
    inResponseTo: typeof extract.inResponseTo === 'string' ? extract.inResponseTo : '',
  }
}
