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

const ShadcnBreadcrumb = ({
  parent,
  page,
  className,
}: {
  parent?: {
    label: string;
    href: string;
  };
  page?: {
    label: string;
  };
  className?: string;
}) => {
  const t = useTranslations()
  const router = useRouter()
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            className='cursor-pointer'
            onClick={() => {
              router.push(routeTool.Internal.Dashboard)
            }}>{t('layout.dashboard')}</BreadcrumbLink>
        </BreadcrumbItem>

        {parent && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem className='cursor-pointer'>
              <BreadcrumbLink
                onClick={() => {
                  router.push(parent.href)
                }}>{parent.label}</BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}

        {page && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{page.label}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default ShadcnBreadcrumb
