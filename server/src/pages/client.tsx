import { useEffect, useState } from "hono/jsx";
import { render } from "hono/jsx/dom";
import qs from 'qs'
import { Layout } from "./components";

const App = () => {
  const [props, setProps] = useState(null)

  useEffect(() => {
    const params = qs.parse(window.location.search, { ignoreQueryPrefix: true })
    const initialProps = {
      locales: window.__initialProps.locales ? window.__initialProps.locales.split(',') : [],
      logoUrl: window.__initialProps.logoUrl,
    }

    setProps({
      ...params,
      ...initialProps,
    })
  }, [])

  const handleSwitchLocale = (locale: typeConfig.Locale) => {
    window.location.href = window.location.href.replace(`locale=${props.locale}`, `locale=${locale}`)
    setProps((prevProps) => ({
      ...prevProps,
      locale,
    }))
  }

  if (!props) {
    return null
  }

  return (
    <Layout locale={props.locale} locales={props.locales} logoUrl={props.logoUrl} handleSwitchLocale={handleSwitchLocale} >
    </Layout>
  );
};

const root = document.getElementById("root")!;
render(<App />, root);
