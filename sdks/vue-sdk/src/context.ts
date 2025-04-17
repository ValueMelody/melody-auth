import { AuthState as SdkAuthState } from '@melody-auth/shared'
import type { InjectionKey } from 'vue'

export interface AuthState extends SdkAuthState {}

export const melodyAuthInjectionKey = Symbol('InjectionKey for melody auth') as InjectionKey<AuthState>
