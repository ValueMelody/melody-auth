import {
  useCallback, useMemo, useState,
} from 'hono/jsx'
import {
  startRegistration, PublicKeyCredentialCreationOptionsJSON,
} from '@simplewebauthn/browser'
import {
  routeConfig, typeConfig,
} from 'configs'
import { GetManagePasskeyRes } from 'handlers/identity'
import { userPasskeyModel } from 'models'
import { getFollowUpParams } from 'pages/tools/param'
import {
  parseAuthorizeFollowUpValues, parseResponse,
} from 'pages/tools/request'
import { managePasskey } from 'pages/tools/locale'

export interface UseManagePasskeyFormProps {
  locale: typeConfig.Locale;
  onSubmitError: (error: string | null) => void;
}

const useManagePasskeyForm = ({
  locale,
  onSubmitError,
}: UseManagePasskeyFormProps) => {
  const followUpParams = useMemo(
    () => getFollowUpParams(),
    [],
  )
  const qs = `?code=${followUpParams.code}&locale=${locale}&org=${followUpParams.org}`

  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [passkey, setPasskey] = useState<userPasskeyModel.Record | null>(null)
  const [enrollOptions, setEnrollOptions] = useState<PublicKeyCredentialCreationOptionsJSON | null>(null)

  const getManagePasskeyInfo = useCallback(
    () => {
      fetch(
        `${routeConfig.IdentityRoute.ManagePasskey}${qs}`,
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
          setPasskey((response as GetManagePasskeyRes).passkey)
          setEnrollOptions((response as GetManagePasskeyRes).enrollOptions as PublicKeyCredentialCreationOptionsJSON)
        })
        .catch((error) => {
          onSubmitError(error)
        })
    },
    [qs, onSubmitError],
  )

  const handleRemove = useCallback(
    () => {
      fetch(
        routeConfig.IdentityRoute.ManagePasskey,
        {
          method: 'DELETE',
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
          setSuccessMessage(managePasskey.removeSuccess[locale])
          setPasskey(null)
        })
        .catch((error) => {
          onSubmitError(error)
        })
    },
    [locale, onSubmitError, followUpParams],
  )

  const submitEnroll = useCallback(
    (enrollInfo: Credential) => {
      fetch(
        routeConfig.IdentityRoute.ManagePasskey,
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
        .then((data) => {
          setPasskey((data as GetManagePasskeyRes).passkey)
          setSuccessMessage(managePasskey.enrollSuccess[locale])
        })
        .catch((error) => {
          onSubmitError(error)
        })
    },
    [locale, onSubmitError, followUpParams],
  )

  const handleEnroll = useCallback(
    () => {
      if (!enrollOptions) return
      startRegistration({ optionsJSON: enrollOptions })
        .then((enrollInfo) => {
          if (enrollInfo) submitEnroll(enrollInfo)
        })
    },
    [enrollOptions, submitEnroll],
  )

  return {
    successMessage,
    getManagePasskeyInfo,
    passkey,
    enrollOptions,
    handleRemove,
    handleEnroll,
    redirectUri: followUpParams.redirectUri,
  }
}

export default useManagePasskeyForm
