import { html } from 'hono/html'
import { oauthDto } from 'dtos'
import { Policy } from 'dtos/oauth'
import { EnrollOptions } from 'views/AuthorizePasskeyEnroll'

export const parseAuthorizeBaseValues = (queryDto: oauthDto.GetAuthorizeReqDto) => html`
  clientId: "${queryDto.clientId}",
  redirectUri: "${queryDto.redirectUri}",
  responseType: "${queryDto.responseType}",
  state: "${queryDto.state}",
  policy: "${queryDto.policy ?? Policy.SignInOrSignUp}",
  codeChallenge: "${queryDto.codeChallenge}",
  codeChallengeMethod: "${queryDto.codeChallengeMethod}",
  locale: "${queryDto.locale}",
  org: "${queryDto.org}",
  scope: "${queryDto.scopes.join(' ')}",
`

export const triggerPasskeyEnroll = (enrollOptions: EnrollOptions) => html`
  navigator.credentials.create({ publicKey: {
    challenge: window.SimpleWebAuthnBrowser.base64URLStringToBuffer("${enrollOptions.challenge}"),
    rp: { name: "Melody Auth Service", id: "${enrollOptions.rpId}" },
    user: {
      id: new TextEncoder().encode("${enrollOptions.userId}"),
      name: new TextEncoder().encode("${enrollOptions.userEmail}"),
      displayName: "${enrollOptions.userDisplayName}",
    },
    pubKeyCredParams: [
      { alg: -8, type: 'public-key' },
      { alg: -7, type: 'public-key' },
      { alg: -257, type: 'public-key' }
    ],
    authenticatorSelection: {
      userVerification: "preferred",
    }
  }})
`
