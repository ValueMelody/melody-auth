import { NextResponse } from 'next/server'
import {
  verifyAccessToken, sendS2SRequest,
} from 'app/api/request'

export async function GET () {
  verifyAccessToken()

  const data = await sendS2SRequest({
    method: 'GET',
    uri: '/api/v1/apps?include_disabled=true',
  })
  return NextResponse.json(data)
}
