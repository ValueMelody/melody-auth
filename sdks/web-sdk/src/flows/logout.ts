import {
  AuthStorage,
  getStorage,
  ProviderConfig, StorageKey,
} from '@melody-auth/shared'
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

  const storage: AuthStorage = getStorage(config.storage);

  storage.removeItem(StorageKey.RefreshToken)
  storage.removeItem(StorageKey.IdToken)

  window.location.href = redirectUri
}
