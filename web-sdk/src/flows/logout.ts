import { StorageKey } from 'definitions'
import {
  CommonProps,
  postLogout,
} from 'requests'

export const logout = async (
  common: CommonProps, refreshToken: string, localOnly: boolean = false,
) => {
  try {
    if (!localOnly) {
      await postLogout(
        common,
        { refreshToken },
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
