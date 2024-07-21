'use client'

import {
  PropsWithChildren, useEffect,
} from 'react'
import {
  AuthProvider, useAuth,
} from '@melody-auth/react'
import {
  Alert, Navbar, Spinner,
} from 'flowbite-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ArrowRightEndOnRectangleIcon } from '@heroicons/react/16/solid'
import { userInfoSignal } from 'signals'

const AuthSetup = ({ children }: PropsWithChildren) => {
  const t = useTranslations()

  const {
    isAuthenticating, isAuthenticated, acquireUserInfo,
    loginRedirect,
  } = useAuth()

  useEffect(
    () => {
      const getUserInfo = async () => {
        const userInfo = await acquireUserInfo()
        if (userInfo) userInfoSignal.value = userInfo
      }

      if (isAuthenticated) getUserInfo()
    },
    [acquireUserInfo, isAuthenticated],
  )

  if (isAuthenticating) {
    return (
      <section className='flex flex-col justify-center items-center w-full h-screen'>
        <Spinner size='lg' />
      </section>
    )
  }

  if (!isAuthenticated) {
    loginRedirect()
    return
  }

  if (!userInfoSignal.value?.roles?.includes('super_admin')) {
    return (
      <Alert color='failure'>
        {t('layout.blocked')}
      </Alert>
    )
  }

  return children
}

const LayoutSetup = ({ children } : PropsWithChildren) => {
  const t = useTranslations()
  const { logoutRedirect } = useAuth()

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
          href='/'>
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
  return (
    <AuthProvider
      clientId={process.env.NEXT_PUBLIC_CLIENT_ID ?? ''}
      redirectUri={`${process.env.NEXT_PUBLIC_CLIENT_URI}/en/dashboard` ?? ''}
      serverUri={process.env.NEXT_PUBLIC_SERVER_URI ?? ''}
    >
      <AuthSetup>
        <LayoutSetup>
          {children}
        </LayoutSetup>
      </AuthSetup>
    </AuthProvider>
  )
}

export default Setup
