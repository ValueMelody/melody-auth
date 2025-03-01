import {
  useCallback, useMemo, useState,
} from 'hono/jsx'
import { routeConfig } from 'configs'
import { getStepFromParams } from 'pages/tools/param'

export enum View {
  SignIn = 'sign-in',
  Consent = 'consent',
  MfaEnroll = 'mfa-enroll',
  EmailMfa = 'email-mfa',
  SmsMfa = 'sms-mfa',
  OtpSetup = 'otp-setup',
  OtpMfa = 'opt-mfa',
  SignUp = 'sign-up',
  ResetPassword = 'reset-password',
  AuthCodeExpired = 'auth-code-expired',
}

const useCurrentView = () => {
  const initialView = useMemo(
    () => {
      const step = getStepFromParams()
      if (step) {
        return step
      }
      switch (location.pathname) {
      case routeConfig.IdentityRoute.AuthorizeView:
      default:
        return View.SignIn
      }
    },
    [],
  )

  const [view, setView] = useState(initialView)

  const handleSwitchView = useCallback(
    (view: View) => {
      setView(view)
    },
    [],
  )

  return {
    view, handleSwitchView,
  }
}

export default useCurrentView
