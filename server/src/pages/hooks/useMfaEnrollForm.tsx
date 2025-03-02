import {
  useCallback, useMemo, useState,
} from 'hono/jsx'
import { View } from './'
import {
  routeConfig, typeConfig,
} from 'configs'
import { MfaEnrollInfo } from 'handlers/identity/mfa'
import { userModel } from 'models'
import { getFollowUpParams } from 'pages/tools/param'
import {
  handleAuthorizeStep, parseAuthorizeFollowUpValues,
  parseResponse,
} from 'pages/tools/request'

export interface UseMfaEnrollFormProps {
  locale: typeConfig.Locale;
  onSubmitError: (error: string | null) => void;
  onSwitchView: (view: View) => void;
}

const useMfaEnrollForm = ({
  locale,
  onSubmitError,
  onSwitchView,
}: UseMfaEnrollFormProps) => {
  const followUpParams = useMemo(
    () => getFollowUpParams(),
    [],
  )
  const qs = `?code=${followUpParams.code}&locale=${locale}&org=${followUpParams.org}`

  const [mfaEnrollInfo, setMfaEnrollInfo] = useState<MfaEnrollInfo | null>(null)

  const getMfaEnrollInfo = useCallback(
    () => {
      fetch(
        `${routeConfig.IdentityRoute.AuthorizeMfaEnrollInfo}${qs}`,
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
          setMfaEnrollInfo(response as MfaEnrollInfo)
        })
        .catch((error) => {
          onSubmitError(error)
        })
    },
    [onSubmitError, qs],
  )

  const handleEnroll = useCallback(
    (mfaType: userModel.MfaType) => {
      fetch(
        routeConfig.IdentityRoute.AuthorizeMfaEnroll,
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
            type: mfaType,
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

  return {
    mfaEnrollInfo,
    getMfaEnrollInfo,
    handleEnroll,
  }
}

export default useMfaEnrollForm
