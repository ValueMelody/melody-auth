import {
  useCallback, useMemo, useState,
} from 'hono/jsx'
import { getStepFromParams } from 'pages/tools/param'

export enum View {
  SignIn = 'sign_in',
  Consent = 'consent',
  MfaEnroll = 'mfa_enroll',
  EmailMfa = 'email_mfa',
  SmsMfa = 'sms_mfa',
  OtpSetup = 'otp_setup',
  OtpMfa = 'opt_mfa',
  PasskeyEnroll = 'passkey_enroll',
  SignUp = 'sign_up',
  ResetPassword = 'reset_password',
  UpdateInfo = 'update_info',
  ChangePassword = 'change_password',
  ResetMfa = 'reset_mfa',
  ManagePasskey = 'manage_passkey',
  ChangeEmail = 'change_email',
  AuthCodeExpired = 'auth_code_expired',
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
