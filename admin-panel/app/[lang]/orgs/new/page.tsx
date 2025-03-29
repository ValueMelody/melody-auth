'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Input } from 'components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from 'components/ui/table'
import useEditOrg from 'app/[lang]/orgs/useEditOrg'
import { routeTool } from 'tools'
import PageTitle from 'components/PageTitle'
import SaveButton from 'components/SaveButton'
import useLocaleRouter from 'hooks/useLocaleRoute'
import FieldError from 'components/FieldError'
import SubmitError from 'components/SubmitError'
import { usePostApiV1OrgsMutation } from 'services/auth/api'

const Page = () => {
  const t = useTranslations()
  const router = useLocaleRouter()

  const {
    values, errors, onChange,
  } = useEditOrg(undefined)
  const [showErrors, setShowErrors] = useState(false)
  const [createOrg, { isLoading: isCreating }] = usePostApiV1OrgsMutation()

  const handleSubmit = async () => {
    if (Object.values(errors).some((val) => !!val)) {
      setShowErrors(true)
      return
    }

    const res = await createOrg({ postOrgReq: values })

    if (res.data?.org?.id) {
      router.push(`${routeTool.Internal.Orgs}/${res.data.org.id}`)
    }
  }

  return (
    <section>
      <PageTitle
        className='mb-6'
        title={t('orgs.new')}
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
              <TableCell>{t('orgs.name')}</TableCell>
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
              <TableCell>{t('orgs.slug')}</TableCell>
              <TableCell>
                <Input
                  data-testid='slugInput'
                  onChange={(e) => onChange(
                    'slug',
                    e.target.value,
                  )}
                  value={values.slug}
                />
                {showErrors && <FieldError error={errors.slug} />}
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
