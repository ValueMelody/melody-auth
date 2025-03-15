import { typeConfig } from 'configs'
import { getAuthCodeExpiredParams } from 'pages/tools/param'
import { authCodeExpired } from 'pages/tools/locale'

const AuthCodeExpired = ({ locale }: {
  locale: typeConfig.Locale;
}) => {
  const authCodeExpiredParams = getAuthCodeExpiredParams()

  return (
    <>
      <p class='w-(--text-width) text-criticalIndicatorColor'>
        {authCodeExpired.msg[locale]}
      </p>
      {authCodeExpiredParams.redirectUri && (
        <a
          className='mt-6'
          href={authCodeExpiredParams.redirectUri}
        >
          {authCodeExpired.redirect[locale]}
        </a>
      )}
    </>
  )
}

export default AuthCodeExpired
