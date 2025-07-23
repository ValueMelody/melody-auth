'use client'

import { useTranslations } from 'next-intl'
import { useMemo } from 'react'

import ConfigBooleanValue from 'components/ConfigBooleanValue'
import PageTitle from 'components/PageTitle'
import { configSignal } from 'signals'
import useSignalValue from 'app/useSignalValue'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from 'components/ui/table'
import Breadcrumb from 'components/Breadcrumb'
import LoadingPage from 'components/LoadingPage'

const configNameClass = 'w-96 max-md:w-60'

const Page = () => {
  const t = useTranslations()

  const configs = useSignalValue(configSignal)

  const configTypes = [
    {
      name: t('dashboard.informationConfigs'),
      value: [
        'COMPANY_LOGO_URL',
        'COMPANY_EMAIL_LOGO_URL',
        'EMAIL_SENDER_NAME',
        'TERMS_LINK',
        'PRIVACY_POLICY_LINK',
      ],
    },
    {
      name: t('dashboard.localeConfigs'),
      value: ['SUPPORTED_LOCALES', 'ENABLE_LOCALE_SELECTOR'],
    },
    {
      name: t('dashboard.suppressionConfigs'),
      value: [
        'ENABLE_NAMES',
        'NAMES_IS_REQUIRED',
        'ENABLE_SIGN_UP',
        'ENABLE_PASSWORD_SIGN_IN',
        'ENABLE_PASSWORDLESS_SIGN_IN',
        'ENABLE_EMAIL_VERIFICATION',
        'REPLACE_EMAIL_VERIFICATION_WITH_WELCOME_EMAIL',
        'ENABLE_PASSWORD_RESET',
        'ENABLE_USER_APP_CONSENT',
        'ENABLE_ORG',
        'BLOCKED_POLICIES',
      ],
    },
    {
      name: t('dashboard.authConfigs'),
      value: [
        'AUTHORIZATION_CODE_EXPIRES_IN',
        'SPA_ACCESS_TOKEN_EXPIRES_IN',
        'SPA_REFRESH_TOKEN_EXPIRES_IN',
        'S2S_ACCESS_TOKEN_EXPIRES_IN',
        'ID_TOKEN_EXPIRES_IN',
        'SERVER_SESSION_EXPIRES_IN',
      ],
    },
    {
      name: t('dashboard.mfaConfigs'),
      value: [
        'OTP_MFA_IS_REQUIRED',
        'SMS_MFA_IS_REQUIRED',
        'EMAIL_MFA_IS_REQUIRED',
        'ENFORCE_ONE_MFA_ENROLLMENT',
        'ALLOW_EMAIL_MFA_AS_BACKUP',
        'ALLOW_PASSKEY_ENROLLMENT',
        'ENABLE_RECOVERY_CODE',
        'ENABLE_MFA_REMEMBER_DEVICE',
      ],
    },
    {
      name: t('dashboard.bruteForceConfigs'),
      value: [
        'ACCOUNT_LOCKOUT_THRESHOLD', 'ACCOUNT_LOCKOUT_EXPIRES_IN',
        'UNLOCK_ACCOUNT_VIA_PASSWORD_RESET', 'PASSWORD_RESET_EMAIL_THRESHOLD',
        'CHANGE_EMAIL_EMAIL_THRESHOLD', 'EMAIL_MFA_EMAIL_THRESHOLD',
        'SMS_MFA_MESSAGE_THRESHOLD',
      ],
    },
    {
      name: t('dashboard.ssoConfigs'),
      value: [
        'GOOGLE_AUTH_CLIENT_ID',
        'FACEBOOK_AUTH_CLIENT_ID',
        'GITHUB_AUTH_CLIENT_ID',
        'GITHUB_AUTH_APP_NAME',
        'DISCORD_AUTH_CLIENT_ID',
        'OIDC_AUTH_PROVIDERS',
      ],
    },
    {
      name: t('dashboard.logConfigs'),
      value: ['ENABLE_EMAIL_LOG', 'ENABLE_SMS_LOG', 'ENABLE_SIGN_IN_LOG'],
    },
  ]

  const links = useMemo(
    () => configs
      ? ({
        openidConfig: `${configs.AUTH_SERVER_URL}/.well-known/openid-configuration`,
        jwks: `${configs.AUTH_SERVER_URL}/.well-known/jwks.json`,
        apiSwagger: `${configs.AUTH_SERVER_URL}/api/v1/swagger`,
        embeddedSwagger: `${configs.AUTH_SERVER_URL}/api/v1/embedded-swagger`,
        systemInfo: `${configs.AUTH_SERVER_URL}/info`,
      })
      : null,
    [configs],
  )

  if (!configs) return <LoadingPage />

  return (
    <section>
      <Breadcrumb
        page={{
          label: t('layout.dashboard'),
        }}
      />
      {links && (
        <>
          <PageTitle
            className='mb-6'
            title={t('dashboard.links')}
          />
          <Table className='break-all'>
            <TableHeader>
              <TableRow>
                <TableHead className={configNameClass}>{t('dashboard.configName')}</TableHead>
                <TableHead>{t('dashboard.configValue')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>OPENID CONFIGURATION</TableCell>
                <TableCell>
                  <a
                    target='_blank'
                    href={links.openidConfig}
                    rel='noreferrer'
                  >
                    {links.openidConfig}
                  </a>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>JWKS</TableCell>
                <TableCell>
                  <a
                    target='_blank'
                    href={links.jwks}
                    rel='noreferrer'
                  >
                    {links.jwks}
                  </a>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('dashboard.apiSwagger')}</TableCell>
                <TableCell>
                  <a
                    target='_blank'
                    href={links.apiSwagger}
                    rel='noreferrer'
                  >
                    {links.apiSwagger}
                  </a>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('dashboard.embeddedSwagger')}</TableCell>
                <TableCell>
                  <a
                    target='_blank'
                    href={links.embeddedSwagger}
                    rel='noreferrer'
                  >
                    {links.embeddedSwagger}
                  </a>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('dashboard.systemInfo')}</TableCell>
                <TableCell>
                  <a
                    target='_blank'
                    href={links.systemInfo}
                    rel='noreferrer'
                  >
                    {links.systemInfo}
                  </a>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </>
      )}
      {configTypes.map((configType) => (
        <section
          key={configType.name}
          className='mt-8 gap-6'>
          <PageTitle
            className='mt-8 mb-6'
            title={configType.name}
          />
          <Table className='break-all'>
            <TableHeader>
              <TableRow>
                <TableHead className={configNameClass}>{t('dashboard.configName')}</TableHead>
                <TableHead>{t('dashboard.configValue')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configType.value.map((configName) => (
                <TableRow key={configName}>
                  <TableCell>{configName}</TableCell>
                  <TableCell>
                    {typeof configs[configName] === 'boolean' && <ConfigBooleanValue config={configs[configName]} />}
                    {Array.isArray(configs[configName]) && configs[configName].join(', ')}
                    {typeof configs[configName] !== 'boolean' && !Array.isArray(configs[configName]) && configs[configName]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      ))}
    </section>
  )
}

export default Page
