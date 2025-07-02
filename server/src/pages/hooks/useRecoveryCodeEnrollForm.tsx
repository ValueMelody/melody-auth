import {
  useCallback, useMemo, useState,
} from 'hono/jsx'
import { View } from './useCurrentView'
import {
  routeConfig, typeConfig,
} from 'configs'
import { getFollowUpParams } from 'pages/tools/param'
import {
  parseResponse, parseAuthorizeFollowUpValues, handleAuthorizeStep,
} from 'pages/tools/request'
import { GetProcessRecoveryCodeEnrollRes } from 'handlers/identity/recoveryCode'

export interface UseRecoveryCodeEnrollFormProps {
  locale: typeConfig.Locale;
  onSubmitError: (error: string | null) => void;
  onSwitchView: (view: View) => void;
}

const useRecoveryCodeEnrollForm = ({
  locale,
  onSubmitError,
  onSwitchView,
}: UseRecoveryCodeEnrollFormProps) => {
  const followUpParams = useMemo(
    () => getFollowUpParams(),
    [],
  )
  const qs = `?code=${followUpParams.code}&locale=${locale}&org=${followUpParams.org}`

  const [recoveryCodeEnrollInfo, setRecoveryCodeEnrollInfo] = useState<GetProcessRecoveryCodeEnrollRes | null>(null)

  const getRecoveryCodeEnrollInfo = useCallback(
    () => {
      fetch(
        `${routeConfig.IdentityRoute.ProcessRecoveryCodeEnroll}${qs}`,
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
          setRecoveryCodeEnrollInfo(response as GetProcessRecoveryCodeEnrollRes)
        })
        .catch((error) => {
          onSubmitError(error)
        })
    },
    [onSubmitError, qs],
  )

  const handleContinue = useCallback(
    () => {
      fetch(
        routeConfig.IdentityRoute.ProcessRecoveryCodeEnroll,
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
    [followUpParams, locale, onSubmitError, onSwitchView],
  )

  return {
    recoveryCodeEnrollInfo,
    getRecoveryCodeEnrollInfo,
    handleContinue,
  }
}

export default useRecoveryCodeEnrollForm
