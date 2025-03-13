import {
  useCallback, useMemo, useState,
} from 'hono/jsx'
import { routeConfig } from 'configs'
import { getStepFromParams } from 'pages/tools/param'
import { View } from 'configs/route'

export { View }

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
