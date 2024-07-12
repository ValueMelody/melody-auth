import {
  CommonProps,
  getUserInfo,
} from 'requests'

export const fetchUserInfo = async (
  common: CommonProps, accessToken: string,
) => {
  try {
    const result = await getUserInfo(
      common,
      { accessToken },
    )

    return result
  } catch (e) {
    throw new Error('Failed to fetch user info.')
  }
}
