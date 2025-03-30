'use client'

import { useTranslations } from 'next-intl'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'components/ui/table'
import { routeTool } from 'tools'
import EditLink from 'components/EditLink'
import CreateButton from 'components/CreateButton'
import {
  useGetApiV1OrgsQuery, Org,
} from 'services/auth/api'
import Breadcrumb from 'components/Breadcrumb'
import LoadingPage from 'components/LoadingPage'
const Page = () => {
  const t = useTranslations()

  const {
    data, isLoading,
  } = useGetApiV1OrgsQuery()
  const orgs = data?.orgs ?? []

  const renderEditButton = (org: Org) => {
    return (
      <EditLink
        href={`${routeTool.Internal.Orgs}/${org.id}`}
      />
    )
  }

  if (isLoading) return <LoadingPage />

  return (
    <section>
      <div className='mb-8 flex items-center gap-8'>
        <Breadcrumb
          page={{ label: t('orgs.title') }}
        />
        <CreateButton
          href={`${routeTool.Internal.Orgs}/new`}
        />
      </div>
      <Table>
        <TableHeader className='md:hidden'>
          <TableRow>
            <TableHead>{t('orgs.org')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableHeader className='max-md:hidden'>
          <TableRow>
            <TableHead>{t('orgs.name')}</TableHead>
            <TableHead>{t('orgs.slug')}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody className='divide-y md:hidden'>
          {orgs.map((org) => (
            <TableRow
              key={org.id}
              data-testid={`roleRow-${org.id}`}
            >
              <TableCell>
                <section className='flex justify-between items-center'>
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center gap-2'>
                      {org.name}
                    </div>
                    <div className='flex items-center gap-2'>
                      {org.slug}
                    </div>
                    <div className='md:hidden'>
                      {renderEditButton(org)}
                    </div>
                  </div>
                </section>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableBody className='divide-y max-md:hidden'>
          {orgs.map((org) => (
            <TableRow key={org.id}>
              <TableCell>
                {org.name}
              </TableCell>
              <TableCell>
                {org.slug}
              </TableCell>
              <TableCell>
                {renderEditButton(org)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}

export default Page
