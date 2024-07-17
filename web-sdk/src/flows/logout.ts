import { ProviderConfig } from '../../../global'
import { StorageKey } from '../definitions'
import { postLogout } from '../requests'

export const logout = async (
  config: ProviderConfig,
  accessToken: string,
  refreshToken: string | null,
  postLogoutRedirectUri: string,
  localOnly: boolean,
) => {
  let redirectUri = postLogoutRedirectUri
  if (!localOnly && refreshToken) {
    try {
      redirectUri = await postLogout(
        config,
        {
          accessToken, refreshToken, postLogoutRedirectUri,
        },
      )
    } catch (e) {
      throw new Error(`Failed to logout: ${e}`)
    }
  }

  const storage = config.storage === 'localStorage' ? window.localStorage : window.sessionStorage

  storage.removeItem(StorageKey.RefreshToken)

  window.location.href = redirectUri
}
