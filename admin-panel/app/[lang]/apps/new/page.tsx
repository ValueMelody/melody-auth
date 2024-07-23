'use client'

import {
  Button,
  Checkbox,
  Label,
  Select,
  Table,
  TextInput,
} from 'flowbite-react'
import { useTranslations } from 'next-intl'
import {
  useMemo, useState,
} from 'react'
import { PlusIcon } from '@heroicons/react/16/solid'
import { useAuth } from '@melody-auth/react'
import {
  ClientType, Scope,
} from 'shared'
import useEditApp from '../useEditApp'
import { proxyTool } from 'tools'

const Page = () => {
  const t = useTranslations()

  const { acquireToken } = useAuth()
  const {
    values, errors, onChange,
  } = useEditApp()
  const [showErrors, setShowErrors] = useState(false)

  const availableScopes = useMemo(
    () => {
      if (values.type === ClientType.SPA) {
        return [Scope.OfflineAccess, Scope.OpenId, Scope.Profile]
      }

      if (values.type === ClientType.S2S) {
        return [Scope.READ_USER, Scope.WRITE_USER, Scope.READ_APP, Scope.WRITE_APP]
      }

      return []
    },
    [values.type],
  )

  const handleAddMoreUri = () => {
    onChange(
      'redirectUris',
      [...values.redirectUris, ''],
    )
  }

  const handleUpdateUri = (
    targetIndex: number, value: string,
  ) => {
    const newUris = values.redirectUris.map((
      uri, index,
    ) => {
      return targetIndex === index ? value : uri
    })
    onChange(
      'redirectUris',
      newUris,
    )
  }

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

  const handleUpdateScopes = (scope: Scope) => {
    const newScopes = values.scopes.includes(scope)
      ? values.scopes.filter((currentScope) => currentScope !== scope)
      : [...values.scopes, scope]
    onChange(
      'scopes',
      newScopes,
    )
  }

  console.log(errors)
  const handleSubmit = async () => {
    if (Object.values(errors).some((val) => !!val)) {
      setShowErrors(true)
      return
    }

    const token = await acquireToken()
    await proxyTool.sendNextRequest({
      endpoint: '/api/apps',
      method: 'POST',
      token,
      body: { data: values },
    })
  }

  return (
    <section>
      <section>
        <Table>
          <Table.Head>
            <Table.HeadCell>{t('common.property')}</Table.HeadCell>
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
                  value={values.name} />
                {showErrors && <p className='text-red-600 mt-2'>{errors.name}</p>}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('apps.type')}</Table.Cell>
              <Table.Cell>
                <Select
                  value={values.type}
                  onChange={(e) => handleUpdateType(e.target.value)}>
                  <option disabled></option>
                  <option value={ClientType.SPA}>SPA</option>
                  <option value={ClientType.S2S}>S2S</option>
                </Select>
                {showErrors && <p className='text-red-600 mt-2'>{errors.type}</p>}
              </Table.Cell>
            </Table.Row>
            {!!availableScopes.length && (
              <Table.Row>
                <Table.Cell>{t('apps.scopes')}</Table.Cell>
                <Table.Cell>
                  <section className='flex flex-col gap-4'>
                    {availableScopes.map((scope) => (
                      <div
                        key={scope}
                        className='flex items-center gap-2'>
                        <Checkbox
                          onChange={() => handleUpdateScopes(scope)}
                          value={String(values.scopes.includes(scope))}
                          id={scope} />
                        <Label htmlFor={scope}>
                          {scope}
                        </Label>
                      </div>
                    ))}
                  </section>
                  {showErrors && <p className='text-red-600 mt-2'>{errors.scopes}</p>}
                </Table.Cell>
              </Table.Row>
            )}
            {values.type === ClientType.SPA && (
              <Table.Row>
                <Table.Cell>{t('apps.redirectUris')}</Table.Cell>
                <Table.Cell>
                  <section className='flex flex-col gap-4'>
                    {
                      values.redirectUris.map((
                        uri, index,
                      ) => (
                        <TextInput
                          onChange={(e) => handleUpdateUri(
                            index,
                            e.target.value,
                          )}
                          key={index}
                          value={uri} />
                      ))
                    }
                  </section>
                  <Button
                    onClick={handleAddMoreUri}
                    className='mt-4'
                    size='xs'><PlusIcon className='w-4 h-4' />
                  </Button>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </section>
      <Button
        onClick={handleSubmit}
        className='mt-6'>
        {t('common.save')}
      </Button>
    </section>
  )
}

export default Page
