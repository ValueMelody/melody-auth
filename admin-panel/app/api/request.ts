import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import {
  Role, Scope,
} from 'shared'

let accessToken: string | null = null
let accessTokenExpiresOn: number | null = null

const basicAuth = btoa(`${process.env.SERVER_CLIENT_ID}:${process.env.SERVER_CLIENT_SECRET}`)

export const throwForbiddenError = (message?: string) => {
  return new NextResponse(
    message,
    { status: 400 },
  )
}

export const verifyAccessToken = () => {
  const headersList = headers()
  const authHeader = headersList.get('authorization')
  const accessToken = authHeader?.split(' ')[1]

  if (!accessToken) return false

  const tokenBody = jwt.verify(
    accessToken,
    process.env.CLIENT_JWT_SECRET,
  )
  if (!tokenBody) return false

  if (!tokenBody.roles || !tokenBody.roles.includes(Role.SuperAdmin)) return false

  return true
}

export const obtainS2SAccessToken = async () => {
  if (accessToken && accessTokenExpiresOn) {
    const currentTime = new Date().getTime() / 1000
    if (currentTime + 5 < accessTokenExpiresOn) return accessToken
  }

  const body = {
    grant_type: 'client_credentials',
    scope: `${Scope.ReadUser} ${Scope.WriteUser} ${Scope.ReadApp} ${Scope.WriteApp} ${Scope.ReadRole} ${Scope.WriteRole} ${Scope.ReadScope} ${Scope.WriteScope}`,
  }
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URI}/oauth2/v1/token`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(body).toString(),
    },
  )
  if (res.ok) {
    const data = await res.json()

    accessToken = data.access_token
    accessTokenExpiresOn = data.expires_on

    return accessToken
  } else {
    return false
  }
}

export const sendS2SRequest = async ({
  method,
  uri,
  body,
}: {
  uri: string;
  method: 'GET' | 'POST' | 'PUT';
  body?: string;
}) => {
  const isValid = verifyAccessToken()
  if (!isValid) return throwForbiddenError()

  const token = await obtainS2SAccessToken()
  if (!token) return throwForbiddenError()

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URI}${uri}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ?? undefined,
    },
  )
  if (res.ok) {
    const data = await res.json()
    return NextResponse.json(data)
  } else {
    const error = await res.text()
    return throwForbiddenError(error)
  }
}
