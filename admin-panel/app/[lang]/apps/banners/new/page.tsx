'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import useEditBanner from '../useEditBanner'
import LocaleEditor from 'components/LocaleEditor'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from 'components/ui/table'
import { Input } from 'components/ui/input'
import { routeTool } from 'tools'
import SaveButton from 'components/SaveButton'
import { useRouter } from 'i18n/navigation'
import FieldError from 'components/FieldError'
import SubmitError from 'components/SubmitError'
import useSignalValue from 'app/useSignalValue'
import { configSignal } from 'signals'
import { usePostApiV1AppBannersMutation } from 'services/auth/api'
import Breadcrumb from 'components/Breadcrumb'
import RequiredProperty from 'components/RequiredProperty'
import BannerTypeSelector from 'components/BannerTypeSelector'

const Page = () => {
  const t = useTranslations()
  const router = useRouter()

  const {
    values, errors, onChange,
  } = useEditBanner(undefined)
  const [showErrors, setShowErrors] = useState(false)
  const configs = useSignalValue(configSignal)

  const [createBanner, { isLoading: isCreating }] = usePostApiV1AppBannersMutation()

  const handleSubmit = async () => {
    if (Object.values(errors).some((val) => !!val)) {
      setShowErrors(true)
      return
    }

    const res = await createBanner({ postAppBannerReq: { ...values } })

    if (res.data?.appBanner?.id) {
      router.push(`${routeTool.Internal.Apps}/banners/${res.data.appBanner.id}`)
    }
  }

  return (
    <section>
      <Breadcrumb
        page={{ label: t('apps.newBanner') }}
        parent={{
          href: routeTool.Internal.Apps,
          label: t('apps.title'),
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
              <TableCell>
                <RequiredProperty title={t('apps.bannerType')} />
              </TableCell>
              <TableCell>
                <BannerTypeSelector
                  value={values.type}
                  onChange={(val) => onChange(
                    'type',
                    val,
                  )}
                />
                {showErrors && <FieldError error={errors.type} />}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <RequiredProperty title={t('apps.bannerText')} />
              </TableCell>
              <TableCell>
                <Input
                  data-testid='textInput'
                  onChange={(e) => onChange(
                    'text',
                    e.target.value,
                  )}
                  value={values.text}
                />
                {showErrors && <FieldError error={errors.text} />}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('apps.bannerLocales')}</TableCell>
              <TableCell>
                <LocaleEditor
                  description={`* ${t('apps.bannerLocalesNote')}`}
                  supportedLocales={configs.SUPPORTED_LOCALES}
                  values={values.locales ?? []}
                  onChange={(locales) => onChange(
                    'locales',
                    locales,
                  )}
                />
              </TableCell>
            </TableRow>
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
