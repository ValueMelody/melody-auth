'use client'

import { useAuth } from '@melody-auth/react'
import {
  Button,
  Table,
  TableCell,
} from 'flowbite-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import {
  useCallback,
  useEffect, useState,
} from 'react'
import RedirectUriEditor from '../RedirectUriEditor'
import { proxyTool } from 'tools'
import EntityStatusLabel from 'components/EntityStatusLabel'
import AppScopes from 'components/AppScopes'
import PageTitle from 'components/PageTitle'
import ClientTypeLabel from 'components/ClientTypeLabel'

const Page = () => {
  const { id } = useParams()

  const t = useTranslations()

  const [app, setApp] = useState()
  const [redirectUris, setRedirectUris] = useState<string[]>([])
  const { acquireToken } = useAuth()

  const getApp = useCallback(
    async () => {
      const token = await acquireToken()
      const data = await proxyTool.sendNextRequest({
        endpoint: `/api/apps/${id}`,
        method: 'GET',
        token,
      })
      setApp(data.app)
      setRedirectUris(data.app.redirectUris)
    },
    [acquireToken, id],
  )

  useEffect(
    () => {
      getApp()
    },
    [getApp],
  )

  const handleSaveRedirectUris = async () => {
    const token = await acquireToken()
    const res = await proxyTool.sendNextRequest({
      endpoint: `/api/apps/${id}`,
      method: 'PUT',
      token,
      body: { data: { redirectUris: redirectUris.map((uri) => uri.trim()).filter((uri) => !!uri) } },
    })
    if (res?.app) {
      getApp()
    }
  }

  if (!app) return null

  return (
    <section>
      <PageTitle
        className='mb-6'
        title={t('apps.app')} />
      <section>
        <Table>
          <Table.Head>
            <Table.HeadCell>{t('common.property')}</Table.HeadCell>
            <Table.HeadCell>{t('common.value')}</Table.HeadCell>
            <Table.HeadCell />
          </Table.Head>
          <Table.Body className='divide-y'>
            <Table.Row>
              <Table.Cell>{t('apps.name')}</Table.Cell>
              <Table.Cell>{app.name}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('apps.clientId')}</Table.Cell>
              <Table.Cell>{app.clientId}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('apps.clientSecret')}</Table.Cell>
              <Table.Cell className='break-all'>{app.secret}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('apps.status')}</Table.Cell>
              <Table.Cell>
                <EntityStatusLabel isEnabled={!app.deletedAt} />
              </Table.Cell>
              <TableCell>
              </TableCell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('apps.type')}</Table.Cell>
              <Table.Cell>
                <ClientTypeLabel type={app.type} />
              </Table.Cell>
              <Table.Cell />
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('apps.scopes')}</Table.Cell>
              <Table.Cell>
                <AppScopes app={app} />
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('apps.redirectUris')}</Table.Cell>
              <Table.Cell>
                <RedirectUriEditor
                  redirectUris={redirectUris}
                  onChange={setRedirectUris}
                />
              </Table.Cell>
              <Table.Cell>
                <Button
                  size='xs'
                  onClick={handleSaveRedirectUris}>
                  {t('common.save')}
                </Button>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('common.createdAt')}</Table.Cell>
              <Table.Cell>{app.createdAt} UTC</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('common.updatedAt')}</Table.Cell>
              <Table.Cell>{app.updatedAt} UTC</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </section>
    </section>
  )
}

export default Page
