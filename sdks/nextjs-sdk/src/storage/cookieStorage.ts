import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import { StorageKey } from '@melody-auth/shared';
import type { NextRequest, NextResponse } from 'next/server';

/**
 * Cookie configuration options
 */
export interface CookieOptions {
  req?: NextRequest;
  res?: NextResponse;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
  path?: string;
  domain?: string;
  maxAge?: number;
}

/**
 * Cookie storage implementation for Next.js
 * Supports both client-side and server-side usage
 */
export class CookieStorage {
  private options: CookieOptions;

  constructor(options: CookieOptions = {}) {
    this.options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      ...options,
    };
  }

  /**
   * Retrieves a value from cookies
   * @param key - The cookie key
   * @returns The value or null if not found
   */
  getItem(key: string): string | null {
    return getCookie(key, this.options) || null;
  }

  /**
   * Stores a value in cookies
   * @param key - The cookie key
   * @param value - The value to store
   */
  setItem(key: string, value: string): void {
    setCookie(key, value, this.options);
  }

  /**
   * Removes a value from cookies
   * @param key - The cookie key
   */
  removeItem(key: string): void {
    deleteCookie(key, this.options);
  }

  // Storage interface compatibility methods
  
  /** Gets the refresh token from cookies */
  get refreshToken(): string | null {
    return this.getItem(StorageKey.RefreshToken);
  }

  /** Sets or removes the refresh token in cookies */
  set refreshToken(value: string | null) {
    if (value) {
      this.setItem(StorageKey.RefreshToken, value);
    } else {
      this.removeItem(StorageKey.RefreshToken);
    }
  }

  /** Gets the ID token from cookies */
  get idToken(): string | null {
    return this.getItem(StorageKey.IdToken);
  }

  /** Sets or removes the ID token in cookies */
  set idToken(value: string | null) {
    if (value) {
      this.setItem(StorageKey.IdToken, value);
    } else {
      this.removeItem(StorageKey.IdToken);
    }
  }

  /** Gets the access token from cookies */
  get accessToken(): string | null {
    return this.getItem('melody-auth-access-token');
  }

  /** Sets or removes the access token in cookies */
  set accessToken(value: string | null) {
    if (value) {
      this.setItem('melody-auth-access-token', value);
    } else {
      this.removeItem('melody-auth-access-token');
    }
  }
}