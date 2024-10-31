import { html } from 'hono/html'
import { oauthDto } from 'dtos'
import { Policy } from 'dtos/oauth'

export const parseAuthorizeBaseValues = (queryDto: oauthDto.GetAuthorizeReqDto) => html`
  clientId: "${queryDto.clientId}",
  redirectUri: "${queryDto.redirectUri}",
  responseType: "${queryDto.responseType}",
  state: "${queryDto.state}",
  policy: "${queryDto.policy ?? Policy.SignInOrSignUp}",
  codeChallenge: "${queryDto.codeChallenge}",
  codeChallengeMethod: "${queryDto.codeChallengeMethod}",
  locale: "${queryDto.locale}",
  scope: "${queryDto.scopes.join(' ')}",
`
