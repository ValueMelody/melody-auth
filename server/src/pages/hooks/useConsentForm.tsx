import {
  useCallback, useMemo, useState,
} from 'hono/jsx'

import { View } from './useCurrentView'
import { getFollowUpParams } from 'pages/tools/param'
import {
  routeConfig, typeConfig,
} from 'configs'
import { AuthorizeConsentInfo } from 'handlers/identity'
import {
  handleAuthorizeStep, parseAuthorizeFollowUpValues,
  parseResponse,
} from 'pages/tools/request'

export interface UseConsentFormProps {
  locale: typeConfig.Locale;
  onSubmitError: (error: string | null) => void;
  onSwitchView: (view: View) => void;
}

const useConsentForm = ({
  locale,
  onSubmitError,
  onSwitchView,
}: UseConsentFormProps) => {
  const followUpParams = useMemo(
    () => getFollowUpParams(),
    [],
  )
  const qs = `?code=${followUpParams.code}&locale=${locale}&org=${followUpParams.org}`

  const [consentInfo, setConsentInfo] = useState<AuthorizeConsentInfo | null>(null)

  const getConsentInfo = useCallback(
    () => {
      fetch(
        `${routeConfig.IdentityRoute.AuthorizeConsentInfo}${qs}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      )
        .then(parseResponse)
        .then((response) => {
          setConsentInfo(response as AuthorizeConsentInfo)
        })
        .catch((error) => {
          onSubmitError(error)
        })
    },
    [onSubmitError, qs],
  )

  const handleAccept = useCallback(
    () => {
      fetch(
        routeConfig.IdentityRoute.AuthorizeConsent,
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
          }),
        },
      )
        .then(parseResponse)
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
    [onSubmitError, locale, followUpParams, onSwitchView],
  )

  const handleDecline = useCallback(
    () => {
      window.location.href = followUpParams.redirectUri
    },
    [followUpParams],
  )

  return {
    getConsentInfo,
    consentInfo,
    handleAccept,
    handleDecline,
  }
}

export default useConsentForm
