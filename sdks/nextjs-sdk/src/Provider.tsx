import { ReactNode } from 'react'
import { AuthProvider as ReactAuthProvider } from '@melody-auth/react'
import {
  ProviderConfig, StorageType,
} from '@melody-auth/shared'
import { CookieOptions } from './storage/index'

export interface NextAuthProviderProps extends Omit<ProviderConfig, 'serverUri' | 'storage'> {
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
  } as ProviderConfig

  return (
    <ReactAuthProvider {...reactConfig}>
      {children}
    </ReactAuthProvider>
  )
}
