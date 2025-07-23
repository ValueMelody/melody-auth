import { useTranslations } from 'next-intl'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from 'components/ui/breadcrumb'
import { routeTool } from 'tools'
import { useRouter } from 'i18n/navigation'
import { SidebarTrigger } from 'components/ui/sidebar'
import classNames from 'classnames'

const ShadcnBreadcrumb = ({
  parent,
  page,
  action,
}: {
  parent?: {
    label: string;
    href: string;
  };
  page?: {
    label: string;
  };
  action?: React.ReactNode;
}) => {
  const router = useRouter()
  return (
    <section className='flex items-center gap-3 mb-8'>
      <SidebarTrigger variant='outline' className='sm:hidden scale-100' />
      <Breadcrumb>
        <BreadcrumbList>
          {parent && (
            <>
              <BreadcrumbItem className='cursor-pointer'>
                <BreadcrumbLink
                  onClick={() => {
                    router.push(parent.href)
                  }}
                >
                  {parent.label}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}

          {page && (
            <>
              <h1 className='text-2xl font-bold tracking-tight leading-none'>
                {page.label}
              </h1>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      {action}
    </section>
  )
}

export default ShadcnBreadcrumb
