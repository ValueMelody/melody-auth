import { NextResponse } from 'next/server'
import {
  verifyAccessToken, sendS2SRequest,
  throwForbiddenError,
} from 'app/api/request'

type Params = {
  authId: string;
}

export async function GET (
  request: Request, context: { params: Params },
) {
  verifyAccessToken()

  const authId = context.params.authId

  const data = await sendS2SRequest({
    method: 'GET',
    uri: `/users/${authId}?include_disabled=true`,
  })
  return NextResponse.json(data)
}

export async function POST (
  request: Request, context: { params: Params },
) {
  verifyAccessToken()

  const authId = context.params.authId

  const reqBody = await request.json()
  if (!reqBody || !reqBody.action) throwForbiddenError()

  await sendS2SRequest({
    method: 'POST',
    uri: `/users/${authId}/${reqBody.action}`,
  })

  return NextResponse.json({ success: true })
}

export async function PUT (
  request: Request, context: { params: Params },
) {
  verifyAccessToken()

  const authId = context.params.authId

  const reqBody = await request.json()
  if (!reqBody || !reqBody.action) throwForbiddenError()

  await sendS2SRequest({
    method: 'PUT',
    uri: `/users/${authId}/${reqBody.action}`,
  })

  return NextResponse.json({ success: true })
}
