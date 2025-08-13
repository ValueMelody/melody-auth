'use client'

import {
  PropsWithChildren, useEffect,
  useMemo,
} from 'react'
import {
  AuthProvider, useAuth,
} from '@melody-auth/react'
import {
  useLocale, useTranslations,
} from 'next-intl'
import NextLink from 'next/link'
import { ArrowRightEndOnRectangleIcon } from '@heroicons/react/16/solid'
import {
  usePathname, useRouter,
} from 'next/navigation'
import {
  Provider, useDispatch, useSelector,
} from 'react-redux'
import {
  Building2, ChevronsUpDown, CircleUser, FileCode, Globe, IdCard, LayoutDashboard,
  ScrollText, Shapes, Tags, UsersRound, Workflow,
} from 'lucide-react'
import useSignalValue from './useSignalValue'
import { useIsMobile } from '@/hooks/useIsMobile'
import {
  Link, usePathname as useI18nPathname,
} from 'i18n/navigation'
import { Alert } from 'components/ui/alert'
import { Button } from 'components/ui/button'
import { Spinner } from 'components/ui/spinner'
import {
  configSignal,
  errorSignal,
} from 'signals'
import {
  proxyTool,
  routeTool,
  accessTool,
} from 'tools'
import {
  RootState, store,
} from 'stores'
import { appSlice } from 'stores/app'
import LoadingPage from 'components/LoadingPage'
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarProvider,
} from 'components/ui/sidebar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from 'components/ui/dropdown-menu'

const locale = typeof localStorage !== 'undefined' && localStorage.getItem('Locale')

const AuthSetup = ({ children }: PropsWithChildren) => {
  const t = useTranslations()
  const state = useSelector((state: RootState) => state.app)
  const dispatch = useDispatch()

  const {
    isAuthenticating, isAuthenticated, acquireUserInfo, acquireToken, userInfo,
    loginRedirect, logoutRedirect, isLoadingUserInfo, acquireUserInfoError,
  } = useAuth()

  const handleLogout = () => {
    logoutRedirect({ postLogoutRedirectUri: process.env.NEXT_PUBLIC_CLIENT_URI })
  }

  useEffect(
    () => {
      dispatch(appSlice.actions.storeAcquireAuthToken(acquireToken))
    },
    [acquireToken, dispatch],
  )

  useEffect(
    () => {
      const getInfo = async () => {
        const token = await acquireToken()
        const data = await proxyTool.sendNextRequest({
          endpoint: '/api/info',
          method: 'GET',
          token,
        })
        configSignal.value = data.configs
      }

      if (isAuthenticated) {
        getInfo()
        acquireUserInfo()
      }
    },
    [acquireUserInfo, isAuthenticated, acquireToken],
  )

  useEffect(
    () => {
      if (!isAuthenticated && !isAuthenticating) {
        loginRedirect({
          locale: locale || undefined, org: 'default',
        })
      }
    },
    [isAuthenticated, isAuthenticating, loginRedirect],
  )

  if (isAuthenticating || isLoadingUserInfo || !state.acquireAuthToken) {
    return (
      <section className='flex flex-col justify-center items-center w-full h-screen'>
        <Spinner />
      </section>
    )
  }

  if (!isAuthenticated) {
    return
  }

  if (!accessTool.getAllowedRoles(userInfo?.roles ?? []).length) {
    return (
      <div className='w-full h-screen flex flex-col gap-8 items-center justify-center'>
        <div>
          <Alert variant='destructive'>
            {acquireUserInfoError || t('layout.blocked')}
          </Alert>
        </div>
        <Button
          variant='ghost'
          onClick={handleLogout}
        >
          {t('layout.logout')}
        </Button>
      </div>
    )
  }

  return children
}

const LayoutSetup = ({ children } : PropsWithChildren) => {
  const t = useTranslations()
  const locale = useLocale()
  const {
    logoutRedirect, userInfo,
  } = useAuth()

  const nextRouter = useRouter()
  const pathname = useI18nPathname()

  const configs = useSignalValue(configSignal)
  const showLogs = (
    configs?.ENABLE_SIGN_IN_LOG || configs?.ENABLE_SMS_LOG || configs?.ENABLE_EMAIL_LOG
  ) && accessTool.isAllowedAccess(
    accessTool.Access.ReadLog,
    userInfo?.roles,
  )
  const showOrg = configs?.ENABLE_ORG && accessTool.isAllowedAccess(
    accessTool.Access.ReadOrg,
    userInfo?.roles,
  )
  const showUserAttribute = configs?.ENABLE_USER_ATTRIBUTE && accessTool.isAllowedAccess(
    accessTool.Access.ReadUserAttribute,
    userInfo?.roles,
  )
  const showSamlSso = configs?.ENABLE_SAML_SSO_AS_SP && accessTool.isAllowedAccess(
    accessTool.Access.ManageSamlSso,
    userInfo?.roles,
  )

  const isMobile = useIsMobile()

  const supportedLocales = useMemo(
    () => {
      return process.env.NEXT_PUBLIC_SUPPORTED_LOCALES?.split(',') ?? ['en', 'fr']
    },
    [],
  )
  const otherLocale = locale === 'en' ? 'fr' : 'en'

  useEffect(
    () => {
      if (supportedLocales.includes(locale)) {
        localStorage.setItem(
          'Locale',
          locale,
        )
      } else {
        nextRouter.push(`/${otherLocale}${routeTool.Internal.Dashboard}`)
      }
    },
    [locale, otherLocale, supportedLocales, nextRouter],
  )

  const handleLogout = () => {
    logoutRedirect({ postLogoutRedirectUri: process.env.NEXT_PUBLIC_CLIENT_URI })
  }

  return (
    <>
      <Sidebar
        collapsible='icon'
        variant='floating'>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className='flex items-center mt-2'>
                <img
                  src='https://valuemelody.com/logo.svg'
                  className='mr-3 h-6'
                />
                <span className='self-center whitespace-nowrap text-medium font-semibold dark:text-white'>
                  {t('layout.brand')}
                </span>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className='p-2 mt-4'>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === routeTool.Internal.Dashboard}
              >
                <Link
                  href={routeTool.Internal.Dashboard}
                >
                  <LayoutDashboard />
                  {t('layout.dashboard')}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {accessTool.isAllowedAccess(
              accessTool.Access.ReadUser,
              userInfo?.roles,
            ) && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === routeTool.Internal.Users}
                >
                  <Link
                    href={routeTool.Internal.Users}
                  >
                    <UsersRound />
                    {t('layout.users')}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            {showUserAttribute && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === routeTool.Internal.UserAttributes}
                >
                  <Link
                    href={routeTool.Internal.UserAttributes}
                  >
                    <Tags />
                    {t('layout.userAttributes')}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            {accessTool.isAllowedAccess(
              accessTool.Access.ReadRole,
              userInfo?.roles,
            ) && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === routeTool.Internal.Roles}
                >
                  <Link
                    href={routeTool.Internal.Roles}
                  >
                    <IdCard />
                    {t('layout.roles')}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            {accessTool.isAllowedAccess(
              accessTool.Access.ReadApp,
              userInfo?.roles,
            ) && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === routeTool.Internal.Apps}
                >
                  <Link
                    href={routeTool.Internal.Apps}
                  >
                    <Workflow />
                    {t('layout.apps')}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            {accessTool.isAllowedAccess(
              accessTool.Access.ReadScope,
              userInfo?.roles,
            ) && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === routeTool.Internal.Scopes}
                >
                  <Link
                    href={routeTool.Internal.Scopes}
                  >
                    <Shapes />
                    {t('layout.scopes')}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            {!!showOrg && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === routeTool.Internal.Orgs}
                >
                  <Link
                    href={routeTool.Internal.Orgs}
                  >
                    <Building2 />
                    {t('layout.orgs')}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            {!!showSamlSso && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === routeTool.Internal.Saml}
                >
                  <Link
                    href={routeTool.Internal.Saml}
                  >
                    <FileCode />
                    {t('layout.samlSso')}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            {!!showLogs && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === routeTool.Internal.Logs}
                >
                  <Link
                    href={routeTool.Internal.Logs}
                  >
                    <ScrollText />
                    {t('layout.logs')}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                data-testid='userInfoDropdown'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  {(userInfo?.firstName || userInfo?.lastName) && (
                    <span className='truncate font-semibold'>{`${userInfo?.firstName ?? ''} ${userInfo?.lastName ?? ''}`}</span>
                  )}
                  <span className='truncate text-xs'>{userInfo?.email}</span>
                  <span className='truncate text-xs'>{userInfo?.roles.join(', ')}</span>
                </div>
                <ChevronsUpDown className='ml-auto size-4' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
              side={isMobile ? 'bottom' : 'right'}
              align='end'
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link
                    href={routeTool.Internal.Account}
                  >
                    <CircleUser />
                    {t('layout.account')}
                  </Link>
                </DropdownMenuItem>
                {supportedLocales.includes(otherLocale) && (
                  <DropdownMenuItem asChild>
                    <NextLink
                      href={`/${otherLocale}${routeTool.Internal.Dashboard}`}
                    >
                      <Globe />
                      {otherLocale.toUpperCase()}
                    </NextLink>
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <a
                  onClick={handleLogout}
                  className='flex items-center gap-2 cursor-pointer'
                >
                  <ArrowRightEndOnRectangleIcon className='w-4 h-4' /> {t('layout.logout')}
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      {
        configs
          ? (
            <section className='w-full p-6'>
              {children}
            </section>
          )
          : (
            <LoadingPage />
          )
      }
    </>
  )
}

const Setup = ({ children } : PropsWithChildren) => {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(
    () => {
      errorSignal.value = ''
    },
    [pathname],
  )

  // Get the current locale (or default to 'en')
  const currentLocale = locale || 'en'

  return (
    <Provider store={store}>
      <AuthProvider
        clientId={process.env.NEXT_PUBLIC_CLIENT_ID ?? ''}
        redirectUri={`${process.env.NEXT_PUBLIC_CLIENT_URI}/${currentLocale}/dashboard`}
        serverUri={process.env.NEXT_PUBLIC_SERVER_URI ?? ''}
        onLoginSuccess={(attr) => {
          if (attr.locale !== locale) {
            router.push(`/${attr.locale === 'fr' ? 'fr' : 'en'}${routeTool.Internal.Dashboard}`)
          }
        }}
      >
        <AuthSetup>
          <SidebarProvider>
            <LayoutSetup>
              {children}
            </LayoutSetup>
          </SidebarProvider>
        </AuthSetup>
      </AuthProvider>
    </Provider>
  )
}

export default Setup
