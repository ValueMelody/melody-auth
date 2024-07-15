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
  const combinedScopes = scopes.map((scope) => scope.trim().toLowerCase());
  ['openid', 'profile', 'offline_access'].forEach((scope) => {
    if (!combinedScopes.includes(scope)) combinedScopes.push(scope)
  })
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

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text)
  }

  const data: GetUserInfo = await res.json()
  return data
}

export const postLogout = async (
  { baseUri }: ProviderConfig, {
    accessToken, refreshToken, postLogoutRedirectUri,
  }: {
  accessToken: string;
  refreshToken: string;
  postLogoutRedirectUri: string;
},
) => {
  const url = `${baseUri}/oauth2/logout`
  const data = {
    refresh_token: refreshToken,
    post_logout_redirect_uri: postLogoutRedirectUri,
  }
  const urlEncodedData = new URLSearchParams(data).toString()

  const res = await fetch(
    url,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: urlEncodedData,
    },
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text)
  }
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
    refresh_token: refreshToken,
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

  const data: PostTokenByRefreshToken = await res.json()

  return data
}
