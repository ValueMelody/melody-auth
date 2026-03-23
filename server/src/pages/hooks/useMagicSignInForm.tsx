import {
  useCallback, useEffect, useState,
} from 'hono/jsx'
import { View } from './useCurrentView'
import useInitialProps from './useInitialProps'
import { getMagicSignInParams } from 'pages/tools/param'
import {
  routeConfig, typeConfig,
} from 'configs'
import {
  handleAuthorizeStep, parseResponse,
} from 'pages/tools/request'

export interface UseMagicSignInFormProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const useMagicSignInForm = ({
  locale,
  onSwitchView,
}: UseMagicSignInFormProps) => {
  const { initialProps } = useInitialProps()
  const [isProcessing, setIsProcessing] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processSignIn = useCallback(
    () => {
      if (!initialProps.enablePasswordlessSignIn || !initialProps.usePasswordlessAsMagicLink) {
        setIsProcessing(false)
        setError('invalid')
        return
      }

      const {
        code, otp, org,
      } = getMagicSignInParams()

      if (!code || !otp) {
        setIsProcessing(false)
        setError('invalid')
        return
      }

      fetch(
        routeConfig.IdentityRoute.ProcessPasswordlessCode,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            mfaCode: otp,
            locale,
            org: org || undefined,
          }),
        },
      )
        .then(parseResponse)
        .then((response) => {
          setIsSuccess(true)
          handleAuthorizeStep(
            response,
            locale,
            onSwitchView,
          )
        })
        .catch((err) => {
          setError(err.message || 'error')
        })
        .finally(() => {
          setIsProcessing(false)
        })
    },
    [locale, onSwitchView, initialProps.enablePasswordlessSignIn, initialProps.usePasswordlessAsMagicLink],
  )

  useEffect(
    () => {
      processSignIn()
    },
    [processSignIn],
  )

  return {
    isProcessing,
    isSuccess,
    error,
  }
}

export default useMagicSignInForm
