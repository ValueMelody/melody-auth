import {
  useCallback, useMemo, useState,
} from 'hono/jsx'
import { getStepFromParams } from 'pages/tools/param'

export enum View {
  SignIn = 'sign-in',
  Consent = 'consent',
  MfaEnroll = 'mfa-enroll',
  EmailMfa = 'email-mfa',
  SmsMfa = 'sms-mfa',
  OtpSetup = 'otp-setup',
  OtpMfa = 'opt-mfa',
  PasskeyEnroll = 'passkey-enroll',
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
      return View.SignIn
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
