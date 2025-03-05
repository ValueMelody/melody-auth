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
  parseResponse,
} from 'pages/tools/request'
import { passkeyService } from 'services'
import { GetProcessPasskeyEnrollRes } from 'handlers/identity'
import { enroll } from 'pages/tools/passkey'

export interface UsePasskeyEnrollFormProps {
  locale: typeConfig.Locale;
  onSubmitError: (error: string | null) => void;
  onSwitchView: (view: View) => void;
}

const usePasskeyEnrollForm = ({
  locale,
  onSubmitError,
  onSwitchView,
}: UsePasskeyEnrollFormProps) => {
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
        `${routeConfig.IdentityRoute.ProcessPasskeyEnroll}${qs}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
      )
        .then(parseResponse)
        .then((response) => {
          setEnrollOptions((response as GetProcessPasskeyEnrollRes).enrollOptions)
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
        routeConfig.IdentityRoute.ProcessPasskeyEnroll,
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

  const handleEnroll = useCallback(
    () => {
      if (!enrollOptions) return
      enroll(enrollOptions)
        .then((enrollInfo) => {
          if (enrollInfo) submitEnroll(enrollInfo)
        })
    },
    [enrollOptions, submitEnroll],
  )

  const handleDecline = useCallback(
    () => {
      fetch(
        routeConfig.IdentityRoute.ProcessPasskeyEnrollDecline,
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

export default usePasskeyEnrollForm
