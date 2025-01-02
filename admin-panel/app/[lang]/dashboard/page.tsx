'use client'

import { useTranslations } from 'next-intl'
import {
  Spinner, Table,
} from 'flowbite-react'
import { useMemo } from 'react'
import ConfigBooleanValue from 'components/ConfigBooleanValue'
import PageTitle from 'components/PageTitle'
import { configSignal } from 'signals'
import useSignalValue from 'app/useSignalValue'

const Page = () => {
  const t = useTranslations()

  const configs = useSignalValue(configSignal)

  const configTypes = [
    {
      name: t('dashboard.brandingConfigs'),
      value: ['COMPANY_LOGO_URL', 'BG_COLOR', 'PRIMARY_BUTTON_BG_COLOR', 'PRIMARY_BUTTON_FG_COLOR', 'EMAIL_SENDER_NAME', 'TERMS_LINK', 'PRIVACY_POLICY_LINK'],
    },
    {
      name: t('dashboard.localeConfigs'),
      value: ['SUPPORTED_LOCALES', 'ENABLE_LOCALE_SELECTOR'],
    },
    {
      name: t('dashboard.suppressionConfigs'),
      value: ['ENABLE_NAMES', 'NAMES_IS_REQUIRED', 'ENABLE_SIGN_UP', 'ENABLE_PASSWORD_SIGN_IN', 'ENABLE_EMAIL_VERIFICATION', 'ENABLE_PASSWORD_RESET', 'PASSWORD_RESET_EMAIL_THRESHOLD', 'ENABLE_USER_APP_CONSENT'],
    },
    {
      name: t('dashboard.authConfigs'),
      value: ['OTP_MFA_IS_REQUIRED', 'SMS_MFA_IS_REQUIRED', 'SMS_MFA_MESSAGE_THRESHOLD', 'EMAIL_MFA_IS_REQUIRED', 'EMAIL_MFA_EMAIL_THRESHOLD', 'CHANGE_EMAIL_EMAIL_THRESHOLD', 'ENFORCE_ONE_MFA_ENROLLMENT', 'ALLOW_EMAIL_MFA_AS_BACKUP', 'ACCOUNT_LOCKOUT_THRESHOLD', 'ACCOUNT_LOCKOUT_EXPIRES_IN', 'UNLOCK_ACCOUNT_VIA_PASSWORD_RESET'],
    },
    {
      name: t('dashboard.mfaConfigs'),
      value: ['OTP_MFA_IS_REQUIRED', 'SMS_MFA_IS_REQUIRED', 'SMS_MFA_MESSAGE_THRESHOLD', 'EMAIL_MFA_IS_REQUIRED', 'EMAIL_MFA_EMAIL_THRESHOLD', 'CHANGE_EMAIL_EMAIL_THRESHOLD', 'ENFORCE_ONE_MFA_ENROLLMENT', 'ALLOW_EMAIL_MFA_AS_BACKUP'],
    },
    {
      name: t('dashboard.bruteForceConfigs'),
      value: ['ACCOUNT_LOCKOUT_THRESHOLD', 'ACCOUNT_LOCKOUT_EXPIRES_IN', 'UNLOCK_ACCOUNT_VIA_PASSWORD_RESET'],
    },
    {
      name: t('dashboard.ssoConfigs'),
      value: ['GOOGLE_AUTH_CLIENT_ID', 'FACEBOOK_AUTH_CLIENT_ID', 'GITHUB_AUTH_CLIENT_ID', 'GITHUB_AUTH_APP_NAME'],
    },
    {
      name: t('dashboard.logConfigs'),
      value: ['ENABLE_EMAIL_LOG', 'ENABLE_SMS_LOG', 'ENABLE_SIGN_IN_LOG'],
    },
  ]

  const links = useMemo(
    () => ({
      openidConfig: `${configs.AUTH_SERVER_URL}/.well-known/openid-configuration`,
      jwks: `${configs.AUTH_SERVER_URL}/.well-known/jwks.json`,
      apiSwagger: `${configs.AUTH_SERVER_URL}/api/v1/swagger`,
      systemInfo: `${configs.AUTH_SERVER_URL}/info`,
    }),
    [configs],
  )

  if (!configs) return <Spinner />

  return (
    <section>
      <PageTitle
        className='mb-6'
        title={t('dashboard.links')}
      />
      <Table className='break-all'>
        <Table.Head>
          <Table.HeadCell>{t('dashboard.configName')}</Table.HeadCell>
          <Table.HeadCell>{t('dashboard.configValue')}</Table.HeadCell>
        </Table.Head>
        <Table.Body className='divide-y'>
          <Table.Row>
            <Table.Cell>OPENID CONFIGURATION</Table.Cell>
            <Table.Cell>
              <a
                target='_blank'
                href={links.openidConfig}
                rel='noreferrer'
              >
                {links.openidConfig}
              </a>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>JWKS</Table.Cell>
            <Table.Cell>
              <a
                target='_blank'
                href={links.jwks}
                rel='noreferrer'
              >
                {links.jwks}
              </a>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>{t('dashboard.apiSwagger')}</Table.Cell>
            <Table.Cell>
              <a
                target='_blank'
                href={links.apiSwagger}
                rel='noreferrer'
              >
                {links.apiSwagger}
              </a>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>{t('dashboard.systemInfo')}</Table.Cell>
            <Table.Cell>
              <a
                target='_blank'
                href={links.systemInfo}
                rel='noreferrer'
              >
                {links.systemInfo}
              </a>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      {configTypes.map((configType) => (
        <section
          key={configType.name}
          className='mt-8 gap-6'>
          <PageTitle
            className='mt-8 mb-6'
            title={configType.name}
          />
          <Table className='break-all'>
            <Table.Head>
              <Table.HeadCell>{t('dashboard.configName')}</Table.HeadCell>
              <Table.HeadCell>{t('dashboard.configValue')}</Table.HeadCell>
            </Table.Head>
            <Table.Body className='divide-y'>
              {configType.value.map((configName) => (
                <Table.Row key={configName}>
                  <Table.Cell>{configName}</Table.Cell>
                  <Table.Cell>
                    {typeof configs[configName] === 'boolean' && <ConfigBooleanValue config={configs[configName]} />}
                    {Array.isArray(configs[configName]) && configs[configName].join(', ')}
                    {typeof configs[configName] !== 'boolean' && !Array.isArray(configs[configName]) && configs[configName]}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </section>
      ))}
    </section>
  )
}

export default Page
