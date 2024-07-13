import {
  ProviderConfig, PostTokenByAuthCode, PostTokenByRefreshToken, GetUserInfo,
} from '../../global'

export const getAuthorize = async (
  {
    baseUri,
    clientId,
    scopes = [],
    redirectUri,
  }: ProviderConfig, {
    state,
    codeChallenge,
  }: {
  state: string;
  codeChallenge: string;
},
) => {
  const combinedScopes = [...scopes, 'openid', 'profile', 'offline_access']
  const scopeQueries = combinedScopes.reduce(
    (
      scopeQueries, scope,
    ) => `${scopeQueries}&scope=${scope}`,
    '',
  )
  const url = baseUri +
    '/oauth2/authorize?response_type=code&state=' +
    state +
    '&client_id=' +
    clientId +
    '&redirect_uri=' +
    redirectUri +
    '&code_challenge=' +
    codeChallenge +
    '&code_challenge_method=S256' +
    scopeQueries

  window.location.href = url
}

export const getUserInfo = async (
  { baseUri }: ProviderConfig, { accessToken }: {
  accessToken: string;
},
) => {
  const url = `${baseUri}/oauth2/userinfo`
  const res = await fetch(
    url,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  )
  const data: GetUserInfo = await res.json()
  return data
}

export const postLogout = async (
  { baseUri }: ProviderConfig, {
    refreshToken, postLogoutRedirectUri,
  }: {
  refreshToken: string;
  postLogoutRedirectUri: string;
},
) => {
  const url = `${baseUri}/oauth2/logout`
  const data = {
    refreshToken, postLogoutRedirectUri,
  }
  const urlEncodedData = new URLSearchParams(data).toString()

  await fetch(
    url,
    {
      method: 'POST',
      body: urlEncodedData,
    },
  )
}

export const postTokenByAuthCode = async (
  {
    baseUri,
    redirectUri,
  }: ProviderConfig, {
    code,
    codeVerifier,
  }: {
  code: string;
  codeVerifier: string;
},
) => {
  const url = `${baseUri}/oauth2/token`
  const body = {
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  }
  const urlEncodedData = new URLSearchParams(body).toString()

  const res = await fetch(
    url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: urlEncodedData,
    },
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text)
  }

  const data: PostTokenByAuthCode = await res.json()
  return data
}

export const postTokenByRefreshToken = async (
  { baseUri }: ProviderConfig, { refreshToken }: {
  refreshToken: string;
},
) => {
  const url = `${baseUri}/oauth2/token`
  const body = {
    grant_type: 'refresh_token',
    refreshToken,
  }
  const urlEncodedData = new URLSearchParams(body).toString()

  const res = await fetch(
    url,
    {
      method: 'POST',
      body: urlEncodedData,
    },
  )
  const data: PostTokenByRefreshToken = await res.json()

  return data
}