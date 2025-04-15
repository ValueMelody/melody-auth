import {
  ProviderConfig, StorageKey,
} from 'shared'
import { postLogout } from '../requests'

export const logout = async (
  config: ProviderConfig,
  accessToken: string,
  refreshToken: string | null,
  postLogoutRedirectUri: string,
  localOnly: boolean,
) => {
  let redirectUri = postLogoutRedirectUri
  if (!localOnly && refreshToken && accessToken) {
    try {
      const logoutUri = await postLogout(
        config,
        {
          accessToken, refreshToken, postLogoutRedirectUri,
        },
      )
      if (logoutUri) redirectUri = logoutUri
    } catch (e) {
      console.error(`Failed to logout remotely: ${e}`)
    }
  }

  const storage = config.storage === 'sessionStorage' ? window.sessionStorage : window.localStorage

  storage.removeItem(StorageKey.RefreshToken)
  storage.removeItem(StorageKey.Account)

  window.location.href = redirectUri
}
