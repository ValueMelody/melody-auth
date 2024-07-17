'use client'

import { OauthProvider } from '@melody-oauth/react'

export default function RootLayout ({ children }: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <OauthProvider
        clientId={process.env.NEXT_PUBLIC_CLIENT_ID ?? ''}
        redirectUri={process.env.NEXT_PUBLIC_REDIRECT_URI ?? ''}
        baseUri={process.env.NEXT_PUBLIC_BASE_URI ?? ''}
      >
        <body>
          {children}
        </body>
      </OauthProvider>
    </html>
  )
}
