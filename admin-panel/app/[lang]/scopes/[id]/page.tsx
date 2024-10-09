'use client'

import {
  Table,
  TextInput,
} from 'flowbite-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import {
  useMemo, useState,
} from 'react'
import useEditScope from '../useEditScope'
import LocaleEditor from '../LocaleEditor'
import {
  dataTool,
  routeTool,
} from 'tools'
import SaveButton from 'components/SaveButton'
import FieldError from 'components/FieldError'
import SubmitError from 'components/SubmitError'
import ClientTypeLabel from 'components/ClientTypeLabel'
import PageTitle from 'components/PageTitle'
import DeleteButton from 'components/DeleteButton'
import useLocaleRouter from 'hooks/useLocaleRoute'
import useSignalValue from 'app/useSignalValue'
import { configSignal } from 'signals'
import {
  useDeleteApiV1ScopesByIdMutation, useGetApiV1ScopesByIdQuery, usePutApiV1ScopesByIdMutation,
} from 'services/auth/api'

const Page = () => {
  const { id } = useParams()

  const t = useTranslations()
  const router = useLocaleRouter()

  const { data } = useGetApiV1ScopesByIdQuery({ id: Number(id) })
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

  if (!scope) return null

  return (
    <section>
      <PageTitle
        className='mb-6'
        title={t('scopes.scope')}
      />
      <section>
        <Table>
          <Table.Head>
            <Table.HeadCell className='max-md:w-24 md:w-48'>{t('common.property')}</Table.HeadCell>
            <Table.HeadCell>{t('common.value')}</Table.HeadCell>
          </Table.Head>
          <Table.Body className='divide-y'>
            <Table.Row>
              <Table.Cell>{t('scopes.name')}</Table.Cell>
              <Table.Cell>
                {isSystem
                  ? values.name
                  : (
                    <TextInput
                      data-testid='nameInput'
                      onChange={(e) => onChange(
                        'name',
                        e.target.value,
                      )}
                      value={values.name}
                    />
                  )}
                {showErrors && <FieldError error={errors.name} />}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('common.note')}</Table.Cell>
              <Table.Cell>
                <TextInput
                  data-testid='noteInput'
                  onChange={(e) => onChange(
                    'note',
                    e.target.value,
                  )}
                  value={values.note}
                />
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('scopes.type')}</Table.Cell>
              <Table.Cell>
                <ClientTypeLabel type={scope.type} />
              </Table.Cell>
            </Table.Row>
            {configs.ENABLE_USER_APP_CONSENT && scope.type === 'spa' && (
              <Table.Row>
                <Table.Cell>{t('scopes.locales')}</Table.Cell>
                <Table.Cell>
                  <LocaleEditor
                    supportedLocales={configs.SUPPORTED_LOCALES}
                    values={values.locales ?? []}
                    onChange={(locales) => onChange(
                      'locales',
                      locales,
                    )}
                  />
                </Table.Cell>
              </Table.Row>
            )}
            <Table.Row>
              <Table.Cell>{t('common.createdAt')}</Table.Cell>
              <Table.Cell>{scope.createdAt} UTC</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('common.updatedAt')}</Table.Cell>
              <Table.Cell>{scope.updatedAt} UTC</Table.Cell>
            </Table.Row>
          </Table.Body>
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
