'use client'

import {
  Table,
  TextInput,
} from 'flowbite-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import useEditApp from '../useEditApp'
import RedirectUriEditor from '../RedirectUriEditor'
import {
  routeTool, typeTool,
} from 'tools'
import PageTitle from 'components/PageTitle'
import SaveButton from 'components/SaveButton'
import SubmitError from 'components/SubmitError'
import FieldError from 'components/FieldError'
import ClientTypeSelector from 'components/ClientTypeSelector'
import useLocaleRouter from 'hooks/useLocaleRoute'
import ScopesEditor from 'components/ScopesEditor'
import {
  useGetApiV1ScopesQuery, usePostApiV1AppsMutation,
} from 'services/auth/api'

const Page = () => {
  const t = useTranslations()
  const router = useLocaleRouter()

  const {
    values, errors, onChange,
  } = useEditApp(undefined)
  const [showErrors, setShowErrors] = useState(false)

  const { data: scopesData } = useGetApiV1ScopesQuery()
  const scopes = scopesData?.scopes ?? []
  const availableScopes = scopes.filter((scope) => scope.type === values.type)

  const [createApp, { isLoading: isCreating }] = usePostApiV1AppsMutation()

  const handleUpdateType = (newType: string) => {
    if (newType !== values.type) {
      onChange(
        'type',
        newType,
      )
      onChange(
        'scopes',
        [],
      )
    }
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

  const handleSubmit = async () => {
    if (Object.values(errors).some((val) => !!val)) {
      setShowErrors(true)
      return
    }

    const res = await createApp({
      postAppReq: {
        ...values,
        type: values.type as 'spa' | 's2s',
        redirectUris: values.redirectUris.map((uri) => uri.trim().toLowerCase()).filter((uri) => !!uri),
      },
    })

    if (res.data?.app?.id) {
      router.push(`${routeTool.Internal.Apps}/${res.data.app.id}`)
    }
  }

  return (
    <section>
      <section>
        <PageTitle
          className='mb-6'
          title={t('apps.new')}
        />
        <Table>
          <Table.Head>
            <Table.HeadCell className='max-md:w-24 md:w-48'>{t('common.property')}</Table.HeadCell>
            <Table.HeadCell>{t('common.value')}</Table.HeadCell>
          </Table.Head>
          <Table.Body className='divide-y'>
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
                {showErrors && <FieldError error={errors.name} />}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('apps.type')}</Table.Cell>
              <Table.Cell>
                <ClientTypeSelector
                  value={values.type}
                  onChange={handleUpdateType}
                />
                {showErrors && <FieldError error={errors.type} />}
              </Table.Cell>
            </Table.Row>
            {!!availableScopes.length && (
              <Table.Row>
                <Table.Cell>{t('apps.scopes')}</Table.Cell>
                <Table.Cell>
                  <ScopesEditor
                    scopes={availableScopes}
                    value={values.scopes}
                    onToggleScope={handleToggleAppScope}
                  />
                  {showErrors && <p className='text-red-600 mt-2'>{errors.scopes}</p>}
                </Table.Cell>
              </Table.Row>
            )}
            {values.type === typeTool.ClientType.SPA && (
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
          </Table.Body>
        </Table>
      </section>
      <SubmitError />
      <SaveButton
        className='mt-8'
        isLoading={isCreating}
        onClick={handleSubmit}
      />
    </section>
  )
}

export default Page
