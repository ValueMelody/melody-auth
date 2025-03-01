import {
  render, useMemo,
} from 'hono/jsx/dom'
import {
  useLocale, useInitialProps, useCurrentView,
  View,
} from 'pages/hooks'
import {
  SignIn, Layout, SignUp, Consent,
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

  const currentView = useMemo(
    () => {
      switch (view) {
      case View.SignIn:
        return <SignIn
          locale={locale}
          onSwitchView={handleSwitchView}
        />
      case View.SignUp:
        return <SignUp
          locale={locale}
          onSwitchView={handleSwitchView}
        />
      case View.Consent:
        return <Consent
          locale={locale}
          onSwitchView={handleSwitchView}
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
