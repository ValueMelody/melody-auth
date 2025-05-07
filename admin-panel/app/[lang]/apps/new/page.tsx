'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import useEditApp from '../useEditApp'
import RedirectUriEditor from '../RedirectUriEditor'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from 'components/ui/table'
import { Input } from 'components/ui/input'
import {
  routeTool, typeTool,
} from 'tools'
import SaveButton from 'components/SaveButton'
import SubmitError from 'components/SubmitError'
import FieldError from 'components/FieldError'
import ClientTypeSelector from 'components/ClientTypeSelector'
import { useRouter } from 'i18n/navigation'
import ScopesEditor from 'components/ScopesEditor'
import {
  useGetApiV1ScopesQuery, usePostApiV1AppsMutation,
} from 'services/auth/api'
import Breadcrumb from 'components/Breadcrumb'

const Page = () => {
  const t = useTranslations()
  const router = useRouter()

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
        name: values.name,
        scopes: values.scopes,
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
      <Breadcrumb
        className='mb-8'
        page={{ label: t('apps.new') }}
        parent={{
          href: routeTool.Internal.Apps,
          label: t('apps.title'),
        }}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='max-md:w-24 md:w-48'>{t('common.property')}</TableHead>
            <TableHead>{t('common.value')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className='divide-y'>
          <TableRow>
            <TableCell>{t('apps.name')}</TableCell>
            <TableCell>
              <Input
                data-testid='nameInput'
                onChange={(e) => onChange(
                  'name',
                  e.target.value,
                )}
                value={values.name}
              />
              {showErrors && <FieldError error={errors.name} />}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{t('apps.type')}</TableCell>
            <TableCell>
              <ClientTypeSelector
                value={values.type}
                onChange={handleUpdateType}
              />
              {showErrors && <FieldError error={errors.type} />}
            </TableCell>
          </TableRow>
          {!!availableScopes.length && (
            <TableRow>
              <TableCell>{t('apps.scopes')}</TableCell>
              <TableCell>
                <ScopesEditor
                  scopes={availableScopes}
                  value={values.scopes}
                  onToggleScope={handleToggleAppScope}
                />
                {showErrors && <FieldError error={errors.scopes} />}
              </TableCell>
            </TableRow>
          )}
          {values.type === typeTool.ClientType.SPA && (
            <TableRow>
              <TableCell>{t('apps.redirectUris')}</TableCell>
              <TableCell>
                <RedirectUriEditor
                  redirectUris={values.redirectUris}
                  onChange={(uris) => onChange(
                    'redirectUris',
                    uris,
                  )}
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
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
