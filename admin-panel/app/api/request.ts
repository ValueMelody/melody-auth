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
  throw NextResponse.json(
    {},
    {
      status: 400, statusText: message,
    },
  )
}

export const verifyAccessToken = () => {
  const headersList = headers()
  const authHeader = headersList.get('authorization')
  const accessToken = authHeader?.split(' ')[1]
  if (!accessToken) throwForbiddenError()

  const tokenBody = jwt.verify(
    accessToken,
    process.env.CLIENT_JWT_SECRET,
  )
  if (!tokenBody) throwForbiddenError()

  if (!tokenBody.roles || !tokenBody.roles.includes(Role.SuperAdmin)) throwForbiddenError()
}

export const obtainS2SAccessToken = async () => {
  if (accessToken && accessTokenExpiresOn) {
    const currentTime = new Date().getTime() / 1000
    if (currentTime + 5 < accessTokenExpiresOn) return accessToken
  }

  const body = {
    grant_type: 'client_credentials',
    scope: `${Scope.READ_USER} ${Scope.WRITE_USER} ${Scope.READ_APP} ${Scope.WRITE_APP} ${Scope.READ_ROLE} ${Scope.WRITE_ROLE}`,
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
    if (!data.scope || !data.access_token || !data.expires_on) {
      throwForbiddenError()
    }

    if (!data.scope.includes('read_user')) throwForbiddenError('read_user scope required.')
    if (!data.scope.includes('write_user')) throwForbiddenError('write_user scope required.')

    accessToken = data.access_token
    accessTokenExpiresOn = data.expires_on

    return accessToken
  } else {
    throwForbiddenError()
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
  const token = await obtainS2SAccessToken()

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
    return data
  } else {
    throwForbiddenError()
  }
}
