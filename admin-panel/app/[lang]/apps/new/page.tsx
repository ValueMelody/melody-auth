'use client'

import {
  Table,
  TextInput,
} from 'flowbite-react'
import { useTranslations } from 'next-intl'
import {
  useEffect,
  useMemo, useState,
} from 'react'
import { useAuth } from '@melody-auth/react'
import useEditApp from '../useEditApp'
import RedirectUriEditor from '../RedirectUriEditor'
import {
  proxyTool, routeTool, typeTool,
} from 'tools'
import PageTitle from 'components/PageTitle'
import SaveButton from 'components/SaveButton'
import SubmitError from 'components/SubmitError'
import FieldError from 'components/FieldError'
import ClientTypeSelector from 'components/ClientTypeSelector'
import useLocaleRouter from 'hooks/useLocaleRoute'
import ScopesEditor from 'components/ScopesEditor'

const Page = () => {
  const t = useTranslations()
  const router = useLocaleRouter()

  const { acquireToken } = useAuth()
  const {
    values, errors, onChange,
  } = useEditApp()
  const [showErrors, setShowErrors] = useState(false)
  const [scopes, setScopes] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const availableScopes = useMemo(
    () => scopes.filter((scope) => scope.type === values.type),
    [values.type, scopes],
  )

  useEffect(
    () => {
      const getScopes = async () => {
        const token = await acquireToken()
        const data = await proxyTool.getScopes(token)
        setScopes(data.scopes)
      }

      getScopes()
    },
    [acquireToken],
  )

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

    const token = await acquireToken()
    setIsLoading(true)
    const res = await proxyTool.sendNextRequest({
      endpoint: '/api/apps',
      method: 'POST',
      token,
      body: {
        data: {
          ...values,
          redirectUris: values.redirectUris.map((uri) => uri.trim().toLowerCase()).filter((uri) => !!uri),
        },
      },
    })

    if (res.app?.id) {
      router.push(`${routeTool.Internal.Apps}/${res.app.id}`)
    }
    setIsLoading(false)
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
            <Table.HeadCell className='w-48'>{t('common.property')}</Table.HeadCell>
            <Table.HeadCell>{t('common.value')}</Table.HeadCell>
          </Table.Head>
          <Table.Body className='divide-y'>
            <Table.Row>
              <Table.Cell>{t('apps.name')}</Table.Cell>
              <Table.Cell>
                <TextInput
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
        isLoading={isLoading}
        onClick={handleSubmit}
      />
    </section>
  )
}

export default Page
