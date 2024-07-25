import { NextResponse } from 'next/server'
import {
  verifyAccessToken, sendS2SRequest,
  throwForbiddenError,
} from 'app/api/request'

type Params = {
  id: string;
}

export async function GET (
  request: Request, context: { params: Params },
) {
  verifyAccessToken()

  const id = context.params.id

  const data = await sendS2SRequest({
    method: 'GET',
    uri: `/api/v1/roles/${id}?include_disabled=true`,
  })
  return NextResponse.json(data)
}

export async function PUT (
  request: Request, context: { params: Params },
) {
  verifyAccessToken()

  const id = context.params.id

  const reqBody = await request.json()
  if (!reqBody || !reqBody.data) throwForbiddenError()

  const result = await sendS2SRequest({
    method: 'PUT',
    uri: `/api/v1/roles/${id}`,
    body: JSON.stringify(reqBody.data),
  })

  return NextResponse.json(result)
}
