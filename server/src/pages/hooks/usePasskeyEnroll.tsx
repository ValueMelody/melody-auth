import {
  useCallback, useMemo, useState,
} from 'hono/jsx'
import { View } from './useCurrentView'
import {
  routeConfig, typeConfig,
} from 'configs'
import { getFollowUpParams } from 'pages/tools/param'
import {
  handleAuthorizeStep, parseAuthorizeFollowUpValues,
} from 'pages/tools/request'
import { passkeyService } from 'services'
import { AuthorizePasskeyEnrollInfo } from 'handlers/identity'

export interface UsePasskeyEnrollProps {
  locale: typeConfig.Locale;
  onSubmitError: (error: string | null) => void;
  onSwitchView: (view: View) => void;
}

const usePasskeyEnroll = ({
  locale,
  onSubmitError,
  onSwitchView,
}: UsePasskeyEnrollProps) => {
  const followUpParams = useMemo(
    () => getFollowUpParams(),
    [],
  )
  const qs = `?code=${followUpParams.code}&locale=${locale}&org=${followUpParams.org}`

  const [enrollOptions, setEnrollOptions] = useState<passkeyService.EnrollOptions | null>(null)
  const [rememberSkip, setRememberSkip] = useState(false)

  const handleRememberSkip = (checked: boolean) => {
    setRememberSkip(checked)
  }

  const getEnrollOptions = useCallback(
    async () => {
      fetch(
        `${routeConfig.IdentityRoute.AuthorizePasskeyEnrollInfo}${qs}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
      )
        .then((response) => {
          if (!response.ok) {
            return response.text().then((text) => {
              throw new Error(text)
            })
          }
          return response.json()
        })
        .then((response) => {
          setEnrollOptions((response as AuthorizePasskeyEnrollInfo).enrollOptions)
        })
        .catch((error) => {
          onSubmitError(error)
        })
    },
    [qs, onSubmitError],
  )

  const submitEnroll = useCallback(
    (enrollInfo: Credential) => {
      fetch(
        routeConfig.IdentityRoute.AuthorizePasskeyEnroll,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...parseAuthorizeFollowUpValues(
              followUpParams,
              locale,
            ),
            enrollInfo,
          }),
        },
      )
        .then((response) => {
          if (!response.ok) {
            return response.text().then((text) => {
              throw new Error(text)
            })
          }
          return response.json()
        })
        .then((response) => {
          handleAuthorizeStep(
            response,
            locale,
            onSwitchView,
          )
        })
        .catch((error) => {
          onSubmitError(error)
        })
    },
    [followUpParams, locale, onSubmitError, onSwitchView],
  )

  const handleEnroll = useCallback(
    () => {
      if (!enrollOptions) return
      navigator.credentials.create({
        publicKey: {
          challenge: (window as any).SimpleWebAuthnBrowser.base64URLStringToBuffer(enrollOptions.challenge),
          rp: {
            name: 'Melody Auth Service', id: enrollOptions.rpId,
          },
          user: {
            id: new TextEncoder().encode(String(enrollOptions.userId)),
            name: enrollOptions.userEmail,
            displayName: enrollOptions.userDisplayName,
          },
          pubKeyCredParams: [
            {
              alg: -8, type: 'public-key',
            },
            {
              alg: -7, type: 'public-key',
            },
            {
              alg: -257, type: 'public-key',
            },
          ],
          authenticatorSelection: { userVerification: 'preferred' },
        },
      })
        .then((enrollInfo) => {
          if (enrollInfo) submitEnroll(enrollInfo)
        })
    },
    [enrollOptions, submitEnroll],
  )

  const handleDecline = useCallback(
    () => {
      fetch(
        routeConfig.IdentityRoute.AuthorizePasskeyEnrollDecline,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...parseAuthorizeFollowUpValues(
              followUpParams,
              locale,
            ),
            remember: rememberSkip,
          }),
        },
      )
        .then((response) => {
          if (!response.ok) {
            return response.text().then((text) => {
              throw new Error(text)
            })
          }
          return response.json()
        })
        .then((response) => {
          handleAuthorizeStep(
            response,
            locale,
            onSwitchView,
          )
        })
        .catch((error) => {
          onSubmitError(error)
        })
    },
    [followUpParams, locale, onSubmitError, onSwitchView, rememberSkip],
  )

  return {
    enrollOptions,
    getEnrollOptions,
    rememberSkip,
    handleRememberSkip,
    handleEnroll,
    handleDecline,
  }
}

export default usePasskeyEnroll
