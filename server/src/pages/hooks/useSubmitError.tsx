import {
  useCallback, useState,
} from 'hono/jsx'
import { View } from '.'
import {
  messageConfig, typeConfig, routeConfig,
} from 'configs'
import {
  requestError, validateError,
} from 'pages/tools/locale'

const useSubmitError = ({
  onSwitchView,
  locale,
}: {
  onSwitchView: (view: View) => void;
  locale: typeConfig.Locale;
}) => {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmitError = useCallback(
    (error: any) => {
      if (error === null) {
        setSubmitError(null)
        return
      }

      const errorString = String(error)

      let msg = requestError.authFailed[locale]

      if (errorString.indexOf('isEmail') !== -1 || errorString === validateError.isNotEmail[locale]) {
        msg = validateError.isNotEmail[locale]
      } else if (errorString.indexOf('isStrongPassword') !== -1) {
        msg = validateError.isWeakPassword[locale]
      } else if (errorString.indexOf(messageConfig.RequestError.NoUser) !== -1) {
        msg = requestError.noUser[locale]
      } else if (errorString.indexOf(messageConfig.RequestError.UserDisabled) !== -1) {
        msg = requestError.disabledUser[locale]
      } else if (errorString.indexOf(messageConfig.RequestError.AccountLocked) !== -1) {
        msg = requestError.accountLocked[locale]
      } else if (errorString.indexOf(messageConfig.RequestError.OtpMfaLocked) !== -1) {
        msg = requestError.optMfaLocked[locale]
      } else if (errorString.indexOf(messageConfig.RequestError.SmsMfaLocked) !== -1) {
        msg = requestError.smsMfaLocked[locale]
      } else if (errorString.indexOf(messageConfig.RequestError.EmailMfaLocked) !== -1) {
        msg = requestError.emailMfaLocked[locale]
      } else if (errorString.indexOf(messageConfig.RequestError.PasswordResetLocked) !== -1) {
        msg = requestError.passwordResetLocked[locale]
      } else if (errorString.indexOf(messageConfig.RequestError.EmailTaken) !== -1) {
        msg = requestError.emailTaken[locale]
      } else if (errorString.indexOf(messageConfig.RequestError.WrongCode) !== -1) {
        msg = requestError.wrongCode[locale]
      } else if (errorString.indexOf(messageConfig.RequestError.RequireDifferentPassword) !== -1) {
        msg = requestError.requireNewPassword[locale]
      } else if (errorString.indexOf(messageConfig.RequestError.WrongMfaCode) !== -1) {
        msg = requestError.wrongCode[locale]
      } else if (errorString.indexOf(messageConfig.RequestError.WrongAuthCode) !== -1) {
        const currentUrl = new URL(window.location.href)
        const newUrl = new URL(`${window.location.origin}${routeConfig.IdentityRoute.AuthCodeExpiredView}`)
        newUrl.searchParams.set(
          'locale',
          locale,
        )
        newUrl.searchParams.set(
          'redirect_uri',
          currentUrl.searchParams.get('redirect_uri') ?? '',
        )
        window.history.pushState(
          {},
          '',
          newUrl,
        )

        onSwitchView(View.AuthCodeExpired)
      }

      setSubmitError(msg)
    },
    [locale, onSwitchView],
  )

  return {
    submitError, handleSubmitError,
  }
}

export default useSubmitError
