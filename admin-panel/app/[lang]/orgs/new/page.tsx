'use client'

import {
  Table,
  TextInput,
} from 'flowbite-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
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
          <Table.Head>
            <Table.HeadCell className='max-md:w-24 md:w-48 '>{t('common.property')}</Table.HeadCell>
            <Table.HeadCell>{t('common.value')}</Table.HeadCell>
          </Table.Head>
          <Table.Body className='divide-y'>
            <Table.Row>
              <Table.Cell>{t('orgs.name')}</Table.Cell>
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
