import {
  afterEach, beforeEach, describe, expect, test, vi,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { ServiceProviderInstance } from 'samlify'
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
  identityService, userService,
} from 'services'
import { loggerUtil } from 'utils'
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
  vi.restoreAllMocks()
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

const SP_ENTITY_ID = 'http://localhost:8787/saml/sp/v1/metadata'
const SP_ACS_URL = 'http://localhost:8787/saml/sp/v1/acs'
const USER_ID_ATTRIBUTE = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'

const insertSamlIdp = async () => {
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
}

const seedAcsSession = async (samlRequestId?: string) => {
  const sessionId = 'saml-acs-session'
  const session = {
    appId: 1,
    appName: 'Admin Panel',
    request: {
      policy: 'saml_sso_test',
      locale: 'en',
      redirectUri: 'http://localhost:3000/en/dashboard',
    },
    ...(samlRequestId === undefined ? {} : { samlRequestId }),
  }
  await mockedKV.put(
    `${adapterConfig.BaseKVKey.EmbeddedSession}-${sessionId}`,
    JSON.stringify(session),
  )
  return sessionId
}

const futureTimestamp = () => new Date(Date.now() + 5 * 60 * 1000).toISOString()

const buildValidExtract = (samlRequestId: string) => ({
  response: {
    id: '_response_1',
    inResponseTo: samlRequestId,
    destination: SP_ACS_URL,
  },
  audience: SP_ENTITY_ID,
  conditions: { notOnOrAfter: futureTimestamp() },
  attributes: { [USER_ID_ATTRIBUTE]: 'saml-user-1' },
})

const mockParseLoginResponse = (extract: Record<string, unknown>) => vi.spyOn(
  ServiceProviderInstance.prototype,
  'parseLoginResponse',
).mockResolvedValue({ extract } as unknown as Awaited<ReturnType<ServiceProviderInstance['parseLoginResponse']>>)

const postAcs = (sessionId: string) => app.request(
  `${routeConfig.InternalRoute.SamlSp}/acs`,
  {
    method: 'POST',
    body: new URLSearchParams({
      RelayState: sessionId,
      SAMLResponse: 'mocked-response',
    }).toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  },
  mock(db),
)

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
      'should store the authn request id on the session',
      async () => {
        process.env.ENABLE_SAML_SSO_AS_SP = true as unknown as string

        const { res } = await prepareLoginRequest()
        const url = new URL(res.headers.get('Location') ?? '')
        const sessionId = url.searchParams.get('RelayState')

        const sessionStr = await mockedKV.get(`${adapterConfig.BaseKVKey.EmbeddedSession}-${sessionId}`) as string
        const session = JSON.parse(sessionStr) as EmbeddedSessionBody
        expect(typeof session.samlRequestId).toBe('string')
        expect((session.samlRequestId ?? '').length).toBeGreaterThan(0)

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
      'should throw error if idp is not active',
      async () => {
        process.env.ENABLE_SAML_SSO_AS_SP = true as unknown as string

        await db.prepare(`
          INSERT INTO saml_idp (
            name,
            metadata,
            "userIdAttribute",
            "isActive"
          ) VALUES (
            'test',
            ?,
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
            0
          )
        `).run(samlIdpMetaDataMock)

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

describe(
  '/acs',
  () => {
    beforeEach(() => {
      process.env.ENABLE_SAML_SSO_AS_SP = true as unknown as string
    })

    afterEach(() => {
      process.env.ENABLE_SAML_SSO_AS_SP = false as unknown as string
    })

    test(
      'should reject a response whose InResponseTo does not match the request',
      async () => {
        await insertSamlIdp()
        const sessionId = await seedAcsSession('_req_match')

        const extract = buildValidExtract('_req_match')
        extract.response.inResponseTo = '_wrong_request'
        mockParseLoginResponse(extract)
        const loggerSpy = vi.spyOn(
          loggerUtil,
          'triggerLogger',
        )

        const res = await postAcs(sessionId)
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.InvalidSamlResponse)
        expect(loggerSpy).toHaveBeenCalledWith(
          expect.anything(),
          loggerUtil.LoggerLevel.Warn,
          messageConfig.RequestError.InvalidSamlInResponseTo,
        )
      },
    )

    test(
      'should reject a response when the session has no stored request id',
      async () => {
        await insertSamlIdp()
        const sessionId = await seedAcsSession()

        mockParseLoginResponse(buildValidExtract('_any_request'))
        const loggerSpy = vi.spyOn(
          loggerUtil,
          'triggerLogger',
        )

        const res = await postAcs(sessionId)
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.InvalidSamlResponse)
        expect(loggerSpy).toHaveBeenCalledWith(
          expect.anything(),
          loggerUtil.LoggerLevel.Warn,
          messageConfig.RequestError.InvalidSamlInResponseTo,
        )
      },
    )

    test(
      'should reject a response whose audience does not include the SP entity id',
      async () => {
        await insertSamlIdp()
        const sessionId = await seedAcsSession('_req_match')

        const extract = buildValidExtract('_req_match')
        extract.audience = 'urn:another-service-provider'
        mockParseLoginResponse(extract)
        const loggerSpy = vi.spyOn(
          loggerUtil,
          'triggerLogger',
        )

        const res = await postAcs(sessionId)
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.InvalidSamlResponse)
        expect(loggerSpy).toHaveBeenCalledWith(
          expect.anything(),
          loggerUtil.LoggerLevel.Warn,
          messageConfig.RequestError.InvalidSamlAudience,
        )
      },
    )

    test(
      'should reject a response with no audience restriction',
      async () => {
        await insertSamlIdp()
        const sessionId = await seedAcsSession('_req_match')

        const extract = buildValidExtract('_req_match') as Record<string, unknown>
        delete extract.audience
        mockParseLoginResponse(extract)
        const loggerSpy = vi.spyOn(
          loggerUtil,
          'triggerLogger',
        )

        const res = await postAcs(sessionId)
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.InvalidSamlResponse)
        expect(loggerSpy).toHaveBeenCalledWith(
          expect.anything(),
          loggerUtil.LoggerLevel.Warn,
          messageConfig.RequestError.InvalidSamlAudience,
        )
      },
    )

    test(
      'should reject a response whose destination is not the ACS url',
      async () => {
        await insertSamlIdp()
        const sessionId = await seedAcsSession('_req_match')

        const extract = buildValidExtract('_req_match')
        extract.response.destination = 'https://attacker.example.com/acs'
        mockParseLoginResponse(extract)
        const loggerSpy = vi.spyOn(
          loggerUtil,
          'triggerLogger',
        )

        const res = await postAcs(sessionId)
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.InvalidSamlResponse)
        expect(loggerSpy).toHaveBeenCalledWith(
          expect.anything(),
          loggerUtil.LoggerLevel.Warn,
          messageConfig.RequestError.InvalidSamlDestination,
        )
      },
    )

    test(
      'should reject a replayed response',
      async () => {
        await insertSamlIdp()
        const sessionId = await seedAcsSession('_req_match')

        await mockedKV.put(
          adapterConfig.getKVKey(
            adapterConfig.BaseKVKey.SamlResponseId,
            '_response_1',
          ),
          '1',
        )
        mockParseLoginResponse(buildValidExtract('_req_match'))
        const loggerSpy = vi.spyOn(
          loggerUtil,
          'triggerLogger',
        )

        const res = await postAcs(sessionId)
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.InvalidSamlResponse)
        expect(loggerSpy).toHaveBeenCalledWith(
          expect.anything(),
          loggerUtil.LoggerLevel.Warn,
          messageConfig.RequestError.SamlResponseReplayed,
        )
      },
    )

    test(
      'should accept a valid response and record it to block replay',
      async () => {
        await insertSamlIdp()
        const sessionId = await seedAcsSession('_req_match')

        mockParseLoginResponse(buildValidExtract('_req_match'))
        const processSamlAccountSpy = vi.spyOn(
          userService,
          'processSamlAccount',
        ).mockResolvedValue({
          id: 1,
          authId: 'saml-auth-id',
        } as unknown as Awaited<ReturnType<typeof userService.processSamlAccount>>)
        vi.spyOn(
          identityService,
          'processPostAuthorize',
        ).mockResolvedValue({
          state: '123',
          code: 'test-code',
          redirectUri: 'http://localhost:3000/en/dashboard',
          nextPage: routeConfig.View.SignIn,
        } as unknown as Awaited<ReturnType<typeof identityService.processPostAuthorize>>)

        const res = await postAcs(sessionId)
        expect(res.status).toBe(302)
        expect(res.headers.get('Location')).toBe('http://localhost:3000/en/dashboard?state=123&code=test-code&locale=en')
        expect(processSamlAccountSpy).toHaveBeenCalledTimes(1)
        expect(processSamlAccountSpy.mock.calls[0][1]).toStrictEqual({
          userId: 'saml-user-1',
          email: null,
          firstName: null,
          lastName: null,
        })

        const consumed = await mockedKV.get(adapterConfig.getKVKey(
          adapterConfig.BaseKVKey.SamlResponseId,
          '_response_1',
        ))
        expect(consumed).toBe('1')
      },
    )

    test(
      'should accept a valid response whose audience is provided as a list',
      async () => {
        await insertSamlIdp()
        const sessionId = await seedAcsSession('_req_match')

        const extract = buildValidExtract('_req_match') as Record<string, unknown>
        extract.audience = ['urn:another-service-provider', SP_ENTITY_ID]
        mockParseLoginResponse(extract)
        vi.spyOn(
          userService,
          'processSamlAccount',
        ).mockResolvedValue({ id: 1 } as unknown as Awaited<ReturnType<typeof userService.processSamlAccount>>)
        vi.spyOn(
          identityService,
          'processPostAuthorize',
        ).mockResolvedValue({
          state: '123',
          code: 'test-code',
          redirectUri: 'http://localhost:3000/en/dashboard',
          nextPage: routeConfig.View.SignIn,
        } as unknown as Awaited<ReturnType<typeof identityService.processPostAuthorize>>)

        const res = await postAcs(sessionId)
        expect(res.status).toBe(302)
      },
    )
  },
)
