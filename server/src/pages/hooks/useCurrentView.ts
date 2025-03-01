import {
  useCallback, useMemo, useState,
} from 'hono/jsx'

export enum View {
  SignIn = 'sign-in',
  Consent = 'consent',
  SignUp = 'sign-up',
  ResetPassword = 'reset-password',
  AuthCodeExpired = 'auth-code-expired',
}

const useCurrentView = () => {
  const initialView = useMemo(
    () => {
      switch (location.pathname) {
      case '/identity/v1/view/authorize':
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
