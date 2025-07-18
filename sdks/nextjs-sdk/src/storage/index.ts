import { CookieStorage, CookieOptions } from './cookieStorage';

export type StorageType = 'cookie' | 'localStorage' | 'sessionStorage';

export interface NextAuthStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class UniversalStorage implements NextAuthStorage {
  private storage: NextAuthStorage;

  constructor(type: StorageType = 'cookie', options?: CookieOptions) {
    if (typeof window === 'undefined' || type === 'cookie') {
      // Server-side or explicit cookie storage
      this.storage = new CookieStorage(options);
    } else if (type === 'localStorage') {
      this.storage = window.localStorage;
    } else {
      this.storage = window.sessionStorage;
    }
  }

  getItem(key: string): string | null {
    return this.storage.getItem(key);
  }

  setItem(key: string, value: string): void {
    this.storage.setItem(key, value);
  }

  removeItem(key: string): void {
    this.storage.removeItem(key);
  }
}

export { CookieStorage } from './cookieStorage';
export type { CookieOptions } from './cookieStorage';