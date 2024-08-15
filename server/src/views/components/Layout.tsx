import {
  css, Style,
} from 'hono/css'
import { html } from 'hono/html'
import {
  localeConfig, typeConfig,
} from 'configs'

const Layout = ({
  logoUrl, children, locale, locales,
}: { logoUrl: string; children: any; locale: typeConfig.Locale; locales: typeConfig.Locale[] }) => (
  <html lang={locale}>
    <head>
      <meta charset='utf-8' />
      <title>{localeConfig.common.documentTitle[locale]}</title>
      <link
        rel='icon'
        type='image/x-icon'
        href={logoUrl} />
      <meta
        name='viewport'
        content='width=device-width, initial-scale=1' />
      <link
        rel='preconnect'
        href='https://fonts.googleapis.com' />
      <link
        rel='preconnect'
        href='https://fonts.gstatic.com' />
      <link
        href='https://fonts.googleapis.com/css2?family=Inter:wght@400..600&display=swap'
        rel='stylesheet' />
      <Style>
        {css`
          body { padding: 0; margin: 0; font-family: "Inter", sans-serif; font-size: 16px; }
          a { text-decoration: none; }
          p { padding: 0; margin: 0; }
          h1 { padding: 0; margin: 0; }
          .flex-row { display: flex; flex-direction: row; }
          .flex-col { display: flex; flex-direction: column; }
          .flex-wrap { flex-wrap: wrap; }
          .justify-between { justify-content: space-between; }
          .justify-around { justify-content: space-around; }
          .justify-center { justify-content: center; }
          .justify-end { justify-content: flex-end; }
          .items-center { align-items: center; }
          .hidden { display: none; }
          .text-semibold { font-weight: 600; }
          .text-sm { font-size: 14px; }
          .text-red { color: red; }
          .text-green { color: green; }
          .text-center { text-align: center; }
          .p-2 { padding: 8px; }
          .p-4 { padding: 16px; }
          .pr-2 { padding: 8px; }
          .ml-2 { margin-left: 8px; }
          .mt-4 { margin-top: 16px; }
          .mt-8 { margin-top: 32px; }
          .mb-4 { margin-bottom: 16px; }
          .gap-8 { gap: 32px; }
          .gap-4 { gap: 16px; }
          .gap-2 { gap: 8px; }
          .border { border: 1px solid lightgray; }
          .rounded-lg { border-radius: 16px; }
          .rounded-md { border-radius: 8px; }
          .w-full { width: 100%; }
          .w-half { width: 50%; }
          .w-text { width: 240px; }
          .main {
            background-color: lightgray;
            height: 100vh;
            width: 100%;
          }
          .container {
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.1);;
            background-color: white;
            padding: 32px;
          }
          .logo {
            width: 40px;
          }
          .button {
            background-color: white;
            cursor: pointer;
            border: 1px solid lightgray;
            padding: 8px;
            border-radius: 8px;
            font-weight: 500;
            font-size: 16px;
          }
          .button-outline {
            background-color: white;
            cursor: pointer;
            border: none;
            padding: 8px;
            border-radius: 8px;
            font-weight: 500;
            font-size: 16px;
          }
          .button-text {
            background-color: unset;
            text-align: center;
            cursor: pointer;
            border: none;
            padding: 8px;
            border-radius: 8px;
            font-weight: 500;
            font-size: 16px;
            color: darkslategray;
          }
          .input {
            background-color: white;
            border: 1px solid lightgray;
            padding: 12px;
            border-radius: 8px;
            min-width: 240px;
          }
          .label {
            font-weight: 500;
          }
          .alert {
            background-color: red;
            color: white;
            border-radius: 8px;
            padding: 8px 16px;
            font-size: 14px;
            width: 240px;
            align-self: center;
          }
          .inner-container {
            max-height: 80vh;
            overflow-y: auto;
            overflow-x: hidden;
            padding-left: 16px;
            padding-right: 16px;
          }
          .option {
            background-color: white;
            color: #333;
            padding: 8px;
            font-weight: 500;
            font-size: 16px;
            cursor: pointer;
          }
          @media (width <= 625px) {
            #row-names {
              flex-direction: column;
            }
          }
        `}
      </Style>
    </head>
    <body>
      <main class='flex-col items-center justify-center main'>
        <section class='flex-col justify-center items-center container rounded-lg'>
          {locales.length > 1 && (
            <section class='flex-row justify-end w-full'>
              <select
                class='button'
                onchange='handleSwitchLocale(event)'>
                {locales.map((targetLocale) => (
                  <option
                    key={targetLocale}
                    value={targetLocale}
                    selected={targetLocale === locale}>
                    {targetLocale.toUpperCase()}
                  </option>
                ))}
              </select>
            </section>
          )}
          <section class='flex-col items-center gap-4 inner-container'>
            <img
              class='logo'
              src={logoUrl}
              alt='Logo'
            />
            {children}
            <a
              target='__blank'
              href='https://github.com/ValueMelody/melody-auth'
              class='text-sm mt-4'>
              {localeConfig.common.poweredByAuth[locale]}
            </a>
          </section>
        </section>
      </main>
      {html`
        <script>
          function handleSwitchLocale(e) {
            var url = window.location.href.replace("locale=${locale}", "locale=" + e.target.value)
            if (url.indexOf('locale=') === -1) {
              url = url + "&locale=" + e.target.value
            }
            window.location.href = url
          }
        </script>
      `}
    </body>
  </html>
)

export default Layout
