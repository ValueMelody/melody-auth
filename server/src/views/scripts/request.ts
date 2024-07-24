import { html } from 'hono/html'
import { oauthDto } from 'dtos'

export const jsonHeader = () => html`
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
`

export const parseAuthorizeFieldValues = (queryDto: oauthDto.GetAuthorizeReqDto) => html`
  email: document.getElementById('form-email').value,
  password: document.getElementById('form-password').value,
  clientId: "${queryDto.clientId}",
  redirectUri: "${queryDto.redirectUri}",
  responseType: "${queryDto.responseType}",
  state: "${queryDto.state}",
  codeChallenge: "${queryDto.codeChallenge}",
  codeChallengeMethod: "${queryDto.codeChallengeMethod}",
  scope: "${queryDto.scopes.join(' ')}"
`
