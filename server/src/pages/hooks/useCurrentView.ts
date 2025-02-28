import {
  useCallback, useMemo, useState,
} from 'hono/jsx'

export enum View {
  Password = 'password',
  Account = 'account',
  ResetPassword = 'reset-password',
  AuthCodeExpired = 'auth-code-expired',
}

const useCurrentView = () => {
  const views = useMemo(
    () => {
      switch (location.pathname) {
      case '/identity/v1/view/authorize':
        return [View.Password]
      default:
        return []
      }
    },
    [],
  )

  const [view, setView] = useState(views[0])

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
