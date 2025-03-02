import {
  useState, useMemo,
} from 'hono/jsx'
import {
  routeConfig, typeConfig,
} from 'configs'
import { getFollowUpParams } from 'pages/tools/param'
import {
  parseAuthorizeFollowUpValues, parseResponse,
} from 'pages/tools/request'

export interface UseResetMfaFormProps {
  locale: typeConfig.Locale;
  onSubmitError: (error: string | null) => void;
}

const useResetMfaForm = ({
  locale,
  onSubmitError,
}: UseResetMfaFormProps) => {
  const followUpParams = useMemo(
    () => getFollowUpParams(),
    [],
  )

  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: Event) => {
    e.preventDefault()

    fetch(
      routeConfig.IdentityRoute.ResetMfa,
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
      .then(() => {
        setSuccess(true)
      })
      .catch((error) => {
        onSubmitError(error)
      })
  }

  return {
    handleSubmit,
    success,
    redirectUri: followUpParams.redirectUri,
  }
}

export default useResetMfaForm
