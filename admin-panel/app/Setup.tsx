'use client'

import {
  PropsWithChildren, useEffect,
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
import { twMerge } from 'tailwind-merge'
import useSignalValue from './useSignalValue'
import { Link } from 'i18n/navigation'
import {
  NavigationMenu, NavigationMenuItem, navigationMenuTriggerStyle, NavigationMenuList,
} from 'components/ui/navigation-menu'
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

  useEffect(
    () => {
      localStorage.setItem(
        'Locale',
        locale,
      )
    },
    [locale],
  )

  const handleLogout = () => {
    logoutRedirect({ postLogoutRedirectUri: process.env.NEXT_PUBLIC_CLIENT_URI })
  }

  return (
    <>
      <NavigationMenu className='w-full max-h-20 min-h-20 max-md:min-h-40 max-md:max-h-40 py-4'>
        <NavigationMenuList className='flex-wrap justify-start'>
          <NavigationMenuItem>
            <Link
              href={routeTool.Internal.Dashboard}
              className={twMerge(
                navigationMenuTriggerStyle(),
                'flex items-center',
              )}
            >
              <img
                src='https://raw.githubusercontent.com/ValueMelody/melody-homepage/main/logo.jpg'
                className='mr-3 h-6 sm:h-9'
              />
              <span className='self-center whitespace-nowrap text-medium font-semibold dark:text-white'>
                {t('layout.brand')}
              </span>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link
              href={routeTool.Internal.Dashboard}
              className={navigationMenuTriggerStyle()}
            >
              {t('layout.dashboard')}
            </Link>
          </NavigationMenuItem>
          {accessTool.isAllowedAccess(
            accessTool.Access.ReadUser,
            userInfo?.roles,
          ) && (
            <NavigationMenuItem>
              <Link
                href={routeTool.Internal.Users}
                className={navigationMenuTriggerStyle()}
              >
                {t('layout.users')}
              </Link>
            </NavigationMenuItem>
          )}
          {accessTool.isAllowedAccess(
            accessTool.Access.ReadRole,
            userInfo?.roles,
          ) && (
            <NavigationMenuItem>
              <Link
                href={routeTool.Internal.Roles}
                className={navigationMenuTriggerStyle()}
              >
                {t('layout.roles')}
              </Link>
            </NavigationMenuItem>
          )}
          {accessTool.isAllowedAccess(
            accessTool.Access.ReadApp,
            userInfo?.roles,
          ) && (
            <NavigationMenuItem>
              <Link
                href={routeTool.Internal.Apps}
                className={navigationMenuTriggerStyle()}
              >
                {t('layout.apps')}
              </Link>
            </NavigationMenuItem>
          )}
          {accessTool.isAllowedAccess(
            accessTool.Access.ReadScope,
            userInfo?.roles,
          ) && (
            <NavigationMenuItem>
              <Link
                href={routeTool.Internal.Scopes}
                className={navigationMenuTriggerStyle()}
              >
                {t('layout.scopes')}
              </Link>
            </NavigationMenuItem>
          )}
          {!!showOrg && (
            <NavigationMenuItem>
              <Link
                href={routeTool.Internal.Orgs}
                className={navigationMenuTriggerStyle()}
              >
                {t('layout.orgs')}
              </Link>
            </NavigationMenuItem>
          )}
          {!!showLogs && (
            <NavigationMenuItem>
              <Link
                href={routeTool.Internal.Logs}
                className={navigationMenuTriggerStyle()}
              >
                {t('layout.logs')}
              </Link>
            </NavigationMenuItem>
          )}
          <NavigationMenuItem>
            <Link
              href={routeTool.Internal.Account}
              className={navigationMenuTriggerStyle()}
            >
              {t('layout.account')}
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NextLink
              href={`/${locale === 'en' ? 'fr' : 'en'}${routeTool.Internal.Dashboard}`}
              className={navigationMenuTriggerStyle()}
            >
              {locale === 'en' ? 'FR' : 'EN'}
            </NextLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Button
              variant='link'
              onClick={handleLogout}
              className='flex items-center gap-2'
            >
              <ArrowRightEndOnRectangleIcon className='w-6 h-6' /> {t('layout.logout')}
            </Button>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      {
        configs
          ? (
            <section className='p-6'>
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
          <LayoutSetup>
            {children}
          </LayoutSetup>
        </AuthSetup>
      </AuthProvider>
    </Provider>
  )
}

export default Setup
