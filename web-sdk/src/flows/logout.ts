import { ProviderConfig } from '../../../global'
import { StorageKey } from '../definitions'
import { postLogout } from '../requests'

export const logout = async (
  config: ProviderConfig, refreshToken: string, postLogoutRedirectUri: string, localOnly: boolean = false,
) => {
  try {
    if (!localOnly) {
      await postLogout(
        config,
        {
          refreshToken, postLogoutRedirectUri,
        },
      )
    }

    const storage = config.storage === 'localStorage' ? window.localStorage : window.sessionStorage
    storage.removeItem(StorageKey.RefreshToken)

    return true
  } catch (e) {
    throw new Error('Failed to logout.')
  }
}
