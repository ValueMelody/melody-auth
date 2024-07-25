import { NextResponse } from 'next/server'
import {
  verifyAccessToken, sendS2SRequest,
  throwForbiddenError,
} from 'app/api/request'

export async function GET () {
  verifyAccessToken()

  const data = await sendS2SRequest({
    method: 'GET',
    uri: '/api/v1/roles?include_disabled=true',
  })
  return NextResponse.json(data)
}

export async function POST (request: Request) {
  verifyAccessToken()

  const reqBody = await request.json()
  if (!reqBody || !reqBody.data) throwForbiddenError()

  const result = await sendS2SRequest({
    method: 'POST',
    uri: '/api/v1/roles',
    body: JSON.stringify(reqBody.data),
  })

  return NextResponse.json(result)
}
