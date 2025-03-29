'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import useEditScope from '../useEditScope'
import LocaleEditor from '../LocaleEditor'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from 'components/ui/table'
import { Input } from 'components/ui/input'
import { routeTool } from 'tools'
import PageTitle from 'components/PageTitle'
import SaveButton from 'components/SaveButton'
import useLocaleRouter from 'hooks/useLocaleRoute'
import FieldError from 'components/FieldError'
import ClientTypeSelector from 'components/ClientTypeSelector'
import SubmitError from 'components/SubmitError'
import useSignalValue from 'app/useSignalValue'
import { configSignal } from 'signals'
import { usePostApiV1ScopesMutation } from 'services/auth/api'

const Page = () => {
  const t = useTranslations()
  const router = useLocaleRouter()

  const {
    values, errors, onChange,
  } = useEditScope(undefined)
  const [showErrors, setShowErrors] = useState(false)
  const configs = useSignalValue(configSignal)

  const [createScope, { isLoading: isCreating }] = usePostApiV1ScopesMutation()

  const handleUpdateType = (val: string) => {
    onChange(
      'type',
      val,
    )
    onChange(
      'locales',
      undefined,
    )
  }

  const handleSubmit = async () => {
    if (Object.values(errors).some((val) => !!val)) {
      setShowErrors(true)
      return
    }

    const res = await createScope({
      postScopeReq: {
        ...values,
        type: values.type as 'spa' | 's2s',
      },
    })

    if (res.data?.scope?.id) {
      router.push(`${routeTool.Internal.Scopes}/${res.data.scope.id}`)
    }
  }

  return (
    <section>
      <PageTitle
        className='mb-6'
        title={t('scopes.new')}
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
                <ClientTypeSelector
                  value={values.type}
                  onChange={handleUpdateType}
                />
                {showErrors && <FieldError error={errors.type} />}
              </TableCell>
            </TableRow>
            {configs.ENABLE_USER_APP_CONSENT && values.type === 'spa' && (
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
          </TableBody>
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
