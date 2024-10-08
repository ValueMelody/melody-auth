import { errorSignal } from 'signals'

export const sendNextRequest = async ({
  endpoint,
  method,
  token,
  body,
}: {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  token?: string;
  body?: object;
}) => {
  const res = await fetch(
    endpoint,
    {
      method,
      headers: {
        Authorization: token ? `bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  )
  if (res.ok) {
    errorSignal.value = ''
    const data = await res.json()
    return data
  } else {
    const msg = await res.text()
    errorSignal.value = msg
  }
}
