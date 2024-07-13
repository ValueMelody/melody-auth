import { ProviderConfig } from '../../../global'
import { getUserInfo } from '../requests'

export const fetchUserInfo = async (
  config: ProviderConfig, accessToken: string,
) => {
  try {
    const result = await getUserInfo(
      config,
      { accessToken },
    )

    return result
  } catch (e) {
    throw new Error('Failed to fetch user info.')
  }
}