import {
  useCallback, useMemo, useState,
} from 'hono/jsx'
import {
  routeConfig, typeConfig,
} from 'configs'
import { PostManageRecoveryCodeRes } from 'handlers/identity'
import { getFollowUpParams } from 'pages/tools/param'
import {
  parseAuthorizeFollowUpValues, parseResponse,
} from 'pages/tools/request'
import { manageRecoveryCode } from 'pages/tools/locale'

export interface UseManageRecoveryCodeFormProps {
  locale: typeConfig.Locale;
  onSubmitError: (error: string | null) => void;
}

const useManageRecoveryCodeForm = ({
  locale,
  onSubmitError,
}: UseManageRecoveryCodeFormProps) => {
  const followUpParams = useMemo(
    () => getFollowUpParams(),
    [],
  )

  const [isGenerating, setIsGenerating] = useState(false)

  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null)

  const handleRegenerate = useCallback(
    () => {
      setIsGenerating(true)
      fetch(
        routeConfig.IdentityRoute.ManageRecoveryCode,
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
        .then((data) => {
          setRecoveryCode((data as PostManageRecoveryCodeRes).recoveryCode)
          setSuccessMessage(manageRecoveryCode.success[locale])
        })
        .catch((error) => {
          onSubmitError(error)
        })
        .finally(() => {
          setIsGenerating(false)
        })
    },
    [locale, onSubmitError, followUpParams],
  )

  return {
    successMessage,
    recoveryCode,
    handleRegenerate,
    redirectUri: followUpParams.redirectUri,
    isGenerating,
  }
}

export default useManageRecoveryCodeForm
