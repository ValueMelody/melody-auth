import {
  View, Button,
  Text,
} from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import {
  exchangeCodeAsync,
  makeRedirectUri,
  useAuthRequest,
  useAutoDiscovery,
  fetchUserInfoAsync,
  revokeAsync,
  TokenTypeHint,
} from 'expo-auth-session'
import { useState } from 'react'

const CLIENT_ID = ''
const SERVER_URI = 'http://localhost:8787'

WebBrowser.maybeCompleteAuthSession()

export default function HomeScreen () {
  const discovery = useAutoDiscovery(SERVER_URI)
  const redirectUri = makeRedirectUri({
    scheme: 'react-native-example',
    path: 'auth',
  })

  const [accessToken, setAccessToken] = useState('')
  const [refreshToken, setRefreshToken] = useState('')
  const [userInfo, setUserInfo] = useState<object | null>(null)

  const [request, , promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: ['openid', 'profile', 'offline_access'],
      redirectUri,
    },
    discovery,
  )

  const fetchUserInfo = async () => {
    if (discovery) {
      const res = await fetchUserInfoAsync(
        { accessToken },
        discovery,
      )
      setUserInfo(res)
    }
  }

  const handleSignOut = async () => {
    if (discovery) {
      await revokeAsync(
        {
          token: refreshToken, tokenTypeHint: TokenTypeHint.RefreshToken, clientId: CLIENT_ID, clientSecret: '',
        },
        discovery,
      )
      setAccessToken('')
      setRefreshToken('')
      setUserInfo(null)
    }
  }

  return (
    <View style={{ marginTop: 60 }}>
      {!accessToken && (
        <Button
          title='Sign In'
          disabled={!request}
          onPress={() => {
            promptAsync().then((codeResponse) => {
              if (request && codeResponse?.type === 'success' && discovery) {
                exchangeCodeAsync(
                  {
                    clientId: CLIENT_ID,
                    code: codeResponse.params.code,
                    extraParams: request.codeVerifier
                      ? { code_verifier: request.codeVerifier }
                      : undefined,
                    redirectUri,
                  },
                  discovery,
                ).then((res: any) => {
                  setAccessToken(res.accessToken)
                  setRefreshToken(res.refreshToken)
                })
              }
            })
          }}
        />
      )}
      {accessToken && <Text>{accessToken}</Text>}
      {accessToken && (
        <Button
          onPress={fetchUserInfo}
          title='Get user info'
        />
      )}
      {userInfo && (
        <Text>{JSON.stringify(userInfo)}</Text>
      )}
      {accessToken && (
        <Button
          title='Sign Out'
          onPress={handleSignOut}
        />
      )}
    </View>
  )
}
