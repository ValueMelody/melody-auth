import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import app from 'saml/index'
import {
  migrate, mock,
  mockedKV,
  samlIdpMetaDataMock,
} from 'tests/mock'
import {
  adapterConfig, messageConfig, routeConfig,
} from 'configs'
import {
  getApp, getAuthorizeParams,
} from 'tests/identity'
import { EmbeddedSessionBody } from 'configs/type'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

const prepareLoginRequest = async () => {
  await db.prepare(`
    INSERT INTO saml_idp (
      name,
      metadata,
      "userIdAttribute"
    ) VALUES (
      'test',
      ?,
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
    )
  `).run(samlIdpMetaDataMock)

  const appRecord = await getApp(db)
  const params = await getAuthorizeParams(appRecord)

  const res = await app.request(
    `${routeConfig.InternalRoute.SamlSp}/login${params}&policy=saml_sso_test`,
    {},
    mock(db),
  )

  return { res }
}

describe(
  '/metadata',
  () => {
    test(
      'should return metadata',
      async () => {
        process.env.ENABLE_SAML_SSO_AS_SP = true as unknown as string

        const res = await app.request(
          `${routeConfig.InternalRoute.SamlSp}/metadata`,
          {},
          mock(db),
        )
        expect(res.status).toBe(200)
        expect(res.headers.get('Content-Type')).toBe('application/xml')
        const result = await res.text()
        expect(result.startsWith('<EntityDescriptor entityID="http://localhost:8787/saml/sp/v1/metadata" xmlns="urn:oasis:names:tc:SAML:2.0:metadata" xmlns:assertion="urn:oasis:names:tc:SAML:2.0:assertion" xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><SPSSODescriptor AuthnRequestsSigned="false" WantAssertionsSigned="true" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol"><KeyDescriptor use="signing"><ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:X509Data><ds:X509Certificate>')).toBe(true)
        expect(result.endsWith('</ds:X509Certificate></ds:X509Data></ds:KeyInfo></KeyDescriptor><NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat><SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="http://localhost:8787/saml/sp/v1/slo"></SingleLogoutService><AssertionConsumerService index="0" Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="http://localhost:8787/saml/sp/v1/acs"></AssertionConsumerService></SPSSODescriptor></EntityDescriptor>')).toBe(true)
        process.env.ENABLE_SAML_SSO_AS_SP = false as unknown as string
      },
    )

    test(
      'should throw error if feature disabled',
      async () => {
        const res = await app.request(
          `${routeConfig.InternalRoute.SamlSp}/metadata`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.SamlSpNotEnabled)
      },
    )
  },
)

describe(
  '/login',
  () => {
    test(
      'should redirect to saml sign in',
      async () => {
        process.env.ENABLE_SAML_SSO_AS_SP = true as unknown as string

        const { res } = await prepareLoginRequest()
        expect(res.status).toBe(302)
        const url = new URL(res.headers.get('Location') ?? '')
        expect(url.toString().startsWith('https://test.com/samlp/PFBpZxRbQz4EiaVDW07Nc5SpBhK2HumV')).toBe(true)

        const authCode = url.searchParams.get('RelayState')

        const authCodeBody = await mockedKV.get(`${adapterConfig.BaseKVKey.EmbeddedSession}-${authCode}`) as unknown as EmbeddedSessionBody
        expect(authCodeBody).toBeDefined()

        process.env.ENABLE_SAML_SSO_AS_SP = false as unknown as string
      },
    )

    test(
      'should throw error if saml idp not found',
      async () => {
        process.env.ENABLE_SAML_SSO_AS_SP = true as unknown as string

        const appRecord = await getApp(db)
        const params = await getAuthorizeParams(appRecord)

        const res = await app.request(
          `${routeConfig.InternalRoute.SamlSp}/login${params}&policy=saml_sso_test`,
          {},
          mock(db),
        )
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(messageConfig.RequestError.NoSamlIdp)

        process.env.ENABLE_SAML_SSO_AS_SP = false as unknown as string
      },
    )

    test(
      'should throw error if policy is incorrect',
      async () => {
        process.env.ENABLE_SAML_SSO_AS_SP = true as unknown as string

        const appRecord = await getApp(db)
        const params = await getAuthorizeParams(appRecord)

        const res = await app.request(
          `${routeConfig.InternalRoute.SamlSp}/login${params}&policy=saml_test`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.InvalidPolicy)

        process.env.ENABLE_SAML_SSO_AS_SP = false as unknown as string
      },
    )

    test(
      'should throw error if feature disabled',
      async () => {
        const appRecord = await getApp(db)
        const params = await getAuthorizeParams(appRecord)

        const res = await app.request(
          `${routeConfig.InternalRoute.SamlSp}/login${params}&policy=saml_sso_test`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.SamlSpNotEnabled)
      },
    )
  },
)
