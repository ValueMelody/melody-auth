import { ReactNode } from 'react'
import {
  AuthProvider as ReactAuthProvider, ProviderProps as ReactProviderProps,
} from '@melody-auth/react'
import { StorageType } from '@melody-auth/shared'
import { CookieOptions } from './storage/index'

export interface NextAuthProviderProps extends Omit<ReactProviderProps, 'serverUri' | 'storage'> {
  children: ReactNode;
  serverUrl: string;
  storage?: StorageType;
  cookieOptions?: CookieOptions;
}

export const NextAuthProvider = ({
  children,
  serverUrl,
  storage = 'cookieStorage' as StorageType,
  ...config
}: NextAuthProviderProps) => {
  const reactConfig = {
    ...config,
    serverUri: serverUrl,
    storage,
  } as ReactProviderProps

  return (
    <ReactAuthProvider {...reactConfig}>
      {children}
    </ReactAuthProvider>
  )
}
