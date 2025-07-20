/**
 * Interface for authentication storage mechanisms.
 * Provides a unified API for storing and retrieving auth tokens.
 */
export interface AuthStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem?: (key: string) => void;
}

/**
 * Supported storage types for authentication tokens.
 * - sessionStorage: Browser session storage (cleared on tab close)
 * - localStorage: Browser local storage (persists across sessions)
 * - cookieStorage: HTTP cookies (works in both browser and server environments)
 */
export type StorageType = 'sessionStorage' | 'localStorage' | 'cookieStorage';

/**
 * Configuration options for cookie storage.
 */
export interface CookieOptions {
  /** Request object for server-side cookie reading */
  request?: Request;
  /** Response object for server-side cookie setting */
  response?: Response;
  /** HttpOnly flag (server-side only) - prevents JavaScript access to cookies */
  httpOnly?: boolean;
  /** Secure flag - cookies only sent over HTTPS */
  secure?: boolean;
  /** SameSite attribute for CSRF protection */
  sameSite?: 'lax' | 'strict' | 'none';
  /** Cookie path scope */
  path?: string;
  /** Cookie domain scope */
  domain?: string;
  /** Cookie expiration in seconds */
  maxAge?: number;
  /** Custom cookie getter function */
  cookieGetter?: (key: string, options: CookieOptions) => string | null;
  /** Custom cookie setter function */
  cookieSetter?: (key: string, value: string, options: CookieOptions) => void;
}

/**
 * Cookie-based storage implementation for authentication tokens.
 * Works in both browser and server (SSR) environments.
 */
export class CookieStorage {
  private options: CookieOptions;

  /**
   * Creates a new CookieStorage instance.
   * @param options - Optional cookie configuration overrides
   */
  constructor(options: Partial<CookieOptions> = {}) {
    this.options = {
      // httpOnly defaults to true for server environments, but has no effect in browsers
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      cookieGetter: defaultCookieGetter,
      cookieSetter: defaultCookieSetter,
      ...options,
    };
  }
  /**
   * Retrieves a value from cookie storage.
   * @param key - The cookie name
   * @returns The cookie value or null if not found
   */
  getItem = (key: string): string | null => {
    return this.options.cookieGetter(key, this.options);
  }

  /**
   * Stores a value in cookie storage.
   * @param key - The cookie name
   * @param value - The value to store
   */
  setItem = (key: string, value: string) => {
    this.options.cookieSetter(key, value, this.options);
  }

  removeItem = (key: string): void => {
    this.setItem(key, '');
  }
};

/**
 * Default cookie getter that works in both browser and server environments.
 * @param key - The cookie name to retrieve
 * @param options - Cookie options including request object for SSR
 * @returns The cookie value or null if not found
 */
export function defaultCookieGetter(key: string, options: CookieOptions): string | null {
  if (typeof document !== 'undefined' && document) {
    const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
      const [k, v] = cookie.split('=');
      acc[k] = decodeURIComponent(v);
      return acc;
    }, {} as Record<string, string>);
    return cookies[key] || null;
  } else if (options.request) {
    const cookies = options.request.headers.get('cookie');
    if (cookies) {
      const cookieMap = Object.fromEntries(cookies.split('; ').map(cookie => {
        const [k, v] = cookie.split('=');
        return [k, decodeURIComponent(v)];
      }));
      return cookieMap[key] || null;
    }
  }
  console.warn('Unable to get cookie: no document or request object available');
  return null;
}

/**
 * Default cookie setter that works in both browser and server environments.
 * @param key - The cookie name
 * @param value - The value to store
 * @param options - Cookie options including response object for SSR
 */
export function defaultCookieSetter(key: string, value: string, options: CookieOptions): void {
  if (typeof document !== 'undefined' && document) {
    // Browser environment
    const cookieParts = [`${key}=${encodeURIComponent(value)}`];

    // Add optional cookie attributes
    if (options.path) cookieParts.push(`Path=${options.path}`);
    if (options.domain) cookieParts.push(`Domain=${options.domain}`);
    if (options.maxAge !== undefined) cookieParts.push(`Max-Age=${options.maxAge}`);
    if (options.secure) cookieParts.push('Secure');
    // Note: HttpOnly cannot be set via JavaScript in browsers - it's a server-only flag
    // This option is ignored in browser context but kept for API consistency
    if (options.sameSite) cookieParts.push(`SameSite=${options.sameSite}`);

    document.cookie = cookieParts.join('; ');
  } else if (options.response) {
    // Server environment (Node.js/Edge runtime)
    const cookieParts = [`${key}=${encodeURIComponent(value)}`];

    // Add optional cookie attributes
    if (options.path) cookieParts.push(`Path=${options.path}`);
    if (options.domain) cookieParts.push(`Domain=${options.domain}`);
    if (options.maxAge !== undefined) cookieParts.push(`Max-Age=${options.maxAge}`);
    if (options.secure) cookieParts.push('Secure');
    if (options.httpOnly) cookieParts.push('HttpOnly');
    if (options.sameSite) cookieParts.push(`SameSite=${options.sameSite}`);

    const cookieValue = cookieParts.join('; ');

    // Set the cookie header on the response
    // Each cookie needs its own Set-Cookie header
    options.response.headers.append('Set-Cookie', cookieValue);
  } else {
    // Neither browser nor server environment available
    console.warn('Unable to set cookie: no document or response object available');
  }
}

export function getStorage(storageType?: StorageType): AuthStorage {
  switch (storageType) {
    case 'sessionStorage':
      return window.sessionStorage;
    case 'localStorage':
      return window.localStorage;
    case 'cookieStorage':
      return new CookieStorage();
    default:
      return window.localStorage;
  }
}
