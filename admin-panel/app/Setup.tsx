'use client'

import {
  PropsWithChildren, useEffect,
} from 'react'
import {
  AuthProvider, useAuth,
} from '@melody-auth/react'
import {
  Alert, Button, Navbar, Spinner,
} from 'flowbite-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ArrowRightEndOnRectangleIcon } from '@heroicons/react/16/solid'
import {
  usePathname, useRouter,
} from 'next/navigation'
import {
  Provider, useDispatch, useSelector,
} from 'react-redux'
import useSignalValue from './useSignalValue'
import {
  configSignal, userInfoSignal,
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
    isAuthenticating, isAuthenticated, acquireUserInfo, acquireToken,
    loginRedirect, logoutRedirect, isLoadingUserInfo, acquireUserInfoError,
  } = useAuth()

  const userInfo = useSignalValue(userInfoSignal)
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
      const getUserInfo = async () => {
        const info = await acquireUserInfo()
        if (info) userInfoSignal.value = info
      }

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
        getUserInfo()
      }
    },
    [acquireUserInfo, isAuthenticated, acquireToken],
  )

  if (isAuthenticating || isLoadingUserInfo || !state.acquireAuthToken) {
    return (
      <section className='flex flex-col justify-center items-center w-full h-screen'>
        <Spinner size='lg' />
      </section>
    )
  }

  if (!isAuthenticated) {
    loginRedirect({
      locale: locale || undefined, org: 'default',
    })
    return
  }

  if (!userInfo?.roles?.includes(typeTool.Role.SuperAdmin)) {
    return (
      <div className='w-full h-screen flex flex-col gap-8 items-center justify-center'>
        <Alert color='failure'>
          {acquireUserInfoError || t('layout.blocked')}
        </Alert>
        <Button
          color='gray'
          onClick={handleLogout}>{t('layout.logout')}
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
      <Navbar
        fluid
        rounded>
        <Navbar.Brand
          as={Link}
          href={`/${locale}${routeTool.Internal.Dashboard}`}>
          <img
            src='https://raw.githubusercontent.com/ValueMelody/melody-homepage/main/logo.jpg'
            className='mr-3 h-6 sm:h-9' />
          <span className='self-center whitespace-nowrap text-xl font-semibold dark:text-white'>
            {t('layout.brand')}
          </span>
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Navbar.Link
            as={Link}
            href={`/${locale}${routeTool.Internal.Dashboard}`}
            className='flex items-center h-6'
          >
            {t('layout.dashboard')}
          </Navbar.Link>
          <Navbar.Link
            as={Link}
            className='flex items-center h-6'
            href={`/${locale}${routeTool.Internal.Users}`}
          >
            {t('layout.users')}
          </Navbar.Link>
          <Navbar.Link
            as={Link}
            className='flex items-center h-6'
            href={`/${locale}${routeTool.Internal.Roles}`}
          >
            {t('layout.roles')}
          </Navbar.Link>
          <Navbar.Link
            as={Link}
            className='flex items-center h-6'
            href={`/${locale}${routeTool.Internal.Apps}`}
          >
            {t('layout.apps')}
          </Navbar.Link>
          <Navbar.Link
            as={Link}
            className='flex items-center h-6'
            href={`/${locale}${routeTool.Internal.Scopes}`}
          >
            {t('layout.scopes')}
          </Navbar.Link>
          {showOrg && (
            <Navbar.Link
              as={Link}
              className='flex items-center h-6'
              href={`/${locale}${routeTool.Internal.Orgs}`}
            >
              {t('layout.orgs')}
            </Navbar.Link>
          )}
          {!!showLogs && (
            <Navbar.Link
              as={Link}
              className='flex items-center h-6'
              href={`/${locale}${routeTool.Internal.Logs}`}
            >
              {t('layout.logs')}
            </Navbar.Link>
          )}
          <Navbar.Link
            as={Link}
            className='flex items-center h-6'
            href={`/${locale}${routeTool.Internal.Account}`}
          >
            {t('layout.account')}
          </Navbar.Link>
          <Navbar.Link
            as={Link}
            className='flex items-center h-6'
            href={`/${locale === 'en' ? 'fr' : 'en'}${routeTool.Internal.Dashboard}`}
          >
            {locale === 'en' ? 'FR' : 'EN'}
          </Navbar.Link>
          <Navbar.Link
            onClick={handleLogout}
            href='#'
            className='flex items-center gap-2'>
            <ArrowRightEndOnRectangleIcon className='w-6 h-6' /> {t('layout.logout')}
          </Navbar.Link>
        </Navbar.Collapse>
      </Navbar>
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
