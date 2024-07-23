'use client'

import { useTranslations } from 'next-intl'
import {
  Button, Table,
} from 'flowbite-react'
import Link from 'next/link'
import {
  useEffect, useState,
} from 'react'
import useCurrentLocale from 'hooks/useCurrentLocale'
import {
  proxyTool, routeTool,
} from 'tools'
import ConfigBooleanValue from 'components/ConfigBooleanValue'

const Page = () => {
  const local = useCurrentLocale()
  const t = useTranslations()

  const [configs, setConfigs] = useState(null)

  useEffect(
    () => {
      const getInfo = async () => {
        const data = await proxyTool.sendNextRequest({
          endpoint: '/api/info',
          method: 'GET',
        })
        setConfigs(data.configs)
      }

      getInfo()
    },
    [],
  )

  return (
    <section className='flex flex-col gap-8'>
      <section className='flex items-center gap-8'>
        <Button
          size='sm'
          as={Link}
          href={`/${local}/${routeTool.Internal.Users}`}>
          {t('layout.users')}
        </Button>
        <Button
          size='sm'
          as={Link}
          href={`/${local}/${routeTool.Internal.Apps}`}>
          {t('layout.apps')}
        </Button>
      </section>
      {configs && (
        <section className='flex flex-col gap-4'>
          <h2 className='text-lg font-bold'>{t('dashboard.configs')}</h2>
          <Table>
            <Table.Head>
              <Table.HeadCell>{t('dashboard.configName')}</Table.HeadCell>
              <Table.HeadCell>{t('dashboard.configValue')}</Table.HeadCell>
            </Table.Head>
            <Table.Body className='divide-y'>
              <Table.Row>
                <Table.Cell>AUTH_SERVER_URL</Table.Cell>
                <Table.Cell>{configs.AUTH_SERVER_URL}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>COMPANY_LOGO_URL</Table.Cell>
                <Table.Cell>{configs.COMPANY_LOGO_URL}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>ENABLE_NAMES</Table.Cell>
                <Table.Cell>
                  <ConfigBooleanValue config={configs.ENABLE_NAMES} />
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>NAMES_IS_REQUIRED</Table.Cell>
                <Table.Cell>
                  <ConfigBooleanValue config={configs.NAMES_IS_REQUIRED} />
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>ENABLE_SIGN_UP</Table.Cell>
                <Table.Cell>
                  <ConfigBooleanValue config={configs.ENABLE_SIGN_UP} />
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>ENABLE_EMAIL_VERIFICATION</Table.Cell>
                <Table.Cell>
                  <ConfigBooleanValue config={configs.ENABLE_EMAIL_VERIFICATION} />
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>ENABLE_PASSWORD_RESET</Table.Cell>
                <Table.Cell>
                  <ConfigBooleanValue config={configs.ENABLE_PASSWORD_RESET} />
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>ENABLE_USER_APP_CONSENT</Table.Cell>
                <Table.Cell>
                  <ConfigBooleanValue config={configs.ENABLE_USER_APP_CONSENT} />
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>ENABLE_USER_ROLE</Table.Cell>
                <Table.Cell>
                  <ConfigBooleanValue config={configs.ENABLE_USER_ROLE} />
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>AUTHORIZATION_CODE_EXPIRES_IN</Table.Cell>
                <Table.Cell>{configs.AUTHORIZATION_CODE_EXPIRES_IN} {t('dashboard.configSeconds')}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>ID_TOKEN_EXPIRES_IN</Table.Cell>
                <Table.Cell>{configs.ID_TOKEN_EXPIRES_IN} {t('dashboard.configSeconds')}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>SPA_ACCESS_TOKEN_EXPIRES_IN</Table.Cell>
                <Table.Cell>{configs.SPA_ACCESS_TOKEN_EXPIRES_IN} {t('dashboard.configSeconds')}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>SPA_REFRESH_TOKEN_EXPIRES_IN</Table.Cell>
                <Table.Cell>{configs.SPA_REFRESH_TOKEN_EXPIRES_IN} {t('dashboard.configSeconds')}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>S2S_ACCESS_TOKEN_EXPIRES_IN</Table.Cell>
                <Table.Cell>{configs.S2S_ACCESS_TOKEN_EXPIRES_IN} {t('dashboard.configSeconds')}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>SERVER_SESSION_EXPIRES_IN</Table.Cell>
                <Table.Cell>{configs.SERVER_SESSION_EXPIRES_IN} {t('dashboard.configSeconds')}</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </section>
      )}
    </section>
  )
}

export default Page
