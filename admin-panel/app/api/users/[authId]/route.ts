import { NextResponse } from 'next/server'
import {
  verifyAccessToken, sendS2SRequest,
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
