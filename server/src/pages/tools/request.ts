import {
  FollowUpParams, AuthorizeParams,
} from './param'
import { View } from 'pages/hooks'
import {
  routeConfig, typeConfig,
} from 'configs'

export const parseResponse = (response: Response) => {
  console.log('response', response)
  if (!response.ok) {
    return response.text().then((text) => {
      throw new Error(text)
    })
  }
  return response.json()
}

export const parseAuthorizeBaseValues = (
  params: AuthorizeParams, locale: typeConfig.Locale,
) => {
  return {
    clientId: params.clientId,
    redirectUri: params.redirectUri,
    responseType: params.responseType,
    state: params.state,
    policy: params.policy,
    codeChallenge: params.codeChallenge,
    codeChallengeMethod: params.codeChallengeMethod,
    locale,
    org: params.org,
    scope: params.scope,
  }
}

export const parseAuthorizeFollowUpValues = (
  params: FollowUpParams, locale: typeConfig.Locale,
) => {
  return {
    code: params.code,
    locale,
    org: params.org,
  }
}

export const handleAuthorizeStep = (
  data: any,
  locale: typeConfig.Locale,
  onSwitchView: (view: View) => void,
) => {
  if (data.nextPage) {
    const step = data.nextPage
    if (data.code && data.state && data.redirectUri) {
      const newUrl = new URL(`${window.location.origin}${routeConfig.IdentityRoute.ProcessView}`)
      newUrl.searchParams.set(
        'code',
        data.code,
      )
      newUrl.searchParams.set(
        'state',
        data.state,
      )
      newUrl.searchParams.set(
        'redirect_uri',
        data.redirectUri,
      )
      newUrl.searchParams.set(
        'org',
        data.org ?? '',
      )
      newUrl.searchParams.set(
        'locale',
        locale,
      )
      newUrl.searchParams.set(
        'step',
        step,
      )
      window.history.pushState(
        {},
        '',
        newUrl,
      )
    }
    onSwitchView(step)
  } else {
    if (window.opener) {
      window.opener.postMessage(
        {
          state: data.state,
          code: data.code,
          locale,
          org: data.org ?? '',
          redirectUri: data.redirectUri,
        },
        data.redirectUri,
      )
    } else {
      const queryString = `?state=${data.state}&code=${data.code}&locale=${locale}&org=${data.org ?? ''}`
      const url = `${data.redirectUri}${queryString}`
      window.location.href = url
    }
  }
}
