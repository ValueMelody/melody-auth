import { ReactNode, useEffect } from 'react';
import { AuthProvider as ReactAuthProvider, ProviderProps as ReactProviderProps } from '@melody-auth/react';
import { CookieOptions, UniversalStorage } from './storage';

export interface NextAuthProviderProps extends Omit<ReactProviderProps, 'storage'> {
  children: ReactNode;
  storage?: 'cookie' | 'localStorage' | 'sessionStorage';
  cookieOptions?: CookieOptions;
}

export const NextAuthProvider = ({
  children,
  storage = 'cookie',
  cookieOptions,
  ...config
}: NextAuthProviderProps) => {
  // Create a custom storage adapter that works with cookies
  const storageAdapter = new UniversalStorage(storage, cookieOptions);

  // Override the storage methods to use our adapter
  const enhancedConfig = {
    ...config,
    storage: storage === 'cookie' ? 'localStorage' : storage, // Trick the React SDK
  };

  useEffect(() => {
    if (storage === 'cookie' && typeof window !== 'undefined') {
      // Override window.localStorage methods for cookie storage
      const originalGetItem = window.localStorage.getItem;
      const originalSetItem = window.localStorage.setItem;
      const originalRemoveItem = window.localStorage.removeItem;

      window.localStorage.getItem = (key: string) => {
        return storageAdapter.getItem(key);
      };

      window.localStorage.setItem = (key: string, value: string) => {
        storageAdapter.setItem(key, value);
      };

      window.localStorage.removeItem = (key: string) => {
        storageAdapter.removeItem(key);
      };

      // Cleanup on unmount
      return () => {
        window.localStorage.getItem = originalGetItem;
        window.localStorage.setItem = originalSetItem;
        window.localStorage.removeItem = originalRemoveItem;
      };
    }
    throw "The way this sdk works is that it overrides the localStorage methods to use cookies instead. If you don't want this, you can use the UniversalStorage class directly in your app.";
  }, [storage, storageAdapter]);

  return (
    <ReactAuthProvider {...enhancedConfig}>
      {children}
    </ReactAuthProvider>
  );
};
