import { render } from 'hono/jsx/dom'
import { Layout } from 'pages/blocks'
import {
  useLocale, useInitialProps,
} from 'pages/hooks'

const App = () => {
  const { initialProps } = useInitialProps()

  const {
    locale, handleSwitchLocale,
  } = useLocale({ initialLocale: initialProps.locale })

  return (
    <Layout
      locale={locale}
      locales={initialProps.enableLocaleSelector ? initialProps.locales : [locale]}
      logoUrl={initialProps.logoUrl}
      onSwitchLocale={handleSwitchLocale}
    >
      content
    </Layout>
  )
}

const root = document.getElementById('root')!
render(
  <App />,
  root,
)
