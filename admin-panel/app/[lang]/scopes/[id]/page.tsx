'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import {
  useMemo, useState,
} from 'react'
import useEditScope from '../useEditScope'
import LocaleEditor from '../LocaleEditor'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from 'components/ui/table'
import { Input } from 'components/ui/input'
import {
  dataTool,
  routeTool,
} from 'tools'
import SaveButton from 'components/SaveButton'
import FieldError from 'components/FieldError'
import SubmitError from 'components/SubmitError'
import ClientTypeLabel from 'components/ClientTypeLabel'
import DeleteButton from 'components/DeleteButton'
import useLocaleRouter from 'hooks/useLocaleRoute'
import useSignalValue from 'app/useSignalValue'
import { configSignal } from 'signals'
import {
  useDeleteApiV1ScopesByIdMutation, useGetApiV1ScopesByIdQuery, usePutApiV1ScopesByIdMutation,
} from 'services/auth/api'
import Breadcrumb from 'components/Breadcrumb'
import LoadingPage from 'components/LoadingPage'

const Page = () => {
  const { id } = useParams()

  const t = useTranslations()
  const router = useLocaleRouter()

  const {
    data, isLoading,
  } = useGetApiV1ScopesByIdQuery({ id: Number(id) })
  const scope = data?.scope
  const [updateScope, { isLoading: isUpdating }] = usePutApiV1ScopesByIdMutation()
  const [deleteScope, { isLoading: isDeleting }] = useDeleteApiV1ScopesByIdMutation()

  const configs = useSignalValue(configSignal)

  const isSystem = useMemo(
    () => scope && dataTool.isSystem(scope.name),
    [scope],
  )

  const {
    values, errors, onChange,
  } = useEditScope(scope)
  const [showErrors, setShowErrors] = useState(false)

  const hasDifferentLocales = useMemo(
    () => {
      if (values.locales !== undefined && scope?.locales === undefined) return true
      if (Array.isArray(values.locales) && Array.isArray(scope?.locales)) {
        if (values.locales.length !== scope.locales.length) return true
        if (values.locales.find((valueLocale) => {
          return scope.locales.every((scopeLocale) => {
            return scopeLocale.locale !== valueLocale.locale || scopeLocale.value !== valueLocale.value
          })
        })) return true
      }
      return false
    },
    [values, scope],
  )

  const hasDifferentName = useMemo(
    () => values.name && values.name !== scope?.name,
    [values, scope],
  )
  const hasDifferentNote = useMemo(
    () => values.note !== scope?.note,
    [values, scope],
  )

  const canUpdate = useMemo(
    () => hasDifferentName || hasDifferentNote || hasDifferentLocales,
    [hasDifferentName, hasDifferentNote, hasDifferentLocales],
  )

  const handleSave = async () => {
    if (Object.values(errors).some((val) => !!val)) {
      setShowErrors(true)
      return
    }

    await updateScope({
      id: Number(id),
      putScopeReq: {
        name: hasDifferentName ? values.name : undefined,
        note: hasDifferentNote ? values.note : undefined,
        locales: hasDifferentLocales ? values.locales : undefined,
      },
    })
  }

  const handleDelete = async () => {
    await deleteScope({ id: Number(id) })

    router.push(routeTool.Internal.Scopes)
  }

  if (isLoading) return <LoadingPage />

  if (!scope) return null

  return (
    <section>
      <Breadcrumb
        className='mb-8'
        page={{ label: t('scopes.scope') }}
        parent={{
          href: routeTool.Internal.Scopes,
          label: t('scopes.title'),
        }}
      />
      <section>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='max-md:w-24 md:w-48'>{t('common.property')}</TableHead>
              <TableHead>{t('common.value')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className='divide-y'>
            <TableRow>
              <TableCell>{t('scopes.name')}</TableCell>
              <TableCell>
                {isSystem
                  ? values.name
                  : (
                    <Input
                      data-testid='nameInput'
                      onChange={(e) => onChange(
                        'name',
                        e.target.value,
                      )}
                      value={values.name}
                    />
                  )}
                {showErrors && <FieldError error={errors.name} />}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('common.note')}</TableCell>
              <TableCell>
                <Input
                  data-testid='noteInput'
                  onChange={(e) => onChange(
                    'note',
                    e.target.value,
                  )}
                  value={values.note}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('scopes.type')}</TableCell>
              <TableCell>
                <ClientTypeLabel type={scope.type} />
              </TableCell>
            </TableRow>
            {configs.ENABLE_USER_APP_CONSENT && scope.type === 'spa' && (
              <TableRow>
                <TableCell>{t('scopes.locales')}</TableCell>
                <TableCell>
                  <LocaleEditor
                    supportedLocales={configs.SUPPORTED_LOCALES}
                    values={values.locales ?? []}
                    onChange={(locales) => onChange(
                      'locales',
                      locales,
                    )}
                  />
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell>{t('common.createdAt')}</TableCell>
              <TableCell>{scope.createdAt} UTC</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('common.updatedAt')}</TableCell>
              <TableCell>{scope.updatedAt} UTC</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>
      <SubmitError />
      <section className='flex items-center gap-4 mt-8'>
        <SaveButton
          isLoading={isUpdating}
          disabled={!canUpdate || isDeleting}
          onClick={handleSave}
        />
        {!isSystem && (
          <DeleteButton
            isLoading={isDeleting}
            disabled={isUpdating}
            confirmDeleteTitle={t(
              'common.deleteConfirm',
              { item: values.name },
            )}
            onConfirmDelete={handleDelete}
          />
        )}
      </section>
    </section>
  )
}

export default Page
