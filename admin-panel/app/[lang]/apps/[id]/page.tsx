'use client'

import {
  Button,
  Table,
  TextInput,
  ToggleSwitch,
} from 'flowbite-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import {
  useMemo, useState,
} from 'react'
import {
  EyeIcon, EyeSlashIcon,
} from '@heroicons/react/16/solid'
import RedirectUriEditor from '../RedirectUriEditor'
import useEditApp from '../useEditApp'
import {
  routeTool, typeTool,
} from 'tools'
import PageTitle from 'components/PageTitle'
import ClientTypeLabel from 'components/ClientTypeLabel'
import SubmitError from 'components/SubmitError'
import FieldError from 'components/FieldError'
import ScopesEditor from 'components/ScopesEditor'
import SaveButton from 'components/SaveButton'
import DeleteButton from 'components/DeleteButton'
import useLocaleRouter from 'hooks/useLocaleRoute'
import {
  useDeleteApiV1AppsByIdMutation, useGetApiV1AppsByIdQuery, useGetApiV1ScopesQuery, usePutApiV1AppsByIdMutation,
} from 'services/auth/api'

const Page = () => {
  const { id } = useParams()
  const router = useLocaleRouter()

  const t = useTranslations()

  const { data: appData } = useGetApiV1AppsByIdQuery({ id: Number(id) })
  const app = appData?.app

  const { data: scopesData } = useGetApiV1ScopesQuery()
  const scopes = scopesData?.scopes ?? []
  const availableScopes = scopes.filter((scope) => scope.type === app?.type)

  const [showSecret, setShowSecret] = useState(false)

  const [updateApp, { isLoading: isUpdating }] = usePutApiV1AppsByIdMutation()
  const [deleteApp, { isLoading: isDeleting }] = useDeleteApiV1AppsByIdMutation()

  const {
    values, errors, onChange,
  } = useEditApp(app)

  const updateObj = useMemo(
    () => {
      if (!app) return {}
      type Key = 'name' | 'scopes' | 'redirectUris' | 'isActive'
      const updateKeys = ['name', 'scopes', 'redirectUris', 'isActive'].filter((key) => values[key as Key] !== app[key as Key])
      return updateKeys.reduce(
        (
          obj, key,
        ) => ({
          ...obj,
          [key]: values[key as Key],
        }),
        {},
      )
    },
    [app, values],
  )

  const toggleSecret = () => {
    setShowSecret(!showSecret)
  }

  const handleDelete = async () => {
    await deleteApp({ id: Number(id) })

    router.push(routeTool.Internal.Apps)
  }

  const handleSave = async () => {
    if (Object.values(errors).some((val) => !!val)) {
      return
    }

    await updateApp({
      id: Number(id),
      putAppReq: updateObj,
    })
  }

  const handleToggleAppScope = (scope: string) => {
    const newScopes = values.scopes.includes(scope)
      ? values.scopes.filter((currentScope) => currentScope !== scope)
      : [...values.scopes, scope]
    onChange(
      'scopes',
      newScopes,
    )
  }

  if (!app) return null

  return (
    <section>
      <PageTitle
        className='mb-6'
        title={t('apps.app')}
      />
      <section>
        <Table>
          <Table.Head>
            <Table.HeadCell className='max-md:w-24 md:w-48'>{t('common.property')}</Table.HeadCell>
            <Table.HeadCell>{t('common.value')}</Table.HeadCell>
          </Table.Head>
          <Table.Body className='divide-y break-all'>
            <Table.Row>
              <Table.Cell>{t('apps.name')}</Table.Cell>
              <Table.Cell>
                <TextInput
                  data-testid='nameInput'
                  onChange={(e) => onChange(
                    'name',
                    e.target.value,
                  )}
                  value={values.name}
                />
                <FieldError error={errors.name} />
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('apps.clientId')}</Table.Cell>
              <Table.Cell>{app.clientId}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('apps.clientSecret')}</Table.Cell>
              <Table.Cell className='break-all'>
                <div className='flex items-center gap-4'>
                  {showSecret ? app.secret : '*****'}
                  <Button
                    size='xs'
                    color='light'
                    onClick={toggleSecret}>
                    {showSecret ? <EyeSlashIcon className='w-4 h-4' /> : <EyeIcon className='w-4 h-4' />}
                  </Button>
                </div>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('apps.status')}</Table.Cell>
              <Table.Cell>
                <ToggleSwitch
                  data-testid='statusInput'
                  checked={values.isActive}
                  onChange={() => onChange(
                    'isActive',
                    !values.isActive,
                  )}
                />
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('apps.type')}</Table.Cell>
              <Table.Cell>
                <ClientTypeLabel type={app.type} />
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('apps.scopes')}</Table.Cell>
              <Table.Cell>
                <ScopesEditor
                  scopes={availableScopes}
                  value={values.scopes}
                  onToggleScope={handleToggleAppScope}
                />
              </Table.Cell>
            </Table.Row>
            {app.type === typeTool.ClientType.SPA && (
              <Table.Row>
                <Table.Cell>{t('apps.redirectUris')}</Table.Cell>
                <Table.Cell>
                  <RedirectUriEditor
                    redirectUris={values.redirectUris}
                    onChange={(uris) => onChange(
                      'redirectUris',
                      uris,
                    )}
                  />
                </Table.Cell>
              </Table.Row>
            )}
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
      <SubmitError />
      <section className='flex items-center gap-4 mt-8'>
        <SaveButton
          isLoading={isUpdating}
          disabled={!Object.keys(updateObj).length || isDeleting}
          onClick={handleSave}
        />
        <DeleteButton
          isLoading={isDeleting}
          disabled={isUpdating}
          confirmDeleteTitle={t(
            'common.deleteConfirm',
            { item: app.name },
          )}
          onConfirmDelete={handleDelete}
        />
      </section>
    </section>
  )
}

export default Page
