import {
  Provider, InjectionToken,
} from '@angular/core'
import { ProviderConfig } from 'shared'

export const PROVIDER_CONFIG = new InjectionToken<ProviderConfig>('melody-auth.config')

export function provideAuth (config: ProviderConfig): Provider[] {
  return [
    {
      provide: PROVIDER_CONFIG, useValue: config,
    },
  ]
}
