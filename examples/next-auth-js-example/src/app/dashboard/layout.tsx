'use client'

import { SessionProvider } from 'next-auth/react'
import { PropsWithChildren } from 'react'

export default function RootLayout ({ children }: PropsWithChildren) {
  return (
    <html lang='en'>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
