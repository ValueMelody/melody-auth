import { ProviderConfig } from '../../../global'
import { AccessTokenStorage } from '../definitions'
import { postTokenByRefreshToken } from '../requests'

export const exchangeTokenByRefreshToken = async (
  config: ProviderConfig, refreshToken: string,
) => {
  try {
    const result = await postTokenByRefreshToken(
      config,
      { refreshToken },
    )
    const accessTokenStorage: AccessTokenStorage = {
      accessToken: result.access_token,
      expiresIn: result.expires_in,
      expiresOn: result.expires_on,
    }

    return accessTokenStorage
  } catch (e) {
    throw new Error(`Failed to exchange access_token by refresh_token: ${e}`)
  }
}
