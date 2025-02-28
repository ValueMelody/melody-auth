import {
  render, useMemo,
} from 'hono/jsx/dom'
import { Layout } from 'pages/blocks'
import {
  useLocale, useInitialProps, useCurrentView,
  View,
} from 'pages/hooks'
import { PasswordView } from 'pages/views'

const App = () => {
  const { initialProps } = useInitialProps()

  const {
    locale, handleSwitchLocale,
  } = useLocale({ initialLocale: initialProps.locale })

  const {
    view, handleSwitchView,
  } = useCurrentView()

  const currentView = useMemo(
    () => {
      switch (view) {
      case View.Password:
        return <PasswordView
          googleClientId={initialProps.googleClientId}
          facebookClientId={initialProps.facebookClientId}
          githubClientId={initialProps.githubClientId}
          locale={locale}
          onSwitchView={handleSwitchView}
          enableSignUp={initialProps.enableSignUp}
          enablePasswordReset={initialProps.enablePasswordReset}
          enablePasswordSignIn={initialProps.enablePasswordSignIn}
          initialProps={initialProps}
        />
      default:
        return null
      }
    },
    [view, locale, handleSwitchView, initialProps],
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
