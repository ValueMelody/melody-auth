'use client'

import {
  PropsWithChildren, useEffect,
} from 'react'
import {
  AuthProvider, useAuth,
} from '@melody-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ArrowRightEndOnRectangleIcon } from '@heroicons/react/16/solid'
import {
  usePathname, useRouter,
} from 'next/navigation'
import {
  Provider, useDispatch, useSelector,
} from 'react-redux'
import { twMerge } from 'tailwind-merge'
import useSignalValue from './useSignalValue'
import {
  NavigationMenu, NavigationMenuItem, NavigationMenuLink, navigationMenuTriggerStyle, NavigationMenuList,
} from 'components/ui/navigation-menu'
import { Alert } from 'components/ui/alert'
import { Button } from 'components/ui/button'
import { Spinner } from 'components/ui/spinner'
import {
  configSignal,
  errorSignal,
} from 'signals'
import useCurrentLocale from 'hooks/useCurrentLocale'
import {
  proxyTool,
  routeTool, typeTool,
} from 'tools'
import {
  RootState, store,
} from 'stores'
import { appSlice } from 'stores/app'

const locale = typeof localStorage !== 'undefined' && localStorage.getItem('Locale')

const AuthSetup = ({ children }: PropsWithChildren) => {
  const t = useTranslations()
  const state = useSelector((state: RootState) => state.app)
  const dispatch = useDispatch()

  const {
    isAuthenticating, isAuthenticated, acquireUserInfo, acquireToken, userInfo,
    loginRedirect, logoutRedirect, isLoadingUserInfo, acquireUserInfoError,
  } = useAuth()

  const configs = useSignalValue(configSignal)

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

  if (!userInfo?.roles?.includes(typeTool.Role.SuperAdmin)) {
    return (
      <div className='w-full h-screen flex flex-col gap-8 items-center justify-center'>
        <Alert variant='destructive'>
          {acquireUserInfoError || t('layout.blocked')}
        </Alert>
        <Button
          variant='ghost'
          onClick={handleLogout}
        >
          {t('layout.logout')}
        </Button>
      </div>
    )
  }

  if (!configs) return <Spinner />

  return children
}

const LayoutSetup = ({ children } : PropsWithChildren) => {
  const t = useTranslations()
  const locale = useCurrentLocale()
  const { logoutRedirect } = useAuth()

  const configs = useSignalValue(configSignal)
  const showLogs = configs?.ENABLE_SIGN_IN_LOG || configs?.ENABLE_SMS_LOG || configs?.ENABLE_EMAIL_LOG
  const showOrg = configs?.ENABLE_ORG

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
      <NavigationMenu className='w-full max-h-20 max-md:max-h-40 py-4'>
        <NavigationMenuList className='flex-wrap justify-start'>
          <NavigationMenuItem>
            <Link
              href={`/${locale}${routeTool.Internal.Dashboard}`}
            >
              <NavigationMenuLink
                className={twMerge(
                  navigationMenuTriggerStyle(),
                  'flex items-center',
                )}>
                <img
                  src='https://raw.githubusercontent.com/ValueMelody/melody-homepage/main/logo.jpg'
                  className='mr-3 h-6 sm:h-9'
                />
                <span className='self-center whitespace-nowrap text-medium font-semibold dark:text-white'>
                  {t('layout.brand')}
                </span>
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link
              href={`/${locale}${routeTool.Internal.Dashboard}`}
            >
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                {t('layout.dashboard')}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link
              href={`/${locale}${routeTool.Internal.Users}`}
            >
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                {t('layout.users')}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link
              href={`/${locale}${routeTool.Internal.Roles}`}
            >
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                {t('layout.roles')}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link
              href={`/${locale}${routeTool.Internal.Apps}`}
            >
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                {t('layout.apps')}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link
              href={`/${locale}${routeTool.Internal.Scopes}`}
            >
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                {t('layout.scopes')}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          {!!showOrg && (
            <NavigationMenuItem>
              <Link
                className='flex items-center h-6'
                href={`/${locale}${routeTool.Internal.Orgs}`}
              >
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  {t('layout.orgs')}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          )}
          {!!showLogs && (
            <NavigationMenuItem>
              <Link
                href={`/${locale}${routeTool.Internal.Logs}`}
              >
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  {t('layout.logs')}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          )}
          <NavigationMenuItem>
            <Link
              href={`/${locale}${routeTool.Internal.Account}`}
            >
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                {t('layout.account')}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link
              href={`/${locale === 'en' ? 'fr' : 'en'}${routeTool.Internal.Dashboard}`}
            >
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                {locale === 'en' ? 'FR' : 'EN'}
              </NavigationMenuLink>
            </Link>
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
      <section className='p-6'>
        {children}
      </section>
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

  return (
    <Provider store={store}>
      <AuthProvider
        clientId={process.env.NEXT_PUBLIC_CLIENT_ID ?? ''}
        redirectUri={`${process.env.NEXT_PUBLIC_CLIENT_URI}/${locale || 'en'}/dashboard`}
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
