import {
  useCallback, useMemo, useState,
} from 'hono/jsx'
import { routeConfig } from 'configs'
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
  VerifyEmail = 'verify_email',
}

const useCurrentView = () => {
  const initialView = useMemo(
    () => {
      const step = getStepFromParams()
      if (step) {
        return step
      }
      switch (window.location.pathname) {
      case routeConfig.IdentityRoute.AuthCodeExpiredView:
        return View.AuthCodeExpired
      case routeConfig.IdentityRoute.VerifyEmailView:
        return View.VerifyEmail
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
