import { StorageKey } from '../definitions'
import {
  CommonParam,
  postLogout,
} from '../requests'

export const logout = async (
  common: CommonParam, refreshToken: string, postLogoutRedirectUri: string, localOnly: boolean = false,
) => {
  try {
    if (!localOnly) {
      await postLogout(
        common,
        {
          refreshToken, postLogoutRedirectUri,
        },
      )
    }

    const storage = common.storage === 'localStorage' ? window.localStorage : window.sessionStorage
    storage.removeItem(StorageKey.AccessToken)
    storage.removeItem(StorageKey.RefreshToken)

    return true
  } catch (e) {
    throw new Error('Failed to logout.')
  }
}
