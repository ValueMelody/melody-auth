import {
  AccessTokenStorage, StorageKey,
} from 'definitions'
import {
  CommonProps,
  postTokenByRefreshToken,
} from 'requests'

export const exchangeTokenByRefreshToken = async (
  common: CommonProps, refreshToken: string,
) => {
  try {
    const result = await postTokenByRefreshToken(
      common,
      { refreshToken },
    )
    const accessTokenStorage: AccessTokenStorage = {
      accessToken: result.access_token,
      expiresIn: result.expires_in,
      expiresOn: result.expires_on,
    }

    const storage = common.storage === 'localStorage' ? window.localStorage : window.sessionStorage
    storage.setItem(
      StorageKey.AccessToken,
      JSON.stringify(accessTokenStorage),
    )

    return accessTokenStorage
  } catch (e) {
    throw new Error('Failed to exchange access token by refresh token.')
  }
}
