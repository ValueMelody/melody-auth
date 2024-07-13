'use client'

import React from 'react'
import { OauthProvider } from '@melody-oauth/react'

export default function RootLayout ({ children }: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <OauthProvider
        clientId='12345'
        redirectUri='http://localhost:3000'
        baseUri='http://localhost:8787'
      >
        <body>
          {children}
        </body>
      </OauthProvider>
    </html>
  )
}
