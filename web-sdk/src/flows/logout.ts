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
  if (!localOnly && refreshToken) {
    try {
      await postLogout(
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

  const res = storage.removeItem(StorageKey.RefreshToken)
  console.log(res)

  if (postLogoutRedirectUri) window.location.href = postLogoutRedirectUri
  return true
}
