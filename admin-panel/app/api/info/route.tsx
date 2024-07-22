import { NextResponse } from 'next/server'
import { sendS2SRequest } from 'app/api/request'

export async function GET () {
  const data = await sendS2SRequest({
    method: 'GET',
    uri: '/info',
  })
  return NextResponse.json(data)
}
