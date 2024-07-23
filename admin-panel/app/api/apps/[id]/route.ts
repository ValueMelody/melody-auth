import { NextResponse } from 'next/server'
import {
  verifyAccessToken, sendS2SRequest,
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
    uri: `/api/v1/apps/${id}?include_disabled=true`,
  })
  return NextResponse.json(data)
}
