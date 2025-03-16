import { typeConfig } from 'configs'
import { authCodeExpired } from 'pages/tools/locale'

const AuthCodeExpired = ({
  locale,
  authCodeExpiredParams,
}: {
  locale: typeConfig.Locale;
  authCodeExpiredParams: {
    redirectUri: string;
  };
}) => {
  return (
    <>
      <p className='w-(--text-width) text-criticalIndicatorColor'>
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
