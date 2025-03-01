import {
  render, useMemo,
} from 'hono/jsx/dom'
import {
  useLocale, useInitialProps, useCurrentView,
  View,
} from 'pages/hooks'
import {
  SignIn, Layout, SignUp, Consent, MfaEnroll,
  OtpSetup,
  OtpMfa,
  SmsMfa,
  EmailMfa,
} from 'pages/views'
import { getLocaleFromParams } from 'pages/tools/param'

const App = () => {
  const { initialProps } = useInitialProps()

  const {
    locale, handleSwitchLocale,
  } = useLocale({ initialLocale: getLocaleFromParams() })

  const {
    view, handleSwitchView,
  } = useCurrentView()

  console.log(view)

  const currentView = useMemo(
    () => {
      const commonProps = {
        locale,
        onSwitchView: handleSwitchView,
      }

      switch (view) {
      case View.SignIn:
        return <SignIn
          {...commonProps}
        />
      case View.SignUp:
        return <SignUp
          {...commonProps}
        />
      case View.Consent:
        return <Consent
          {...commonProps}
        />
      case View.MfaEnroll:
        return <MfaEnroll
          {...commonProps}
        />
      case View.OtpSetup:
        return <OtpSetup
          {...commonProps}
        />
      case View.OtpMfa:
        return <OtpMfa
          {...commonProps}
        />
      case View.SmsMfa:
        return <SmsMfa
          {...commonProps}
        />
      case View.EmailMfa:
        return <EmailMfa
          {...commonProps}
        />
      default:
        return null
      }
    },
    [view, locale, handleSwitchView],
  )

  return (
    <Layout
      locale={locale}
      locales={initialProps.enableLocaleSelector ? initialProps.locales : [locale]}
      logoUrl={initialProps.logoUrl}
      onSwitchLocale={handleSwitchLocale}
    >
      {currentView}
    </Layout>
  )
}

const root = document.getElementById('root')!
render(
  <App />,
  root,
)
